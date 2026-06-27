import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { prisma } from '../db';

const router = Router();
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET no está configurada en las variables de entorno');
}
const JWT_SECRET: string = process.env.JWT_SECRET;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Intenta de nuevo en unos minutos.' },
});

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  username: z.string()
    .min(3, 'Usuario debe tener al menos 3 caracteres')
    .max(30, 'Usuario debe tener máximo 30 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Usuario solo puede contener letras, números, guiones y guiones bajos'),
  password: z.string().min(8, 'Contraseña debe tener al menos 8 caracteres'),
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

function signToken(user: { id: string; email: string; role: string; plan: string }) {
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];

  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, plan: user.plan },
    JWT_SECRET,
    { expiresIn, algorithm: 'HS256' }
  );
}

router.post('/register', authLimiter, async (req: Request, res: Response): Promise<void> => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const { email, username, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    res.status(409).json({ error: 'Email o usuario ya registrado' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      profile: { create: {} },
      subscription: {
        create: {
          plan: 'FREE',
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  const token = signToken({ id: user.id, email: user.email, role: user.role, plan: user.plan });
  res.status(201).json({ token, user: { id: user.id, email: user.email, username: user.username, plan: user.plan } });
});

router.post('/login', authLimiter, async (req: Request, res: Response): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.passwordHash) {
    res.status(401).json({ error: 'Credenciales inválidas' });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Credenciales inválidas' });
    return;
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role, plan: user.plan });
  res.json({ token, user: { id: user.id, email: user.email, username: user.username, plan: user.plan, avatarUrl: user.avatarUrl } });
});

// GitHub OAuth callback
router.post('/github', async (req: Request, res: Response): Promise<void> => {
  const { code } = req.body;
  if (!code) {
    res.status(400).json({ error: 'Código OAuth requerido' });
    return;
  }

  try {
    // Intercambiar código por token de acceso
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenRes.json() as { access_token?: string; error?: string };
    if (!tokenData.access_token) {
      res.status(400).json({ error: 'No se pudo obtener token de GitHub' });
      return;
    }

    // Obtener datos del usuario de GitHub
    const ghUserRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `token ${tokenData.access_token}`, Accept: 'application/vnd.github.v3+json' },
    });
    const ghUser = await ghUserRes.json() as { id: number; login: string; name: string | null; avatar_url: string; email: string | null };

    // Obtener email si no está en el perfil público
    let email = ghUser.email;
    if (!email) {
      const emailsRes = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `token ${tokenData.access_token}` },
      });
      const emails = await emailsRes.json() as Array<{ email: string; primary: boolean; verified: boolean }>;
      const primaryEmail = emails.find((e) => e.primary && e.verified);
      email = primaryEmail?.email || null;
    }

    if (!email) {
      res.status(400).json({ error: 'No se pudo obtener email de GitHub. Verifica que tu email sea público.' });
      return;
    }

    // Upsert usuario
    let user = await prisma.user.findFirst({
      where: { OR: [{ githubId: String(ghUser.id) }, { email }] },
    });

    if (!user) {
      const baseUsername = ghUser.login.replace(/[^a-zA-Z0-9_-]/g, '_');
      let username = baseUsername;
      let suffix = 0;
      while (await prisma.user.findUnique({ where: { username } })) {
        suffix++;
        username = `${baseUsername}_${suffix}`;
      }

      user = await prisma.user.create({
        data: {
          email,
          username,
          githubId: String(ghUser.id),
          avatarUrl: ghUser.avatar_url,
          profile: { create: { githubUsername: ghUser.login } },
          subscription: {
            create: {
              plan: 'FREE',
              status: 'ACTIVE',
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { githubId: String(ghUser.id), avatarUrl: ghUser.avatar_url },
      });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role, plan: user.plan });
    res.json({
      token,
      user: { id: user.id, email: user.email, username: user.username, plan: user.plan, avatarUrl: user.avatarUrl },
      githubToken: tokenData.access_token,
    });
  } catch (err) {
    console.error('GitHub OAuth error:', err);
    res.status(500).json({ error: 'Error en autenticación con GitHub' });
  }
});

router.get('/me', async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No autenticado' });
    return;
  }
  try {
    const payload = jwt.verify(authHeader.split(' ')[1], JWT_SECRET, { algorithms: ['HS256'] }) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: { profile: true, subscription: true },
    });
    if (!user) { res.status(404).json({ error: 'Usuario no encontrado' }); return; }
    res.json(user);
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
});

export default router;
