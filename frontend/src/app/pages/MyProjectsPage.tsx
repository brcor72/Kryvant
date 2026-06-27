import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { CheckCircle2, Clock, AlertCircle, Code2, ExternalLink, Loader2 } from 'lucide-react';
import { api, Project } from '../../lib/api';

const STATUS_CONFIG = {
  PENDING: { label: 'Pendiente', icon: Clock, color: 'text-muted-foreground' },
  IN_PROGRESS: { label: 'En progreso', icon: AlertCircle, color: 'text-warning' },
  COMPLETED: { label: 'Completado', icon: CheckCircle2, color: 'text-primary' },
  ABANDONED: { label: 'Abandonado', icon: AlertCircle, color: 'text-destructive' },
};

const DIFFICULTY_LABEL = { EASY: 'Fácil', MEDIUM: 'Medio', HARD: 'Difícil' };

export function MyProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl mb-2">Mis Proyectos</h1>
          <p className="text-muted-foreground">{projects.length} proyectos asignados</p>
        </div>
        <Link
          to="/onboarding"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
        >
          Nuevo análisis
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Code2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl mb-2">Sin proyectos aún</h2>
          <p className="text-muted-foreground mb-6">Analiza tu perfil para recibir proyectos personalizados</p>
          <Link to="/onboarding" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg">
            Analizar mi GitHub
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => {
            const cfg = STATUS_CONFIG[project.status];
            const Icon = cfg.icon;
            const techStack = JSON.parse(project.techStack || '[]') as string[];

            return (
              <Link
                key={project.id}
                to={`/dashboard/projects/${project.id}`}
                className="block bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Code2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium group-hover:text-primary transition-colors">{project.title}</h3>
                      <p className="text-sm text-muted-foreground">{DIFFICULTY_LABEL[project.difficulty]}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 text-sm ${cfg.color}`}>
                    <Icon className="w-4 h-4" />
                    <span>{cfg.label}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>

                {project.status !== 'PENDING' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progreso</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {techStack.slice(0, 4).map((tech) => (
                      <span key={tech} className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      GitHub
                    </a>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
