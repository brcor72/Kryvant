import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Github, CheckCircle2, Copy, Check, Loader2, ExternalLink } from 'lucide-react';
import { api, Project } from '../../lib/api';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');

  useEffect(() => {
    if (!id) return;
    api.getProject(id)
      .then((p) => { setProject(p); setGithubUrl(p.githubUrl || ''); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function updateStatus(status: Project['status']) {
    if (!project) return;
    setSaving(true);
    try {
      const updated = await api.updateProject(project.id, { status });
      setProject(updated);
    } finally {
      setSaving(false);
    }
  }

  async function updateProgress(progress: number) {
    if (!project) return;
    const updated = await api.updateProject(project.id, { progress });
    setProject(updated);
  }

  async function saveGithubUrl() {
    if (!project || !githubUrl) return;
    setSaving(true);
    try {
      const updated = await api.updateProject(project.id, { githubUrl });
      setProject(updated);
    } finally {
      setSaving(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground mb-4">Proyecto no encontrado</p>
        <Link to="/dashboard/projects" className="text-primary hover:underline">← Volver a proyectos</Link>
      </div>
    );
  }

  const techStack = JSON.parse(project.techStack || '[]') as string[];
  const isStarted = project.status === 'IN_PROGRESS' || project.status === 'COMPLETED';
  const isCompleted = project.status === 'COMPLETED';

  const starterCode = `// ${project.title}
// Kryvant - Proyecto de práctica

// Descripción: ${project.description}

// TODO: Implementa la solución aquí
// Tecnologías: ${techStack.join(', ')}

int main() {
    // Tu código aquí
    return 0;
}`;

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link to="/dashboard/projects" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver a Proyectos
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl mb-2">{project.title}</h1>
            <div className="flex items-center gap-3">
              {project.skillGap?.targetRole && (
                <span className="text-sm text-muted-foreground">
                  {project.skillGap.targetRole.title} en {project.skillGap.targetRole.company}
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                project.difficulty === 'HARD' ? 'bg-destructive/10 text-destructive' :
                project.difficulty === 'MEDIUM' ? 'bg-warning/10 text-warning' :
                'bg-primary/10 text-primary'
              }`}>
                {project.difficulty === 'HARD' ? 'Difícil' : project.difficulty === 'MEDIUM' ? 'Medio' : 'Fácil'}
              </span>
            </div>
          </div>

          {!isStarted && (
            <button
              onClick={() => updateStatus('IN_PROGRESS')}
              disabled={saving}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Comenzar Proyecto
            </button>
          )}
          {isStarted && !isCompleted && (
            <button
              onClick={() => updateStatus('COMPLETED')}
              disabled={saving}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Marcar Completado
            </button>
          )}
          {isCompleted && (
            <div className="flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary/20 rounded-lg text-primary">
              <CheckCircle2 className="w-5 h-5" />
              Completado
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Descripción */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg mb-3">Descripción del Proyecto</h2>
            <p className="text-muted-foreground leading-relaxed">{project.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {techStack.map((tech) => (
                <span key={tech} className="px-2.5 py-1 bg-muted rounded-md text-sm font-mono text-muted-foreground">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Progreso */}
          {isStarted && !isCompleted && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg mb-4">Progreso</h2>
              <div className="space-y-3">
                {[25, 50, 75, 100].map((val) => (
                  <label key={val} className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => updateProgress(val)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                        project.progress >= val
                          ? 'bg-primary border-primary'
                          : 'border-border group-hover:border-primary/50'
                      }`}
                    >
                      {project.progress >= val && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <span className="text-sm">
                      {val === 25 && 'Configuración del entorno y setup inicial'}
                      {val === 50 && 'Implementación core completada'}
                      {val === 75 && 'Tests escritos y validados'}
                      {val === 100 && 'Optimizaciones y documentación final'}
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-4">
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${project.progress}%` }} />
                </div>
                <p className="text-right text-xs text-muted-foreground mt-1">{project.progress}%</p>
              </div>
            </div>
          )}

          {/* Código starter */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg">Código de inicio</h2>
              <button
                onClick={() => copyToClipboard(starterCode)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <pre className="bg-background border border-border rounded-lg p-4 text-sm font-mono overflow-x-auto text-muted-foreground">
              {starterCode}
            </pre>
          </div>
        </div>

        <div className="space-y-6">
          {/* Link a GitHub */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg mb-4 flex items-center gap-2">
              <Github className="w-5 h-5" />
              Repositorio
            </h2>
            {project.githubUrl ? (
              <div className="space-y-3">
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline text-sm break-all"
                >
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  {project.githubUrl}
                </a>
                <button
                  onClick={() => setGithubUrl('')}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Cambiar URL
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Añade el link de tu repo cuando lo tengas listo</p>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/tu-usuario/proyecto"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  onClick={saveGithubUrl}
                  disabled={!githubUrl || saving}
                  className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  Guardar
                </button>
              </div>
            )}
          </div>

          {/* Info del proyecto */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg mb-4">Detalles</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado</span>
                <span>{
                  project.status === 'PENDING' ? 'Pendiente' :
                  project.status === 'IN_PROGRESS' ? 'En progreso' :
                  project.status === 'COMPLETED' ? 'Completado' : 'Abandonado'
                }</span>
              </div>
              {project.startedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Iniciado</span>
                  <span>{new Date(project.startedAt).toLocaleDateString('es-ES')}</span>
                </div>
              )}
              {project.completedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completado</span>
                  <span>{new Date(project.completedAt).toLocaleDateString('es-ES')}</span>
                </div>
              )}
              {project.skillGap && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prioridad</span>
                  <span className={
                    project.skillGap.priority === 'HIGH' ? 'text-destructive' :
                    project.skillGap.priority === 'MEDIUM' ? 'text-warning' : 'text-muted-foreground'
                  }>
                    {project.skillGap.priority === 'HIGH' ? 'Alta' : project.skillGap.priority === 'MEDIUM' ? 'Media' : 'Baja'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
