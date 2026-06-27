import { Link } from 'react-router';
import { Github, ArrowRight, Code2, Target, Zap } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">Kryvant</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Precios
            </Link>
            <Link to="/dashboard/b2b" className="text-muted-foreground hover:text-foreground transition-colors">
              Para Equipos
            </Link>
            <Link
              to="/onboarding"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Comenzar
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6">
        <section className="py-20 text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary">
            <span className="font-mono">Análisis de Brechas con Precisión Quirúrgica</span>
          </div>
          <h1 className="text-6xl mb-6 max-w-4xl mx-auto leading-tight">
            Cierra la Brecha hacia Big Tech:<br />
            <span className="text-primary">Tu GitHub vs. Requisitos de NVIDIA</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Kryvant analiza tu código y prescribe el proyecto exacto de 3 días que necesitas para ser contratado en Google, Meta o Microsoft.
          </p>
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg text-lg hover:bg-primary/90 transition-colors group"
          >
            <Github className="w-6 h-6" />
            Sincronizar GitHub (Escaneo Gratis)
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </section>

        <section className="py-16 mb-20">
          <div className="grid md:grid-cols-2 gap-8 bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-8 bg-card">
              <h3 className="text-sm text-muted-foreground mb-4 uppercase tracking-wide">Tu CV/GitHub</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00E676' }}></div>
                  <span className="font-mono">Python (Experto)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00E676' }}></div>
                  <span className="font-mono">AWS (Intermedio)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00E676' }}></div>
                  <span className="font-mono">Docker (Junior)</span>
                </div>
              </div>
            </div>
            <div className="p-8 bg-destructive/5 border-l border-destructive/20">
              <h3 className="text-sm text-destructive mb-4 uppercase tracking-wide">Requisitos Rol NVIDIA</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FFC107' }}></div>
                  <div>
                    <div className="font-mono text-warning">Brecha de Habilidad Detectada</div>
                    <div className="text-sm text-muted-foreground mt-1">Gestión de Memoria de Bajo Nivel en C++</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 mb-20">
          <h2 className="text-4xl text-center mb-12">Cómo Funciona</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Github className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl mb-3">1. Conectar y Analizar</h3>
              <p className="text-muted-foreground">
                Vincula tu GitHub o sube tu CV. Escaneamos tus repositorios y extraemos tus competencias técnicas reales.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl mb-3">2. Apuntar a Big Tech</h3>
              <p className="text-muted-foreground">
                Selecciona tu rol soñado en Google, Meta, NVIDIA o Microsoft. Comparamos contra requisitos laborales reales.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl mb-3">3. Construir Proyectos</h3>
              <p className="text-muted-foreground">
                Obtén proyectos de portafolio quirúrgicos de 3-5 días diseñados para llenar tus brechas exactas y hacerte contrateable.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 mb-20 bg-card border border-border rounded-xl p-12">
          <h2 className="text-3xl mb-4">Para Líderes de Ingeniería</h2>
          <p className="text-xl text-muted-foreground mb-6 max-w-3xl">
            Recapacita a tu equipo eficientemente con análisis de precisión quirúrgica. Identifica brechas de habilidades del equipo y asigna proyectos de mejora dirigidos.
          </p>
          <Link
            to="/dashboard/b2b"
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            Explorar Kryvant para Equipos
            <ArrowRight className="w-5 h-5" />
          </Link>
        </section>
      </main>

      <footer className="border-t border-border mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-muted-foreground">
          <p>&copy; 2026 Kryvant. Precisión quirúrgica para el crecimiento de desarrolladores.</p>
        </div>
      </footer>
    </div>
  );
}
