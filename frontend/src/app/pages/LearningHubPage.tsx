import { useEffect, useState } from 'react';
import { BookOpen, Video, FileText, Code2, ExternalLink, Star, Clock, Loader2 } from 'lucide-react';
import { api, LearningResource } from '../../lib/api';

const TYPE_ICON: Record<string, React.ElementType> = {
  video: Video,
  book: BookOpen,
  course: BookOpen,
  docs: FileText,
  talk: Video,
};

export function LearningHubPage() {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    api.getLearning()
      .then(setResources)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = ['all', ...Array.from(new Set(resources.map((r) => r.category)))];

  const filtered = selectedCategory === 'all'
    ? resources
    : resources.filter((r) => r.category === selectedCategory);

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
        <h1 className="text-3xl mb-2">Learning Hub</h1>
        <p className="text-muted-foreground">Recursos curados para cerrar tus brechas de habilidades</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              selectedCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {cat === 'all' ? 'Todos' : cat}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((resource) => {
          const Icon = TYPE_ICON[resource.type] || Code2;
          return (
            <a
              key={resource.id}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex items-center gap-1.5">
                  {resource.free ? (
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">Gratis</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">Pago</span>
                  )}
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>

              <h3 className="font-medium mb-1 group-hover:text-primary transition-colors line-clamp-2">
                {resource.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">{resource.platform}</p>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {resource.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-warning" />
                    {resource.rating}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-muted rounded text-xs">{resource.level}</span>
              </div>

              <div className="flex flex-wrap gap-1 mt-3">
                {resource.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-1.5 py-0.5 bg-background border border-border rounded text-xs font-mono text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
