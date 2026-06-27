import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

export function B2BAdminPage() {
  const skillTrendData = [
    { skill: 'Java', before: 85, after: 45, fill: '#ef4444' },
    { skill: 'Go', before: 20, after: 78, fill: '#00E676' },
    { skill: 'Kubernetes', before: 40, after: 82, fill: '#00E676' },
    { skill: 'gRPC', before: 15, after: 65, fill: '#FFC107' },
    { skill: 'Rust', before: 5, after: 35, fill: '#FFC107' },
  ];

  const teamMembers = [
    {
      name: 'Sarah Chen',
      role: 'Ingeniera Backend Senior',
      skillGaps: 2,
      projectsCompleted: 3,
      matchScore: 82,
    },
    {
      name: 'Michael Rodríguez',
      role: 'Desarrollador Full Stack',
      skillGaps: 4,
      projectsCompleted: 1,
      matchScore: 65,
    },
    {
      name: 'Priya Patel',
      role: 'Ingeniera DevOps',
      skillGaps: 1,
      projectsCompleted: 5,
      matchScore: 91,
    },
    {
      name: 'David Kim',
      role: 'Ingeniero Backend',
      skillGaps: 3,
      projectsCompleted: 2,
      matchScore: 74,
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Dashboard de Análisis del Equipo</h1>
        <p className="text-muted-foreground">Rastrea la evolución de habilidades de tu equipo de ingeniería</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-mono">24</div>
              <div className="text-sm text-muted-foreground">Miembros del Equipo</div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-success/10 border border-success/20 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <div className="text-2xl font-mono">47</div>
              <div className="text-sm text-muted-foreground">Proyectos Completados</div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-warning/10 border border-warning/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <div className="text-2xl font-mono">18</div>
              <div className="text-sm text-muted-foreground">Brechas de Habilidades Activas</div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-mono text-success">+23%</div>
              <div className="text-sm text-muted-foreground">Crecimiento Promedio Habilidades</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-8 mb-8">
        <h2 className="text-2xl mb-6">Tendencia de Habilidades del Equipo: Migración de Java a Go</h2>
        <p className="text-muted-foreground mb-6">
          Seguimiento de competencia del equipo a través de tecnologías clave. Barras más altas indican mayor competencia del equipo.
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={skillTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis
              dataKey="skill"
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontFamily: 'Fira Code, monospace' }}
            />
            <YAxis
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontFamily: 'Fira Code, monospace' }}
              label={{ value: 'Competencia del Equipo %', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                fontFamily: 'Fira Code, monospace',
              }}
              labelStyle={{ color: '#e8e8e8' }}
            />
            <Bar dataKey="before" name="Hace 6 Meses" fill="#6b7280" />
            <Bar dataKey="after" name="Actual">
              {skillTrendData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-6 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#6b7280] rounded"></div>
            <span className="text-muted-foreground">Hace 6 Meses</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#00E676' }}></div>
            <span className="text-muted-foreground">Crecimiento Fuerte</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FFC107' }}></div>
            <span className="text-muted-foreground">Crecimiento Moderado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
            <span className="text-muted-foreground">Declive</span>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-8">
        <h2 className="text-2xl mb-6">Miembros del Equipo</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-muted-foreground font-mono text-sm">Nombre</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-mono text-sm">Rol</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-mono text-sm">Brechas Habilidades</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-mono text-sm">Proyectos Hechos</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-mono text-sm">Puntuación Match</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member) => (
                <tr key={member.name} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs text-primary font-mono">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span>{member.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground">{member.role}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-mono ${
                      member.skillGaps > 2 ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                    }`}>
                      {member.skillGaps} brechas
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono">{member.projectsCompleted}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-muted rounded-full h-2 max-w-[100px]">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${member.matchScore}%`,
                            backgroundColor: member.matchScore >= 80 ? '#00E676' : member.matchScore >= 60 ? '#FFC107' : '#ef4444',
                          }}
                        ></div>
                      </div>
                      <span className="font-mono text-sm">{member.matchScore}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
