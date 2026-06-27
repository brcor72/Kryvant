import { GitHubRepo, GitHubUser, SkillAnalysis, GapAnalysis } from '../types';

const GITHUB_API = 'https://api.github.com';

function getHeaders(token?: string) {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  const t = token || process.env.GITHUB_TOKEN;
  if (t) headers['Authorization'] = `token ${t}`;
  return headers;
}

export async function getGitHubUser(username: string, token?: string): Promise<GitHubUser> {
  const res = await fetch(`${GITHUB_API}/users/${username}`, { headers: getHeaders(token) });
  if (res.ok) return res.json() as Promise<GitHubUser>;

  if (res.status === 404) {
    throw new Error(`Usuario de GitHub no encontrado: ${username}`);
  }

  if (res.status === 401) {
    throw new Error('Autenticación con GitHub falló. Revisa tu token de GitHub.');
  }

  if (res.status === 403) {
    throw new Error('Acceso a GitHub denegado o límite de tasa alcanzado. Usa un token personal válido.');
  }

  const errorData = await res.json().catch(() => null) as { message?: string } | null;
  throw new Error(errorData?.message || `Error al consultar GitHub: ${res.statusText}`);
}

export async function getUserRepos(username: string, token?: string): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  let page = 1;

  while (page <= 5) {
    const res = await fetch(
      `${GITHUB_API}/users/${username}/repos?per_page=100&page=${page}&sort=updated`,
      { headers: getHeaders(token) }
    );
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`Usuario de GitHub no encontrado: ${username}`);
      }
      if (res.status === 403) {
        throw new Error('Acceso a GitHub denegado o límite de tasa alcanzado. Usa un token personal válido.');
      }
      const errorData = await res.json().catch(() => null) as { message?: string } | null;
      throw new Error(errorData?.message || `Error al consultar repos de GitHub: ${res.statusText}`);
    }
    const batch = (await res.json()) as GitHubRepo[];
    if (batch.length === 0) break;
    repos.push(...batch);
    page++;
  }

  return repos;
}

export async function getRepoLanguages(
  owner: string,
  repo: string,
  token?: string
): Promise<Record<string, number>> {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/languages`, {
    headers: getHeaders(token),
  });
  if (!res.ok) return {};
  return res.json() as Promise<Record<string, number>>;
}

export async function analyzeUserSkills(
  username: string,
  token?: string
): Promise<SkillAnalysis[]> {
  const repos = await getUserRepos(username, token);

  const languageBytes: Record<string, number> = {};
  const languageRepoCount: Record<string, number> = {};

  for (const repo of repos.slice(0, 30)) {
    if (repo.language) {
      languageRepoCount[repo.language] = (languageRepoCount[repo.language] || 0) + 1;
    }

    const langs = await getRepoLanguages(username, repo.name, token);
    for (const [lang, bytes] of Object.entries(langs)) {
      languageBytes[lang] = (languageBytes[lang] || 0) + bytes;
    }
  }

  const totalBytes = Object.values(languageBytes).reduce((a, b) => a + b, 0);
  if (totalBytes === 0) return [];

  const skills: SkillAnalysis[] = Object.entries(languageBytes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([skill, bytes]) => {
      const percentage = (bytes / totalBytes) * 100;
      const repoCount = languageRepoCount[skill] || 0;

      let level: SkillAnalysis['level'];
      let matchPercent: number;

      if (percentage > 30 || repoCount >= 8) {
        level = 'Experto';
        matchPercent = Math.min(95, 70 + percentage);
      } else if (percentage > 15 || repoCount >= 4) {
        level = 'Avanzado';
        matchPercent = Math.min(85, 55 + percentage);
      } else if (percentage > 5 || repoCount >= 2) {
        level = 'Intermedio';
        matchPercent = Math.min(70, 40 + percentage);
      } else {
        level = 'Junior';
        matchPercent = Math.min(50, 20 + percentage);
      }

      return { skill, level, matchPercent: Math.round(matchPercent), repoCount };
    });

  return skills;
}

const ROLE_REQUIREMENTS: Record<string, string[]> = {
  'Google': ['Python', 'Go', 'Java', 'C++', 'Kubernetes', 'gRPC', 'Distributed Systems'],
  'Meta': ['C++', 'Python', 'Hack', 'React', 'GraphQL', 'PyTorch', 'LLVM'],
  'Microsoft': ['C#', 'TypeScript', 'Azure', 'Rust', 'C++', 'PowerShell'],
  'NVIDIA': ['C++', 'CUDA', 'Python', 'OpenGL', 'Vulkan', 'LLVM', 'Assembly'],
  'Amazon': ['Java', 'Python', 'Go', 'AWS', 'DynamoDB', 'Kafka', 'Rust'],
  'Apple': ['Swift', 'Objective-C', 'C++', 'Metal', 'Python', 'CoreML'],
  'OpenAI': ['Python', 'PyTorch', 'CUDA', 'C++', 'Rust', 'Kubernetes'],
  'default': ['Python', 'TypeScript', 'Go', 'Rust', 'Kubernetes', 'PostgreSQL'],
};

export function computeGaps(
  userSkills: SkillAnalysis[],
  targetCompany: string,
  targetRole: string
): GapAnalysis[] {
  const requirements =
    ROLE_REQUIREMENTS[targetCompany] || ROLE_REQUIREMENTS['default'];
  const userSkillNames = new Set(userSkills.map((s) => s.skill.toLowerCase()));

  const gaps: GapAnalysis[] = [];

  for (const req of requirements) {
    const hasSkill = userSkillNames.has(req.toLowerCase());
    const userSkill = userSkills.find((s) => s.skill.toLowerCase() === req.toLowerCase());

    if (!hasSkill || (userSkill && userSkill.matchPercent < 60)) {
      const isHighPriority = requirements.indexOf(req) < 3;

      gaps.push({
        title: `${req} para ${targetRole}`,
        description: `Dominio de ${req} requerido para el rol de ${targetRole} en ${targetCompany}`,
        priority: isHighPriority ? 'HIGH' : 'MEDIUM',
        estimatedDays: isHighPriority ? 3 : 5,
        recommendedProject: generateProjectRecommendation(req, targetCompany),
      });
    }
  }

  return gaps.slice(0, 6);
}

function generateProjectRecommendation(skill: string, company: string): string {
  const projects: Record<string, string> = {
    'C++': 'Construir un asignador de memoria personalizado con gestión de pools',
    'CUDA': 'Implementar multiplicación de matrices paralela en GPU con optimización de memoria compartida',
    'Go': 'Desarrollar un servidor HTTP2 con manejo de conexiones concurrentes tipo goroutine pool',
    'Rust': 'Crear un parser de protocolos binarios zero-copy con lifetimes explícitos',
    'Python': 'Construir un pipeline de ML con PyTorch y optimización de hiperparámetros',
    'Kubernetes': 'Desplegar una arquitectura de microservicios con HPA y service mesh',
    'gRPC': 'Implementar comunicación inter-servicio con streaming bidireccional y protobuf',
    'PyTorch': 'Entrenar un transformer desde cero con atención multi-cabeza personalizada',
    'LLVM': 'Escribir un compilador de lenguaje simple con optimizaciones de IR',
    'Kafka': 'Construir un sistema de procesamiento de eventos en tiempo real con particionado',
  };
  return projects[skill] || `Construir un proyecto avanzado demostrando dominio de ${skill} para estándares de ${company}`;
}
