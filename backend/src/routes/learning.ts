import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

const LEARNING_RESOURCES = [
  {
    id: '1',
    category: 'C++ Avanzado',
    title: 'Memory Management Masterclass',
    type: 'video',
    platform: 'YouTube',
    duration: '4h 30min',
    level: 'Avanzado',
    url: 'https://youtube.com',
    tags: ['C++', 'Memory', 'Allocators', 'RAII'],
    rating: 4.9,
    free: true,
  },
  {
    id: '2',
    category: 'Sistemas Distribuidos',
    title: 'Designing Data-Intensive Applications',
    type: 'book',
    platform: 'OReilly',
    duration: '30h lectura',
    level: 'Avanzado',
    url: 'https://dataintensive.net',
    tags: ['Distributed Systems', 'Kafka', 'Databases', 'Consistency'],
    rating: 4.8,
    free: false,
  },
  {
    id: '3',
    category: 'CUDA / GPU',
    title: 'CUDA Programming Guide',
    type: 'docs',
    platform: 'NVIDIA',
    duration: 'Referencia',
    level: 'Expert',
    url: 'https://docs.nvidia.com/cuda',
    tags: ['CUDA', 'GPU', 'Parallel Computing', 'NVIDIA'],
    rating: 4.7,
    free: true,
  },
  {
    id: '4',
    category: 'gRPC & Protobuf',
    title: 'gRPC en Go y C++: Microservicios de alta performance',
    type: 'course',
    platform: 'Udemy',
    duration: '12h',
    level: 'Intermedio',
    url: 'https://udemy.com',
    tags: ['gRPC', 'Protobuf', 'Go', 'C++', 'Microservices'],
    rating: 4.6,
    free: false,
  },
  {
    id: '5',
    category: 'Algoritmos & Estructuras',
    title: 'Lock-Free Data Structures - CppCon',
    type: 'talk',
    platform: 'CppCon',
    duration: '1h',
    level: 'Expert',
    url: 'https://youtube.com',
    tags: ['C++', 'Lock-free', 'Concurrency', 'Atomics'],
    rating: 4.9,
    free: true,
  },
  {
    id: '6',
    category: 'Machine Learning',
    title: 'Deep Learning Specialization',
    type: 'course',
    platform: 'Coursera',
    duration: '80h',
    level: 'Intermedio',
    url: 'https://coursera.org',
    tags: ['Python', 'PyTorch', 'Neural Networks', 'Backprop'],
    rating: 4.8,
    free: false,
  },
  {
    id: '7',
    category: 'Rust',
    title: 'The Rust Programming Language (El Libro)',
    type: 'book',
    platform: 'rust-lang.org',
    duration: '20h lectura',
    level: 'Principiante-Avanzado',
    url: 'https://doc.rust-lang.org/book',
    tags: ['Rust', 'Memory Safety', 'Ownership', 'Systems'],
    rating: 4.9,
    free: true,
  },
  {
    id: '8',
    category: 'Kubernetes',
    title: 'Certified Kubernetes Administrator (CKA)',
    type: 'course',
    platform: 'Linux Foundation',
    duration: '40h',
    level: 'Avanzado',
    url: 'https://training.linuxfoundation.org',
    tags: ['Kubernetes', 'Docker', 'DevOps', 'Cloud'],
    rating: 4.7,
    free: false,
  },
];

router.get('/', (_req: Request, res: Response): void => {
  res.json(LEARNING_RESOURCES);
});

router.get('/categories', (_req: Request, res: Response): void => {
  const categories = [...new Set(LEARNING_RESOURCES.map((r) => r.category))];
  res.json(categories);
});

router.get('/:id', (req: Request, res: Response): void => {
  const resource = LEARNING_RESOURCES.find((r) => r.id === req.params.id);
  if (!resource) { res.status(404).json({ error: 'Recurso no encontrado' }); return; }
  res.json(resource);
});

export default router;
