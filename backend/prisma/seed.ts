import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando base de datos...');

  const passwordHash = await bcrypt.hash('password123', 12);

  // 1. Crear usuario
  const user = await prisma.user.upsert({
    where: { email: 'demo@kryvant.com' },
    update: {},
    create: {
      email: 'demo@kryvant.com',
      username: 'demo_dev',
      passwordHash,
      plan: 'PRO',
      avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
    },
  });

  // 2. Crear perfil
  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      githubUsername: 'torvalds',
      bio: 'Desarrollador apasionado buscando entrar a Big Tech',
      yearsOfExp: 4,
      currentRole: 'Mid Software Engineer',
      skills: JSON.stringify([
        { skill: 'Python', level: 'Experto', matchPercent: 95, repoCount: 12 },
        { skill: 'TypeScript', level: 'Avanzado', matchPercent: 78, repoCount: 8 },
        { skill: 'Docker', level: 'Intermedio', matchPercent: 65, repoCount: 5 },
        { skill: 'Go', level: 'Junior', matchPercent: 42, repoCount: 2 },
      ]),
    },
  });

  // 3. Crear suscripción
  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      plan: 'PRO',
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // 4. Crear rol objetivo
  const targetRole = await prisma.targetRole.create({
    data: {
      profileId: profile.id,
      company: 'NVIDIA',
      title: 'Ingeniero Senior C++',
      level: 'Senior',
      matchScore: 68,
      requirements: JSON.stringify(['C++', 'CUDA', 'Python', 'OpenGL', 'Vulkan', 'LLVM']),
    },
  });

  // 5. Crear brechas de habilidades
  const gapData = [
    { title: 'Gestión Manual de Memoria en C++ (Allocators)', description: 'Dominio de memory allocators, RAII, smart pointers avanzados', priority: 'HIGH', estimatedDays: 3 },
    { title: 'Implementación gRPC y Protobuf', description: 'Comunicación inter-servicio con streaming bidireccional', priority: 'MEDIUM', estimatedDays: 5 },
    { title: 'Estructuras de datos lock-free', description: 'Colas y stacks sin bloqueos usando atomics', priority: 'HIGH', estimatedDays: 4 },
  ];

  for (const gap of gapData) {
    const skillGap = await prisma.skillGap.create({
      data: { profileId: profile.id, targetRoleId: targetRole.id, ...gap },
    });

    await prisma.project.create({
      data: {
        userId: user.id,
        skillGapId: skillGap.id,
        title: gap.title,
        description: `Proyecto para cerrar la brecha: ${gap.title}`,
        techStack: JSON.stringify(['C++']),
        difficulty: gap.priority === 'HIGH' ? 'HARD' : 'MEDIUM',
        status: gap.title.includes('gRPC') ? 'IN_PROGRESS' : 'PENDING',
        progress: gap.title.includes('gRPC') ? 30 : 0,
      },
    });
  }

  console.log('✅ Usuario demo: demo@kryvant.com / password123');
  console.log('✅ Base de datos sembrada correctamente');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
