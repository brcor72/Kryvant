import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const teams = await prisma.team.findMany({
    where: { OR: [{ ownerId: req.user!.id }, { members: { some: { userId: req.user!.id } } }] },
    include: { members: { include: { user: { select: { id: true, username: true, email: true, avatarUrl: true, plan: true } } } } },
  });
  res.json(teams);
});

const createTeamSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(30).regex(/^[a-z0-9-]+$/),
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = createTeamSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }

  const existing = await prisma.team.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) { res.status(409).json({ error: 'Slug de equipo ya en uso' }); return; }

  const team = await prisma.team.create({
    data: {
      ...parsed.data,
      ownerId: req.user!.id,
      members: {
        create: { userId: req.user!.id, teamRole: 'OWNER' },
      },
    },
    include: { members: true },
  });
  res.status(201).json(team);
});

router.post('/:id/invite', async (req: AuthRequest, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) { res.status(400).json({ error: 'Email requerido' }); return; }

  const teamId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const team = await prisma.team.findFirst({
    where: { id: teamId, OR: [{ ownerId: req.user!.id }, { members: { some: { userId: req.user!.id, teamRole: { in: ['OWNER', 'ADMIN'] } } } }] },
  });
  if (!team) { res.status(403).json({ error: 'Sin permisos para invitar' }); return; }

  const invitedUser = await prisma.user.findUnique({ where: { email } });
  if (!invitedUser) { res.status(404).json({ error: 'Usuario no encontrado. Debe registrarse primero.' }); return; }

  const existingMember = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: team.id, userId: invitedUser.id } },
  });
  if (existingMember) { res.status(409).json({ error: 'Ya es miembro del equipo' }); return; }

  const member = await prisma.teamMember.create({
    data: { teamId: team.id, userId: invitedUser.id, teamRole: 'MEMBER' },
    include: { user: { select: { id: true, username: true, email: true, avatarUrl: true } } },
  });
  res.status(201).json(member);
});

router.get('/:id/members', async (req: AuthRequest, res: Response): Promise<void> => {
  const teamId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const isMember = await prisma.teamMember.findFirst({ where: { teamId, userId: req.user!.id } });
  if (!isMember) { res.status(403).json({ error: 'No eres miembro de este equipo' }); return; }

  const members = await prisma.teamMember.findMany({
    where: { teamId },
    include: {
      user: {
        select: { id: true, username: true, email: true, avatarUrl: true, plan: true },
        include: { profile: { select: { skills: true, currentRole: true, githubUsername: true } } },
      },
    },
  });
  res.json(members);
});

export default router;
