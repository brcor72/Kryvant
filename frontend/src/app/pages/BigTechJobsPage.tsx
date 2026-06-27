import { useEffect, useState } from 'react';
import { Search, MapPin, Building2, TrendingUp, ExternalLink, Loader2 } from 'lucide-react';
import { api, Job } from '../../lib/api';

export function BigTechJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');

  useEffect(() => {
    api.getJobs()
      .then(setJobs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const companies = ['all', ...Array.from(new Set(jobs.map((j) => j.company)))];

  const filtered = jobs.filter((j) => {
    const matchSearch = !searchTerm ||
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.techStack.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCompany = selectedCompany === 'all' || j.company === selectedCompany;
    return matchSearch && matchCompany;
  });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Trabajos Big Tech</h1>
        <p className="text-muted-foreground">{filtered.length} posiciones abiertas</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por título, empresa o tecnología..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="px-3 py-2.5 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {companies.map((c) => (
            <option key={c} value={c}>{c === 'all' ? 'Todas las empresas' : c}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4">
        {filtered.map((job) => (
          <div key={job.id} className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-lg">{job.title}</h3>
                  {job.isNew && (
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">Nuevo</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {job.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {job.salary}
                  </span>
                </div>
              </div>
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors flex-shrink-0"
              >
                Aplicar
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-sm text-muted-foreground mb-4">{job.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {job.techStack.map((tech) => (
                  <span key={tech} className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs font-mono">
                    {tech}
                  </span>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(job.postedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
