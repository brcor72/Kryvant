import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authMiddleware } from '../middleware/auth';
import { AuthRequest } from '../types';
import { analyzeUserSkills, computeGaps, getGitHubUser, getUserRepos } from '../services/githubService';
import { analyzeWithGroq } from '../services/groqService';

const router = Router();
router.use(authMiddleware);

const analyzeSchema = z.object({
  githubUsername: z.string().min(1),
  targetCompany: z.string().min(1),
  targetTitle: z.string().min(1),
  targetLevel: z.string().default('Senior'),
  githubToken: z.string().optional(),
});

function normalizeGitHubUsername(input: string) {
  let username = input.trim();
  username = username.replace(/^(https?:\/\/)?(www\.)?github\.com\//i, '');
  username = username.replace(/\?.*$/, '');
  username = username.replace(/\/$/, '');
  return username;
}

router.post('/analyze', async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = analyzeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  let { githubUsername, targetCompany, targetTitle, targetLevel, githubToken } = parsed.data;
  githubUsername = normalizeGitHubUsername(githubUsername);

  try {
    // 1. Verificar usuario de GitHub existe
    const ghUser = await getGitHubUser(githubUsername, githubToken);

    // 2. Analizar skills
    const skills = await analyzeUserSkills(githubUsername, githubToken);

    // 3. Calcular brechas y match score: intenta IA real (Groq/Llama) primero,
    // y cae al cálculo determinístico si no hay API key o la IA falla.
    let gaps;
    let matchScore: number;
    let summary: string | null = null;

    try {
      const topRepos = await getUserRepos(githubUsername, githubToken);
      const aiResult = await analyzeWithGroq(ghUser, skills, topRepos, targetCompany, targetTitle, targetLevel);
      gaps = aiResult.gaps;
      matchScore = aiResult.matchScore;
      summary = aiResult.summary;
    } catch (aiErr: any) {
      console.warn('Groq no disponible, usando análisis determinístico:', aiErr.message);
      gaps = computeGaps(skills, targetCompany, targetTitle);
      const totalRequirements = gaps.length + skills.filter((s) => s.matchPercent >= 60).length;
      const matchedRequirements = skills.filter((s) => s.matchPercent >= 60).length;
      matchScore = totalRequirements > 0
        ? Math.round((matchedRequirements / totalRequirements) * 100)
        : 50;
    }

    // 5. Guardar en BD
    const profile = await prisma.profile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) { res.status(404).json({ error: 'Perfil no encontrado' }); return; }

    // Actualizar profile con skills y github username
    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        githubUsername,
        skills: JSON.stringify(skills),
      },
    });

    // Crear o actualizar TargetRole
    let targetRole = await prisma.targetRole.findFirst({
      where: { profileId: profile.id, company: targetCompany, title: targetTitle, isActive: true },
    });

    if (targetRole) {
      targetRole = await prisma.targetRole.update({
        where: { id: targetRole.id },
        data: {
          matchScore,
          summary,
          requirements: JSON.stringify([targetTitle, targetCompany, targetLevel]),
        },
      });
    } else {
      targetRole = await prisma.targetRole.create({
        data: {
          profileId: profile.id,
          company: targetCompany,
          title: targetTitle,
          level: targetLevel,
          matchScore,
          summary,
          requirements: JSON.stringify([targetTitle, targetCompany, targetLevel]),
        },
      });
    }

    // Eliminar gaps anteriores y crear nuevos
    await prisma.skillGap.deleteMany({ where: { profileId: profile.id, targetRoleId: targetRole.id } });

    const createdGaps = await Promise.all(
      gaps.map((gap) =>
        prisma.skillGap.create({
          data: {
            profileId: profile.id,
            targetRoleId: targetRole!.id,
            title: gap.title,
            description: gap.description,
            priority: gap.priority as any,
            estimatedDays: gap.estimatedDays,
          },
        })
      )
    );

    // Crear proyectos recomendados para cada brecha
    for (let i = 0; i < gaps.length; i++) {
      const gap = gaps[i];
      const skillGap = createdGaps[i];

      const existing = await prisma.project.findUnique({ where: { skillGapId: skillGap.id } });
      if (!existing) {
        await prisma.project.create({
          data: {
            userId: req.user!.id,
            skillGapId: skillGap.id,
            title: gap.title,
            description: gap.recommendedProject,
            techStack: JSON.stringify([gap.title.split(' ')[0]]),
            difficulty: gap.priority === 'HIGH' ? 'HARD' : 'MEDIUM',
          },
        });
      }
    }

    res.json({
      githubUser: { login: ghUser.login, name: ghUser.name, avatarUrl: ghUser.avatar_url },
      skills,
      gaps: createdGaps,
      matchScore,
      targetRole,
    });
  } catch (err: any) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: err.message || 'Error al analizar perfil' });
  }
});

router.get('/results', async (req: AuthRequest, res: Response): Promise<void> => {
  const profile = await prisma.profile.findUnique({
    where: { userId: req.user!.id },
    include: {
      targetRoles: { where: { isActive: true }, orderBy: { createdAt: 'desc' }, take: 1 },
      skillGaps: { include: { project: true }, orderBy: { priority: 'asc' } },
    },
  });

  if (!profile) { res.status(404).json({ error: 'Perfil no encontrado' }); return; }

  const skills = profile.skills ? JSON.parse(profile.skills) : [];
  res.json({ profile, skills });
});

export default router;
