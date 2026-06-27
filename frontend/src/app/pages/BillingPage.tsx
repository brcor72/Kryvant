import { useEffect, useState } from 'react';
import { CreditCard, CheckCircle2, Zap, Loader2 } from 'lucide-react';
import { api, Subscription } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { PaymentModal } from '../components/PaymentModal';

const PLANS = [
  {
    id: 'FREE' as const,
    name: 'Gratis',
    price: 'S/. 0',
    period: 'para siempre',
    features: ['1 análisis de GitHub', '3 proyectos activos', 'Acceso a jobs board', 'Learning hub básico'],
  },
  {
    id: 'PRO' as const,
    name: 'Pro',
    price: 'S/. 18',
    period: '/mes',
    features: ['Análisis ilimitados', 'Proyectos ilimitados', 'Prioridad en matching', 'Soporte prioritario', 'Exportar informe PDF', 'Acceso anticipado a features'],
    highlighted: true,
  },
  {
    id: 'ENTERPRISE' as const,
    name: 'Enterprise',
    price: 'S/. 35',
    period: '/mes',
    features: ['Todo en Pro', 'Gestión de equipos B2B', 'Dashboard de equipo', 'SSO / SAML', 'SLA garantizado', 'Onboarding dedicado'],
  },
];

export function BillingPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [paymentPlan, setPaymentPlan] = useState<(typeof PLANS)[number] | null>(null);

  useEffect(() => {
    api.getBilling()
      .then(setSubscription)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleConfirmPayment() {
    if (!paymentPlan || paymentPlan.id === 'FREE') return;
    const res = await api.upgradePlan(paymentPlan.id);
    setSubscription(res.subscription);
    setMessage(`¡Plan ${paymentPlan.id} activado exitosamente!`);
  }

  async function handleCancel() {
    if (!confirm('¿Seguro que deseas cancelar? Tendrás acceso hasta el fin del período.')) return;
    try {
      await api.cancelPlan();
      const updated = await api.getBilling();
      setSubscription(updated);
      setMessage('Suscripción cancelada. Tendrás acceso hasta el fin del período actual.');
    } catch (err: any) {
      setMessage(err.message);
    }
  }

  const currentPlan = user?.plan || 'FREE';

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
        <h1 className="text-3xl mb-2">Suscripción</h1>
        <p className="text-muted-foreground">
          Plan actual: <span className="text-foreground font-medium">{currentPlan}</span>
          {subscription && (
            <span className="ml-2">
              — Próxima renovación:{' '}
              {new Date(subscription.currentPeriodEnd).toLocaleDateString('es-ES')}
            </span>
          )}
        </p>
      </div>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm border ${
          message.includes('exitosamente') || message.includes('activado')
            ? 'bg-primary/10 border-primary/20 text-primary'
            : 'bg-destructive/10 border-destructive/20 text-destructive'
        }`}>
          {message}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {PLANS.map((plan) => {
          const isActive = currentPlan === plan.id;
          return (
            <div
              key={plan.id}
              className={`bg-card border rounded-xl p-6 relative ${
                plan.highlighted
                  ? 'border-primary'
                  : 'border-border'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-primary text-primary-foreground text-xs rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Más popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              {isActive ? (
                <div className="w-full py-2.5 border border-primary text-primary rounded-lg text-sm text-center font-medium">
                  Plan actual
                </div>
              ) : (
                <button
                  onClick={() => plan.id !== 'FREE' && setPaymentPlan(plan)}
                  disabled={plan.id === 'FREE'}
                  className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    plan.highlighted
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
                      : plan.id === 'FREE'
                      ? 'bg-muted text-muted-foreground cursor-default'
                      : 'bg-muted hover:bg-muted/80 disabled:opacity-50'
                  }`}
                >
                  {plan.id === 'FREE' ? 'Plan base' : `Cambiar a ${plan.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {subscription && currentPlan !== 'FREE' && !subscription.cancelAtPeriodEnd && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg mb-2 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Gestión de suscripción
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Cancela cuando quieras. Seguirás teniendo acceso hasta el{' '}
            {new Date(subscription.currentPeriodEnd).toLocaleDateString('es-ES')}.
          </p>
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-destructive/30 text-destructive rounded-lg text-sm hover:bg-destructive/5 transition-colors"
          >
            Cancelar suscripción
          </button>
        </div>
      )}

      {subscription?.cancelAtPeriodEnd && (
        <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 text-sm text-warning">
          Tu suscripción se cancelará el {new Date(subscription.currentPeriodEnd).toLocaleDateString('es-ES')}.
          Puedes reactivarla antes de esa fecha.
        </div>
      )}

      {paymentPlan && (
        <PaymentModal
          open={!!paymentPlan}
          onOpenChange={(open) => !open && setPaymentPlan(null)}
          planName={paymentPlan.name}
          price={`${paymentPlan.price}${paymentPlan.period}`}
          onConfirm={handleConfirmPayment}
        />
      )}
    </div>
  );
}
