import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();
router.use(authMiddleware);

router.get('/profile', async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: {
      profile: {
        include: {
          targetRoles: { where: { isActive: true } },
          skillGaps: { orderBy: { priority: 'asc' } },
        },
      },
      subscription: true,
    },
  });
  if (!user) { res.status(404).json({ error: 'Usuario no encontrado' }); return; }
  res.json(user);
});

const profileUpdateSchema = z.object({
  githubUsername: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  bio: z.string().max(500).optional(),
  yearsOfExp: z.number().min(0).max(50).optional(),
  currentRole: z.string().optional(),
});

router.patch('/profile', async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = profileUpdateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }

  const profile = await prisma.profile.upsert({
    where: { userId: req.user!.id },
    update: parsed.data,
    create: { userId: req.user!.id, ...parsed.data },
  });
  res.json(profile);
});

const userUpdateSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  avatarUrl: z.string().url().optional(),
});

router.patch('/me', async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = userUpdateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }

  if (parsed.data.username) {
    const taken = await prisma.user.findFirst({
      where: { username: parsed.data.username, id: { not: req.user!.id } },
    });
    if (taken) { res.status(409).json({ error: 'Nombre de usuario ya en uso' }); return; }
  }

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: parsed.data,
  });
  res.json(user);
});

router.get('/dashboard', async (req: AuthRequest, res: Response): Promise<void> => {
  const profile = await prisma.profile.findUnique({
    where: { userId: req.user!.id },
    include: {
      targetRoles: { where: { isActive: true }, orderBy: { createdAt: 'desc' }, take: 1 },
      skillGaps: {
        orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
        take: 5,
      },
    },
  });

  const projects = await prisma.project.findMany({
    where: { userId: req.user!.id },
    orderBy: { updatedAt: 'desc' },
    take: 5,
  });

  const skills = profile?.skills ? JSON.parse(profile.skills) : [];

  res.json({
    matchScore: profile?.targetRoles[0]?.matchScore ?? 0,
    targetRole: profile?.targetRoles[0] ?? null,
    skillGaps: profile?.skillGaps ?? [],
    skills,
    recentProjects: projects,
  });
});

export default router;
