import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// Datos curados de empleos en Big Tech (en producción conectar a LinkedIn API / Greenhouse / Lever)
const BIG_TECH_JOBS = [
  {
    id: '1',
    company: 'NVIDIA',
    title: 'Senior Software Engineer, CUDA',
    level: 'Senior',
    location: 'Santa Clara, CA (Híbrido)',
    salary: '$180k - $280k',
    techStack: ['C++', 'CUDA', 'Python', 'OpenGL'],
    description: 'Desarrollar optimizaciones de kernels CUDA para modelos de IA de próxima generación.',
    url: 'https://nvidia.wd5.myworkdayjobs.com',
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isNew: true,
  },
  {
    id: '2',
    company: 'Google',
    title: 'Staff Software Engineer, Infrastructure',
    level: 'Staff',
    location: 'Mountain View, CA',
    salary: '$220k - $350k',
    techStack: ['Go', 'C++', 'Kubernetes', 'gRPC', 'Spanner'],
    description: 'Diseñar sistemas distribuidos de escala planetaria para Google Cloud.',
    url: 'https://careers.google.com',
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isNew: true,
  },
  {
    id: '3',
    company: 'Meta',
    title: 'Senior Software Engineer, PyTorch Core',
    level: 'Senior',
    location: 'Menlo Park, CA (Remoto)',
    salary: '$195k - $310k',
    techStack: ['C++', 'Python', 'PyTorch', 'LLVM', 'CUDA'],
    description: 'Contribuir al core de PyTorch: autograd, compilador, optimizaciones de memoria.',
    url: 'https://metacareers.com',
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isNew: true,
  },
  {
    id: '4',
    company: 'OpenAI',
    title: 'Research Engineer, Training Infrastructure',
    level: 'Senior',
    location: 'San Francisco, CA',
    salary: '$300k - $500k',
    techStack: ['Python', 'PyTorch', 'CUDA', 'Kubernetes', 'Rust'],
    description: 'Escalar infraestructura de entrenamiento de modelos de lenguaje a miles de GPUs.',
    url: 'https://openai.com/careers',
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isNew: false,
  },
  {
    id: '5',
    company: 'Microsoft',
    title: 'Principal Engineer, Azure AI',
    level: 'Principal',
    location: 'Redmond, WA (Híbrido)',
    salary: '$240k - $380k',
    techStack: ['C++', 'C#', 'Python', 'ONNX', 'Azure', 'Kubernetes'],
    description: 'Liderar el diseño de runtime de inferencia para modelos de Azure OpenAI Service.',
    url: 'https://careers.microsoft.com',
    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    isNew: false,
  },
  {
    id: '6',
    company: 'Apple',
    title: 'Senior ML Engineer, Core ML',
    level: 'Senior',
    location: 'Cupertino, CA',
    salary: '$200k - $320k',
    techStack: ['Swift', 'C++', 'Python', 'Metal', 'CoreML'],
    description: 'Optimizar inferencia de modelos en el Neural Engine de chips Apple Silicon.',
    url: 'https://jobs.apple.com',
    postedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    isNew: false,
  },
  {
    id: '7',
    company: 'Amazon',
    title: 'Senior SDE, Distributed Systems',
    level: 'Senior',
    location: 'Seattle, WA (Presencial)',
    salary: '$175k - $260k',
    techStack: ['Java', 'Go', 'AWS', 'DynamoDB', 'Kafka'],
    description: 'Construir sistemas distribuidos de baja latencia para servicios críticos de AWS.',
    url: 'https://amazon.jobs',
    postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isNew: false,
  },
  {
    id: '8',
    company: 'Anthropic',
    title: 'Software Engineer, Model Training',
    level: 'Mid-Senior',
    location: 'San Francisco, CA',
    salary: '$250k - $400k',
    techStack: ['Python', 'JAX', 'PyTorch', 'CUDA', 'Rust'],
    description: 'Desarrollar pipelines de entrenamiento de modelos constitucionales a escala.',
    url: 'https://anthropic.com/careers',
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isNew: true,
  },
];

router.get('/', (_req: Request, res: Response): void => {
  res.json(BIG_TECH_JOBS);
});

router.get('/:id', (req: Request, res: Response): void => {
  const job = BIG_TECH_JOBS.find((j) => j.id === req.params.id);
  if (!job) { res.status(404).json({ error: 'Empleo no encontrado' }); return; }
  res.json(job);
});

export default router;
