import { useState } from 'react';
import { CreditCard, Smartphone, Loader2, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Input } from './ui/input';
import { Button } from './ui/button';

type Method = 'card' | 'yape' | 'plin';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  price: string;
  onConfirm: () => Promise<void>;
}

function luhnCheck(value: string): boolean {
  const digits = value.replace(/\s+/g, '');
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function isExpiryValid(expiry: string): boolean {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const month = parseInt(match[1], 10);
  const year = 2000 + parseInt(match[2], 10);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const expiryDate = new Date(year, month, 0);
  return expiryDate >= new Date(now.getFullYear(), now.getMonth(), 1);
}

function formatCardNumber(value: string): string {
  return value.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function PaymentModal({ open, onOpenChange, planName, price, onConfirm }: PaymentModalProps) {
  const [method, setMethod] = useState<Method>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  function resetState() {
    setCardNumber(''); setCardName(''); setExpiry(''); setCvv('');
    setPhone(''); setOtp(''); setErrors({}); setProcessing(false); setSuccess(false);
  }

  function validateCard(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!luhnCheck(cardNumber)) errs.cardNumber = 'Número de tarjeta inválido';
    if (!cardName.trim()) errs.cardName = 'Ingresa el nombre del titular';
    if (!isExpiryValid(expiry)) errs.expiry = 'Fecha de vencimiento inválida o expirada';
    if (!/^\d{3,4}$/.test(cvv)) errs.cvv = 'CVV inválido';
    return errs;
  }

  function validateWallet(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!/^9\d{8}$/.test(phone)) errs.phone = 'Ingresa un celular peruano válido (9XXXXXXXX)';
    if (!/^\d{6}$/.test(otp)) errs.otp = 'Ingresa el código de 6 dígitos enviado a tu app';
    return errs;
  }

  async function handlePay() {
    const validationErrors = method === 'card' ? validateCard() : validateWallet();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    try {
      await onConfirm();
      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        resetState();
      }, 1500);
    } catch (err: any) {
      setErrors({ general: err.message || 'No se pudo procesar el pago' });
      setProcessing(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetState(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suscribirte a {planName}</DialogTitle>
          <DialogDescription>
            Pago simulado de {price}. No se procesa ningún cargo real.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="w-12 h-12 text-primary" />
            <p className="text-lg font-medium">¡Pago aprobado!</p>
            <p className="text-sm text-muted-foreground">Tu plan {planName} ya está activo.</p>
          </div>
        ) : (
          <>
            <Tabs value={method} onValueChange={(v) => setMethod(v as Method)}>
              <TabsList className="w-full">
                <TabsTrigger value="card" className="gap-1.5">
                  <CreditCard className="w-4 h-4" /> Tarjeta
                </TabsTrigger>
                <TabsTrigger value="yape" className="gap-1.5">
                  <Smartphone className="w-4 h-4" /> Yape
                </TabsTrigger>
                <TabsTrigger value="plin" className="gap-1.5">
                  <Smartphone className="w-4 h-4" /> Plin
                </TabsTrigger>
              </TabsList>

              <TabsContent value="card" className="space-y-3 mt-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Número de tarjeta</label>
                  <Input
                    inputMode="numeric"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    aria-invalid={!!errors.cardNumber}
                  />
                  {errors.cardNumber && <p className="text-xs text-destructive mt-1">{errors.cardNumber}</p>}
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Nombre del titular</label>
                  <Input
                    placeholder="Como aparece en la tarjeta"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    aria-invalid={!!errors.cardName}
                  />
                  {errors.cardName && <p className="text-xs text-destructive mt-1">{errors.cardName}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Vencimiento</label>
                    <Input
                      placeholder="MM/AA"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      aria-invalid={!!errors.expiry}
                    />
                    {errors.expiry && <p className="text-xs text-destructive mt-1">{errors.expiry}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">CVV</label>
                    <Input
                      inputMode="numeric"
                      placeholder="123"
                      maxLength={4}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      aria-invalid={!!errors.cvv}
                    />
                    {errors.cvv && <p className="text-xs text-destructive mt-1">{errors.cvv}</p>}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="yape" className="space-y-3 mt-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Número de celular (Yape)</label>
                  <Input
                    inputMode="numeric"
                    placeholder="9XXXXXXXX"
                    maxLength={9}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    aria-invalid={!!errors.phone}
                  />
                  {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Código de confirmación (6 dígitos)</label>
                  <Input
                    inputMode="numeric"
                    placeholder="123456"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    aria-invalid={!!errors.otp}
                  />
                  {errors.otp && <p className="text-xs text-destructive mt-1">{errors.otp}</p>}
                </div>
              </TabsContent>

              <TabsContent value="plin" className="space-y-3 mt-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Número de celular (Plin)</label>
                  <Input
                    inputMode="numeric"
                    placeholder="9XXXXXXXX"
                    maxLength={9}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    aria-invalid={!!errors.phone}
                  />
                  {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Código de confirmación (6 dígitos)</label>
                  <Input
                    inputMode="numeric"
                    placeholder="123456"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    aria-invalid={!!errors.otp}
                  />
                  {errors.otp && <p className="text-xs text-destructive mt-1">{errors.otp}</p>}
                </div>
              </TabsContent>
            </Tabs>

            {errors.general && <p className="text-sm text-destructive">{errors.general}</p>}

            <Button onClick={handlePay} disabled={processing} className="w-full mt-2">
              {processing && <Loader2 className="w-4 h-4 animate-spin" />}
              {processing ? 'Procesando pago...' : `Pagar ${price}`}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
