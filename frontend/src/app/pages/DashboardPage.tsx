import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { api, DashboardData } from '../../lib/api';

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getDashboard()
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-muted-foreground mb-4">{error || 'No hay datos disponibles'}</p>
          <Link to="/onboarding" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg">
            Completar tu perfil
          </Link>
        </div>
      </div>
    );
  }

  const matchScore = data.matchScore || 0;
  const chartData = [
    { name: 'Match', value: matchScore, color: '#00E676' },
    { name: 'Gap', value: 100 - matchScore, color: '#FFC107' },
  ];

  const strengths = data.skills.filter((s) => s.matchPercent >= 65).slice(0, 4);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl mb-2">Matriz de Brechas de Habilidades</h1>
          {data.targetRole ? (
            <p className="text-muted-foreground">
              Tu camino a {data.targetRole.title} en {data.targetRole.company}
            </p>
          ) : (
            <p className="text-muted-foreground">
              <Link to="/onboarding" className="text-primary hover:underline">
                Configura tu rol objetivo →
              </Link>
            </p>
          )}
        </div>
        <Link
          to="/onboarding"
          className="flex-shrink-0 px-4 py-2 bg-muted rounded-lg text-sm hover:bg-muted/80 transition-colors whitespace-nowrap"
        >
          Analizar otro usuario de GitHub
        </Link>
      </div>

      {data.targetRole?.summary && (
        <div className="mb-8 bg-primary/5 border border-primary/20 rounded-xl p-5">
          <h2 className="text-sm font-medium text-primary mb-1">Resumen del análisis IA</h2>
          <p className="text-sm text-muted-foreground">{data.targetRole.summary}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg mb-4 text-muted-foreground">Puntuación General de Match</h2>
          <div className="relative flex items-center justify-center mb-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} startAngle={90} endAngle={-270} dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-mono" style={{ color: '#00E676' }}>{matchScore}%</div>
                <div className="text-sm text-muted-foreground">Match</div>
              </div>
            </div>
          </div>
          {data.targetRole && (
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Rol Objetivo</div>
              <div className="font-mono text-sm">{data.targetRole.title} en {data.targetRole.company}</div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-muted-foreground">Principales Brechas de Habilidades</h2>
            {data.skillGaps.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-warning">
                <AlertCircle className="w-4 h-4" />
                <span>{data.skillGaps.length} brechas identificadas</span>
              </div>
            )}
          </div>

          {data.skillGaps.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-3">No hay brechas identificadas aún.</p>
              <Link to="/onboarding" className="text-primary hover:underline text-sm">
                Analizar tu perfil de GitHub →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data.skillGaps.slice(0, 3).map((gap) => (
                <Link
                  key={gap.id}
                  to={gap.project ? `/dashboard/projects/${gap.project.id}` : '/dashboard/projects'}
                  className="block bg-warning/5 border border-warning/20 rounded-lg p-4 hover:bg-warning/10 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-warning flex-shrink-0" />
                      <h3 className="font-mono text-warning text-sm">{gap.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2">
                      <span className="text-sm">{gap.estimatedDays} días</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                  {gap.project && (
                    <div className="text-sm text-muted-foreground ml-4">
                      <span className="text-foreground">Proyecto:</span> {gap.project.description}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg mb-4">Tus Fortalezas</h2>
          {strengths.length === 0 ? (
            <p className="text-muted-foreground text-sm">Analiza tu GitHub para ver tus fortalezas.</p>
          ) : (
            <div className="space-y-3">
              {strengths.map((s) => (
                <div key={s.skill} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#00E676' }} />
                  <span className="font-mono">{s.skill} ({s.level})</span>
                  <span className="ml-auto text-sm text-muted-foreground">{s.matchPercent}% match</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg mb-4">Acciones Recomendadas</h2>
          <div className="space-y-3">
            {data.recentProjects.length > 0 ? (
              <Link
                to={`/dashboard/projects/${data.recentProjects[0].id}`}
                className="block px-4 py-3 bg-primary/10 border border-primary/20 rounded-lg text-primary hover:bg-primary/20 transition-colors"
              >
                Continuar: {data.recentProjects[0].title}
              </Link>
            ) : (
              <Link
                to="/onboarding"
                className="block px-4 py-3 bg-primary/10 border border-primary/20 rounded-lg text-primary hover:bg-primary/20 transition-colors"
              >
                Analiza tu perfil de GitHub
              </Link>
            )}
            <Link
              to="/pricing"
              className="block px-4 py-3 bg-muted rounded-lg text-muted-foreground hover:bg-muted/80 transition-colors text-center"
            >
              Actualiza a Pro para análisis ilimitados
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
