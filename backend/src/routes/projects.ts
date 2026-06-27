import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const projects = await prisma.project.findMany({
    where: { userId: req.user!.id },
    include: { skillGap: { include: { targetRole: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(projects);
});

router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const projectId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: req.user!.id },
    include: { skillGap: { include: { targetRole: true } } },
  });
  if (!project) { res.status(404).json({ error: 'Proyecto no encontrado' }); return; }
  res.json(project);
});

const updateSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED']).optional(),
  progress: z.number().min(0).max(100).optional(),
  githubUrl: z.string().url().optional(),
});

router.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }

  const projectId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const project = await prisma.project.findFirst({ where: { id: projectId, userId: req.user!.id } });
  if (!project) { res.status(404).json({ error: 'Proyecto no encontrado' }); return; }

  const data: any = { ...parsed.data };
  if (parsed.data.status === 'IN_PROGRESS' && !project.startedAt) data.startedAt = new Date();
  if (parsed.data.status === 'COMPLETED') data.completedAt = new Date();

  const updated = await prisma.project.update({ where: { id: projectId }, data });
  res.json(updated);
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const projectId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const project = await prisma.project.findFirst({ where: { id: projectId, userId: req.user!.id } });
  if (!project) { res.status(404).json({ error: 'Proyecto no encontrado' }); return; }
  await prisma.project.delete({ where: { id: projectId } });
  res.json({ ok: true });
});

export default router;
