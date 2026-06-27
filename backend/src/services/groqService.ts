import { GitHubRepo, GitHubUser, SkillAnalysis, GapAnalysis } from '../types';

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export interface AiAnalysisResult {
  gaps: GapAnalysis[];
  matchScore: number;
  summary: string;
}

interface GroqGapItem {
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedDays: number;
  recommendedProject: string;
}

interface GroqResponseShape {
  matchScore: number;
  summary: string;
  gaps: GroqGapItem[];
}

function buildPrompt(
  ghUser: GitHubUser,
  skills: SkillAnalysis[],
  topRepos: GitHubRepo[],
  targetCompany: string,
  targetTitle: string,
  targetLevel: string
): string {
  const skillsText = skills
    .map((s) => `- ${s.skill}: nivel ${s.level}, ${s.matchPercent}% dominio, ${s.repoCount} repos`)
    .join('\n') || '(sin lenguajes detectados)';

  const reposText = topRepos
    .slice(0, 10)
    .map((r) => `- ${r.name}${r.description ? `: ${r.description}` : ''} (lenguaje: ${r.language || 'N/A'}, stars: ${r.stargazers_count})`)
    .join('\n') || '(sin repositorios públicos)';

  return `Eres un evaluador técnico senior. Analiza el siguiente perfil real de GitHub y genera un análisis de brechas de habilidades para el rol objetivo.

PERFIL DE GITHUB:
- Usuario: ${ghUser.login}
- Nombre: ${ghUser.name || 'N/A'}
- Bio: ${ghUser.bio || 'N/A'}
- Repos públicos: ${ghUser.public_repos}
- Seguidores: ${ghUser.followers}

SKILLS DETECTADOS (por análisis de bytes de código):
${skillsText}

REPOSITORIOS DESTACADOS:
${reposText}

ROL OBJETIVO:
- Empresa: ${targetCompany}
- Puesto: ${targetTitle}
- Nivel: ${targetLevel}

Responde ÚNICAMENTE con un JSON válido (sin markdown, sin texto adicional) con esta forma exacta:
{
  "matchScore": <number 0-100, qué tan listo está el candidato para el rol>,
  "summary": "<resumen breve en español, 2-3 frases, sobre el nivel del candidato y su mayor fortaleza/debilidad>",
  "gaps": [
    {
      "title": "<nombre corto de la brecha de habilidad>",
      "description": "<por qué es relevante para el rol objetivo>",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "estimatedDays": <number, días estimados para cerrar la brecha>,
      "recommendedProject": "<proyecto práctico concreto y específico para cerrar esta brecha>"
    }
  ]
}
Genera entre 3 y 6 brechas, ordenadas por prioridad.`;
}

function parseGroqJson(content: string): GroqResponseShape {
  let text = content.trim();
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) text = fenceMatch[1].trim();

  const parsed = JSON.parse(text);
  if (
    typeof parsed.matchScore !== 'number' ||
    typeof parsed.summary !== 'string' ||
    !Array.isArray(parsed.gaps)
  ) {
    throw new Error('Respuesta de Groq con forma inesperada');
  }
  return parsed as GroqResponseShape;
}

export async function analyzeWithGroq(
  ghUser: GitHubUser,
  skills: SkillAnalysis[],
  topRepos: GitHubRepo[],
  targetCompany: string,
  targetTitle: string,
  targetLevel: string
): Promise<AiAnalysisResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY no configurada');
  }

  const prompt = buildPrompt(ghUser, skills, topRepos, targetCompany, targetTitle, targetLevel);

  const res = await fetch(GROQ_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`Groq API error ${res.status}: ${errBody.slice(0, 200)}`);
  }

  const data = await res.json() as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Groq no devolvió contenido');

  const parsed = parseGroqJson(content);

  const gaps: GapAnalysis[] = parsed.gaps.slice(0, 6).map((g) => ({
    title: g.title,
    description: g.description,
    priority: g.priority,
    estimatedDays: g.estimatedDays,
    recommendedProject: g.recommendedProject,
  }));

  return {
    gaps,
    matchScore: Math.max(0, Math.min(100, Math.round(parsed.matchScore))),
    summary: parsed.summary,
  };
}
