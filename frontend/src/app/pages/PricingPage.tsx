import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Check, Code2, Zap, Crown, Users } from 'lucide-react';
import { PaymentModal } from '../components/PaymentModal';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';

export function PricingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<{ plan: 'PRO' | 'ENTERPRISE'; name: string; price: string } | null>(null);

  const plans = [
    {
      name: 'Freemium',
      planId: null as null,
      price: 0,
      description: 'Perfecto para probar Kryvant',
      icon: Code2,
      features: [
        '1 Análisis de Brecha por mes',
        'Recomendaciones de proyectos públicos',
        'Matching básico de habilidades',
        'Soporte comunitario',
      ],
      cta: 'Comenzar',
      ctaVariant: 'secondary' as const,
    },
    {
      name: 'Pro',
      planId: 'PRO' as const,
      price: isAnnual ? 15 : 18,
      description: 'Para desarrolladores serios apuntando a Big Tech',
      icon: Zap,
      features: [
        'Análisis de Brechas Ilimitados',
        'Briefs de proyectos detallados con código de inicio',
        'API de Revisión de Portafolio',
        'Matching de Habilidades Prioritario',
        'Dashboard de análisis avanzado',
        'Soporte por email',
      ],
      cta: 'Actualizar a Pro',
      ctaVariant: 'primary' as const,
      highlighted: true,
      savings: isAnnual ? 'Ahorra S/. 36/año' : null,
    },
    {
      name: 'Elite',
      planId: 'ENTERPRISE' as const,
      price: isAnnual ? 29 : 35,
      description: 'Todo lo que necesitas para destacar',
      icon: Crown,
      features: [
        'Todas las características Pro',
        'Entrevistas Técnicas simuladas con IA para Big Tech',
        'Revisión de portafolio experta 1-a-1 (mensual)',
        'Ruta de aprendizaje personalizada',
        'Soporte prioritario (respuesta en 24h)',
        'Solicitudes de proyectos personalizados',
      ],
      cta: 'Ir Elite',
      ctaVariant: 'secondary' as const,
      savings: isAnnual ? 'Ahorra S/. 72/año' : null,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">Kryvant</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Inicio
            </Link>
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Panel
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl mb-4">Elige Tu Camino a Big Tech</h1>
          <p className="text-xl text-muted-foreground mb-8">Precios transparentes. Sin tarifas ocultas.</p>

          <div className="inline-flex items-center gap-3 p-1 bg-card border border-border rounded-lg">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-lg transition-colors ${
                !isAnnual ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-lg transition-colors ${
                isAnnual ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Anual
            </button>
          </div>
          {isAnnual && (
            <div className="mt-3 text-sm text-success">
              Ahorra hasta S/. 72 con facturación anual
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`bg-card rounded-xl p-8 ${
                  plan.highlighted
                    ? 'border-2 border-primary shadow-lg shadow-primary/20 scale-105'
                    : 'border border-border'
                }`}
              >
                {plan.highlighted && (
                  <div className="inline-block px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm mb-4">
                    Más Popular
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    plan.highlighted ? 'bg-primary/10 border border-primary/20' : 'bg-muted'
                  }`}>
                    <Icon className={`w-6 h-6 ${plan.highlighted ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <h3 className="text-2xl">{plan.name}</h3>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-mono">S/. {plan.price}</span>
                    {plan.price > 0 && <span className="text-muted-foreground">/mes</span>}
                  </div>
                  {plan.savings && (
                    <div className="text-sm text-success mt-1">{plan.savings}</div>
                  )}
                </div>

                <p className="text-muted-foreground mb-6">{plan.description}</p>

                {plan.planId ? (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) { navigate('/login'); return; }
                      setPaymentTarget({ plan: plan.planId!, name: plan.name, price: `S/. ${plan.price}/mes` });
                    }}
                    className={`block w-full px-6 py-3 rounded-lg text-center transition-colors mb-6 ${
                      plan.ctaVariant === 'primary'
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {plan.cta}
                  </button>
                ) : (
                  <Link
                    to="/onboarding"
                    className={`block w-full px-6 py-3 rounded-lg text-center transition-colors mb-6 ${
                      plan.ctaVariant === 'primary'
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                )}

                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl">Kryvant para Equipos</h2>
          </div>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Recapacita a tu personal de ingeniería con análisis de precisión y seguimiento de habilidades para todo el equipo.
          </p>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-mono text-primary">Precios Personalizados</div>
              <div className="text-sm text-muted-foreground">para 10+ desarrolladores</div>
            </div>
          </div>
          <Link
            to="/dashboard/b2b"
            className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Contactar Ventas
          </Link>
        </div>
      </main>

      <footer className="border-t border-border mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-muted-foreground">
          <p>&copy; 2026 Kryvant. Todos los precios en Soles Peruanos (S/.).</p>
        </div>
      </footer>

      {paymentTarget && (
        <PaymentModal
          open={!!paymentTarget}
          onOpenChange={(open) => !open && setPaymentTarget(null)}
          planName={paymentTarget.name}
          price={paymentTarget.price}
          onConfirm={async () => {
            await api.upgradePlan(paymentTarget.plan);
            navigate('/dashboard/billing');
          }}
        />
      )}
    </div>
  );
}
