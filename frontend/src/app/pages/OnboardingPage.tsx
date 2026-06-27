import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Github, Upload, PenTool, Loader2, Code2, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';

const COMPANIES = ['NVIDIA', 'Google', 'Meta', 'Microsoft', 'Amazon', 'Apple', 'OpenAI', 'Anthropic'];
const LEVELS = ['Junior', 'Mid', 'Senior', 'Staff', 'Principal'];

export function OnboardingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<'github' | 'cv' | 'manual' | null>(null);
  const [githubUsername, setGithubUsername] = useState('');
  const [targetCompany, setTargetCompany] = useState('NVIDIA');
  const [targetTitle, setTargetTitle] = useState('');
  const [targetLevel, setTargetLevel] = useState('Senior');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStep, setScanStep] = useState('');
  const [error, setError] = useState('');

  const suggestions = [
    'Ingeniero Senior SWE en Google Cloud',
    'Ingeniero de Infraestructura en Meta',
    'Ingeniero ML en OpenAI',
    'Ingeniero de Sistemas en NVIDIA',
  ];

  function normalizeGitHubUsername(input: string) {
    let username = input.trim();
    username = username.replace(/^(https?:\/\/)?(www\.)?github\.com\//i, '');
    username = username.replace(/\?.*$/, '');
    username = username.replace(/\/$/, '');
    return username;
  }

  const handleStart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (selectedMethod === 'github') {
      const normalized = normalizeGitHubUsername(githubUsername);
      if (!normalized) {
        setError('Ingresa tu usuario de GitHub');
        return;
      }
      setGithubUsername(normalized);
    }

    if (!targetTitle.trim()) {
      setError('Ingresa el título del rol objetivo');
      return;
    }

    setError('');
    setIsScanning(true);
    setScanProgress(0);

    const steps = [
      'Conectando con GitHub API...',
      'Analizando repositorios...',
      'Detectando lenguajes y frameworks...',
      'Calculando brechas de habilidades...',
      'Generando proyectos recomendados...',
    ];

    let step = 0;
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        const next = prev + 20;
        if (step < steps.length) {
          setScanStep(steps[step]);
          step++;
        }
        if (next >= 80) clearInterval(interval);
        return Math.min(next, 80);
      });
    }, 600);

    try {
      const githubToken = localStorage.getItem('kryvant_github_token') || undefined;
      await api.analyze({
        githubUsername: normalizeGitHubUsername(githubUsername) || 'octocat',
        targetCompany,
        targetTitle: targetTitle || `Ingeniero ${targetLevel} en ${targetCompany}`,
        targetLevel,
        githubToken,
      });

      setScanProgress(100);
      setScanStep('¡Análisis completado!');
      clearInterval(interval);
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err: any) {
      clearInterval(interval);
      setIsScanning(false);
      setError(err.message || 'Error al analizar perfil. Verifica tu usuario de GitHub.');
    }
  };

  if (isScanning) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-2xl w-full px-6">
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h2 className="text-2xl mb-6">Analizando Tu Perfil</h2>

            <div className="w-full bg-muted rounded-full h-2 mb-6">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${scanProgress}%` }}
              />
            </div>

            <div className="space-y-3 text-left mb-4">
              {scanProgress >= 20 && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="font-mono text-sm">Conectado a GitHub API ✓</span>
                </div>
              )}
              {scanProgress >= 40 && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="font-mono text-sm">Repositorios analizados ✓</span>
                </div>
              )}
              {scanProgress >= 60 && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="font-mono text-sm">Lenguajes detectados ✓</span>
                </div>
              )}
              {scanProgress >= 80 && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="font-mono text-sm">Brechas calculadas ✓</span>
                </div>
              )}
              {scanProgress < 100 && (
                <div className="flex items-center gap-3 text-primary">
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                  <span className="font-mono text-sm">{scanStep}</span>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{scanProgress}% completado</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Code2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold">Kryvant</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl mb-3">Configura tu Análisis</h1>
          <p className="text-muted-foreground text-lg">
            Dinos dónde quieres llegar y analizamos cómo llegar
          </p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm text-center">
            {error}
          </div>
        )}

        {/* Rol objetivo */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">1. ¿Cuál es tu rol objetivo?</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Empresa objetivo</label>
              <select
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {COMPANIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Nivel</label>
              <select
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value)}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1.5">Título del puesto</label>
            <input
              type="text"
              value={targetTitle}
              onChange={(e) => setTargetTitle(e.target.value)}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder={`Ej: Ingeniero ${targetLevel} C++ en ${targetCompany}`}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => {
                  const parts = s.split(' en ');
                  if (parts[1]) setTargetCompany(parts[1].split(' ')[0]);
                  setTargetTitle(s);
                }}
                className="text-xs px-3 py-1 bg-muted rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Método de análisis */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">2. ¿Cómo analizamos tus habilidades?</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { id: 'github' as const, icon: Github, label: 'GitHub', desc: 'Analizamos tus repos automáticamente' },
              { id: 'cv' as const, icon: Upload, label: 'Subir CV', desc: 'Próximamente' },
              { id: 'manual' as const, icon: PenTool, label: 'Manual', desc: 'Próximamente' },
            ].map(({ id, icon: Icon, label, desc }) => (
              <button
                key={id}
                onClick={() => id === 'github' && setSelectedMethod(id)}
                disabled={id !== 'github'}
                className={`p-4 border rounded-xl text-left transition-all ${
                  selectedMethod === id
                    ? 'border-primary bg-primary/5'
                    : id !== 'github'
                    ? 'border-border opacity-40 cursor-not-allowed'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Icon className="w-6 h-6 mb-2 text-primary" />
                <div className="font-medium">{label}</div>
                <div className="text-sm text-muted-foreground">{desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Usuario de GitHub */}
        {selectedMethod === 'github' && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">3. Tu usuario de GitHub</h2>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="tu-usuario-github"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ej: torvalds, gvanrossum, antirez
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleStart}
          disabled={!selectedMethod || !targetTitle.trim()}
          className="w-full py-4 bg-primary text-primary-foreground rounded-xl text-lg hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Github className="w-5 h-5" />
          Iniciar Análisis
        </button>

        <p className="text-center text-sm text-muted-foreground mt-4">
          El análisis tarda ~30 segundos dependiendo de la cantidad de repositorios
        </p>
      </main>
    </div>
  );
}
