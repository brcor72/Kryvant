import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const subscription = await prisma.subscription.findUnique({ where: { userId: req.user!.id } });
  res.json(subscription);
});

const upgradeSchema = z.object({
  plan: z.enum(['PRO', 'ENTERPRISE']),
});

router.post('/upgrade', async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = upgradeSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }

  // En producción aquí iría Stripe para procesar el pago
  // Por ahora actualizamos directamente
  const subscription = await prisma.subscription.upsert({
    where: { userId: req.user!.id },
    update: {
      plan: parsed.data.plan,
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    create: {
      userId: req.user!.id,
      plan: parsed.data.plan,
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.user.update({
    where: { id: req.user!.id },
    data: { plan: parsed.data.plan },
  });

  res.json({ ok: true, subscription });
});

router.post('/cancel', async (req: AuthRequest, res: Response): Promise<void> => {
  const subscription = await prisma.subscription.update({
    where: { userId: req.user!.id },
    data: { cancelAtPeriodEnd: true },
  });
  res.json({ ok: true, subscription });
});

export default router;
