# KRYVANT — Código Original para Registro de Propiedad Intelectual

**Titular:** [Tu Nombre Completo]
**Fecha de creación:** 20 de junio de 2026
**Naturaleza:** Software original — Obra protegida por derechos de autor (Copyright)

---

> ⚠️ NOTA LEGAL IMPORTANTE
> En la mayoría de países (incluyendo México, España, EE.UU.), el **código fuente de software
> está automáticamente protegido por derechos de autor (copyright)** desde el momento de su
> creación. No requiere registro formal, aunque registrarlo ante el INDAUTOR (México),
> la Propiedad Intelectual de España o el U.S. Copyright Office fortalece tu posición legal.
>
> Los **procesos y algoritmos** sí pueden ser sujetos a **patente de invención**, con requisitos
> más estrictos: novedad, actividad inventiva y aplicación industrial.

---

## DESCRIPCIÓN DE LA INVENCIÓN / OBRA

**Título:** KRYVANT — Sistema Automatizado de Análisis de Brechas de Habilidades Técnicas
con Prescripción de Proyectos de Práctica Orientados a Empleo en Empresas de Alta Tecnología

**Resumen:**
Sistema informático que, mediante el análisis automatizado de repositorios públicos de código
fuente de un usuario (vía GitHub API), determina cuantitativamente sus habilidades técnicas,
las compara contra los requisitos de un rol objetivo específico en una empresa de tecnología
(Google, NVIDIA, Meta, Microsoft, Amazon, Apple, OpenAI, etc.), y prescribe proyectos de
práctica personalizados con duración estimada para cerrar cada brecha identificada.

---

## PARTE 1 — ALGORITMO CENTRAL: ANÁLISIS DE BRECHAS

### 1.1 Motor de Análisis de Habilidades por Repositorio

**Archivo:** `backend/src/services/githubService.ts`
**Función:** `analyzeUserSkills()`

```typescript
// COPYRIGHT (C) 2026 — KRYVANT — TODOS LOS DERECHOS RESERVADOS
// Algoritmo original de cuantificación de habilidades por análisis
// de distribución de bytes de código en repositorios de GitHub.

export async function analyzeUserSkills(
  username: string,
  token?: string
): Promise<SkillAnalysis[]> {
  const repos = await getUserRepos(username, token);

  const languageBytes: Record<string, number> = {};
  const languageRepoCount: Record<string, number> = {};

  // Análisis de los últimos 30 repositorios por actividad
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

  // ALGORITMO DE CLASIFICACIÓN DE NIVEL POR DISTRIBUCIÓN DE BYTES
  // Innovación: doble criterio (bytes relativos + conteo de repos)
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
```

**Aspecto novedoso:** El algoritmo utiliza un sistema de doble criterio (proporción de bytes
de código + frecuencia de uso en repositorios) para calcular un nivel de dominio estimado y
un porcentaje de coincidencia con los requisitos del rol objetivo. Esta combinación de métricas
no está documentada en sistemas previos conocidos.

---

### 1.2 Motor de Cálculo de Brechas por Empresa Objetivo

**Archivo:** `backend/src/services/githubService.ts`
**Función:** `computeGaps()`

```typescript
// COPYRIGHT (C) 2026 — KRYVANT — TODOS LOS DERECHOS RESERVADOS
// Mapa propietario de requisitos técnicos por empresa de Big Tech.
// Algoritmo de comparación y prescripción de brecha.

const ROLE_REQUIREMENTS: Record<string, string[]> = {
  'Google':    ['Python', 'Go', 'Java', 'C++', 'Kubernetes', 'gRPC', 'Distributed Systems'],
  'Meta':      ['C++', 'Python', 'Hack', 'React', 'GraphQL', 'PyTorch', 'LLVM'],
  'Microsoft': ['C#', 'TypeScript', 'Azure', 'Rust', 'C++', 'PowerShell'],
  'NVIDIA':    ['C++', 'CUDA', 'Python', 'OpenGL', 'Vulkan', 'LLVM', 'Assembly'],
  'Amazon':    ['Java', 'Python', 'Go', 'AWS', 'DynamoDB', 'Kafka', 'Rust'],
  'Apple':     ['Swift', 'Objective-C', 'C++', 'Metal', 'Python', 'CoreML'],
  'OpenAI':    ['Python', 'PyTorch', 'CUDA', 'C++', 'Rust', 'Kubernetes'],
  'default':   ['Python', 'TypeScript', 'Go', 'Rust', 'Kubernetes', 'PostgreSQL'],
};

export function computeGaps(
  userSkills: SkillAnalysis[],
  targetCompany: string,
  targetRole: string
): GapAnalysis[] {
  const requirements = ROLE_REQUIREMENTS[targetCompany] || ROLE_REQUIREMENTS['default'];
  const userSkillNames = new Set(userSkills.map((s) => s.skill.toLowerCase()));

  const gaps: GapAnalysis[] = [];

  for (const req of requirements) {
    const hasSkill = userSkillNames.has(req.toLowerCase());
    const userSkill = userSkills.find(
      (s) => s.skill.toLowerCase() === req.toLowerCase()
    );

    // Brecha detectada: ausente O con dominio insuficiente (<60% match)
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
```

---

### 1.3 Prescriptor de Proyectos por Brecha

**Archivo:** `backend/src/services/githubService.ts`
**Función:** `generateProjectRecommendation()`

```typescript
// COPYRIGHT (C) 2026 — KRYVANT — TODOS LOS DERECHOS RESERVADOS
// Base de conocimiento propietaria: mapeo brecha → proyecto de práctica
// optimizado para estándares de entrevista en empresas de alta tecnología.

function generateProjectRecommendation(skill: string, company: string): string {
  const projects: Record<string, string> = {
    'C++':      'Construir un asignador de memoria personalizado con gestión de pools',
    'CUDA':     'Implementar multiplicación de matrices paralela en GPU con optimización de memoria compartida',
    'Go':       'Desarrollar un servidor HTTP2 con manejo de conexiones concurrentes tipo goroutine pool',
    'Rust':     'Crear un parser de protocolos binarios zero-copy con lifetimes explícitos',
    'Python':   'Construir un pipeline de ML con PyTorch y optimización de hiperparámetros',
    'Kubernetes':'Desplegar una arquitectura de microservicios con HPA y service mesh',
    'gRPC':     'Implementar comunicación inter-servicio con streaming bidireccional y protobuf',
    'PyTorch':  'Entrenar un transformer desde cero con atención multi-cabeza personalizada',
    'LLVM':     'Escribir un compilador de lenguaje simple con optimizaciones de IR',
    'Kafka':    'Construir un sistema de procesamiento de eventos en tiempo real con particionado',
  };
  return projects[skill] ||
    `Construir un proyecto avanzado demostrando dominio de ${skill} para estándares de ${company}`;
}
```

---

## PARTE 2 — SCHEMA DE BASE DE DATOS ORIGINAL

**Archivo:** `backend/prisma/schema.prisma`

```prisma
// COPYRIGHT (C) 2026 — KRYVANT — TODOS LOS DERECHOS RESERVADOS
// Diseño de modelo de datos original para sistema de análisis
// de brechas de habilidades y prescripción de proyectos.

model SkillGap {
  id           String    @id @default(cuid())
  profileId    String
  targetRoleId String
  title        String
  priority     Priority  @default(MEDIUM)
  estimatedDays Int      @default(3)
  status       GapStatus @default(OPEN)
  project      Project?  // Relación 1:1 brecha → proyecto prescrito
}

model TargetRole {
  id          String  @id @default(cuid())
  company     String
  title       String
  level       String
  requirements String // JSON: habilidades requeridas por empresa
  matchScore  Int     @default(0)
  skillGaps   SkillGap[]
}
```

---

## PARTE 3 — ENDPOINT DE ANÁLISIS (PROCESO COMPLETO)

**Archivo:** `backend/src/routes/analysis.ts`
**Ruta:** `POST /api/analysis/analyze`

Este endpoint implementa el flujo completo del proceso patentable:

```
1. Recibe: { githubUsername, targetCompany, targetTitle, targetLevel }
2. Obtiene repos del usuario vía GitHub API
3. Calcula distribución de habilidades (bytes + frecuencia)
4. Compara contra requisitos del rol objetivo (mapa propietario)
5. Genera lista de brechas con prioridad y tiempo estimado
6. Prescribe proyectos específicos por cada brecha
7. Calcula matchScore global (0-100%)
8. Persiste todo en BD relacionalmente
9. Retorna: skills[], gaps[], matchScore, targetRole, projects[]
```

**El proceso completo en código:**

```typescript
// COPYRIGHT (C) 2026 — KRYVANT — TODOS LOS DERECHOS RESERVADOS

router.post('/analyze', async (req: AuthRequest, res: Response) => {
  const { githubUsername, targetCompany, targetTitle, targetLevel, githubToken } = req.body;

  // PASO 1: Verificar existencia del usuario GitHub
  const ghUser = await getGitHubUser(githubUsername, githubToken);

  // PASO 2: Análisis cuantitativo de habilidades
  const skills = await analyzeUserSkills(githubUsername, githubToken);

  // PASO 3: Cálculo de brechas con priorización
  const gaps = computeGaps(skills, targetCompany, targetTitle);

  // PASO 4: Cálculo del score de match global
  const matchedRequirements = skills.filter((s) => s.matchPercent >= 60).length;
  const totalRequirements = gaps.length + matchedRequirements;
  const matchScore = Math.round((matchedRequirements / totalRequirements) * 100);

  // PASO 5: Persistencia relacional User → Profile → TargetRole → SkillGap → Project
  // [ver código completo en backend/src/routes/analysis.ts]
});
```

---

## DECLARACIÓN DE ORIGINALIDAD

Yo, [Tu Nombre], declaro que el sistema KRYVANT, incluyendo su arquitectura, algoritmos,
base de conocimiento de empresas/roles/proyectos, y estructura de base de datos descritos
en este documento, son de mi autoría original, creados en junio de 2026, y no han sido
copiados de ninguna fuente preexistente.

**Firma:** _________________________
**Nombre:** ________________________
**Fecha:** 20 de junio de 2026
**País:** ___________________________

---

## CÓMO REGISTRAR OFICIALMENTE

### México — INDAUTOR
- Portal: indautor.gob.mx
- Registrar como "Obra literaria — Programa de cómputo (software)"
- Costo: ~$700 MXN
- Tiempo: 3-6 meses

### España — RPPI
- Portal: culturaydeporte.gob.es/propiedadintelectual
- Registrar en el Registro de la Propiedad Intelectual de tu Comunidad Autónoma
- Costo: ~€15-30

### EE.UU. — Copyright Office
- Portal: copyright.gov/registration
- Tipo: "Computer File (CO)"
- Costo: $65 USD online
- Tiempo: 3-6 meses
