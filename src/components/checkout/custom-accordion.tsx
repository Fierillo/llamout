'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Heart, LoaderCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { addCustomer } from '@/lib/actions/customer';
import { addOrder, modifyOrder } from '@/lib/actions/order';
import { generatePayment, listenPayment } from '@/lib/actions/payment';

import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

import { Card, CardContent } from '../ui/card';
import { ProductType, StoreType } from '@/types';
import { sendEmail } from '@/lib/actions/email';
import { sendNOSTRMessage } from '@/lib/actions/nostr';
import { Checkbox } from "@/components/ui/checkbox";
import { subscribeToSendy } from '@/lib/actions/newsletter';
import { toast } from '@/hooks/use-toast';

type InformationProps = {
  store: StoreType;
  disabled: boolean;
  onComplete: (id: any) => void;
  onEmail: (email: string) => void;
  onPubKey: (pubkey: string) => void;
};

export function Information({ onComplete, onEmail, onPubKey, disabled, store }: InformationProps) {
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [variant, setVariant] = useState<'email' | 'pubkey'>('email');
  const [pubkey, setPubkey] = useState('');
  const [newsletter, setNewsletter] = useState(false);

  const getNewsletterEmail = () => {
    return variant === 'email' ? email : '';
  };
  
  const showNewsletterEmailField = newsletter && variant === 'pubkey';

  async function onSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
  
    try {
      if (variant === 'email' && (!name || !email)) return;
      if (variant === 'pubkey' && !pubkey) return;
      if (newsletter && variant === 'pubkey' && !email) return;
  
      const id = await addCustomer({ 
        name, 
        email,
        pubkey, 
        store_id: String(store?.id), 
        newsletter
      });

      // If user activated newsletter check-box send email to Sendy service
      if (newsletter) {
        try {
          const result = await subscribeToSendy(email, name);
          toast({
            title: "¡Suscripción exitosa!",
            description: "Te has suscrito correctamente al newsletter.",
            variant: "default",
          });
        } catch (error) {
          console.error('Error al suscribir al newsletter:', error);
          toast({
            title: "Error en la suscripción al newsletter",
            description: "Hubo un problema técnico. Por favor intenta de nuevo más tarde.",
            variant: "destructive",
          });
        }
      }
  
      onComplete(id);
      onEmail(email);
      onPubKey(pubkey);
    } catch (error) {
      console.error('Error in form submission:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar tu solicitud.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className='flex flex-col gap-4 w-full px-4' onSubmit={onSubmit}>
      {/* <Card className='w-full'>
        <CardContent className='pt-6'> */}
      <div className='flex flex-col gap-4'>
        {variant === 'email' ? (
          <>
            <div className='grid gap-2'>
              <Label htmlFor='name'>Nombre *</Label>
              <Input
                id='name'
                type='text'
                placeholder='Satoshi'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='email'>Email *</Label>
              <Input
                id='email'
                type='email'
                placeholder='para recibir el ticket'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="newsletter" 
                checked={newsletter}
                onCheckedChange={(checked) => setNewsletter(checked as boolean)}
              />
              <label
                htmlFor="newsletter"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Suscribirme al newsletter
              </label>
            </div>
          </>
        ) : (
          <>
            <div className='grid gap-2'>
              <Label htmlFor='pubkey'>Pubkey *</Label>
              <Input
                id='pubkey'
                type='text'
                placeholder='NIP-05, npub or hex format'
                value={pubkey}
                onChange={(e) => setPubkey(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="newsletter" 
                  checked={newsletter}
                  onCheckedChange={(checked) => {
                    setNewsletter(checked as boolean);
                    if (!checked) {
                      setEmail('');
                    }
                  }}
                />
                <label
                  htmlFor="newsletter"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Suscribirme al newsletter
                </label>
              </div>
              {/* Add email field if newsletter checkbox is activated */}
              {newsletter && (
                <div className='grid gap-2 mt-2'>
                  <Label htmlFor='email'>Email para newsletter</Label>
                  <Input
                    id='email'
                    type='email'
                    placeholder='tu@email.com'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required={newsletter}
                  />
                </div>
              )}
            </div>
          </>
        )}
        <Button
          className='w-full hover:bg-green-400'
          disabled={
            (variant === 'email' ? !name || !email : !pubkey) || 
            (newsletter && variant === 'pubkey' && !email) || 
            loading || 
            disabled
          }
          type='submit'
        >
          Pagar {loading && <LoaderCircle className='size-8 animate-spin' />}
        </Button>
      </div>
      {/* </CardContent>
      </Card> */}
      <div className='flex items-center gap-2 px-4'>
        <div className='w-full h-[1px] bg-gray-300'></div>
        <span className='text-sm text-muted-foreground'>ó</span>
        <div className='w-full h-[1px] bg-gray-300'></div>
      </div>
      {variant === 'email' ? (
        <Button
          className='w-full hover:bg-purple-700 hover:text-white'
          variant='outline'
          //title='👷 Devs trabajando en esta funcion.'
          onClick={() => {
            setName('');
            setEmail('');
            setVariant('pubkey');
        }}
        >
          Continua con Nostr
        </Button>
      ) : (
        <Button
          className='w-full'
          variant='outline'
          onClick={() => {
            setPubkey('');
            setVariant('email');
          }}
        >
          Continua con Email
        </Button>
      )}
    </form>
  );
}

function Copyable({ value, label }: { value: string; label: string }) {
  const [disabled, setDisabled] = useState(false);
  const [copyLabel, setCopyLabel] = useState(label);

  return (
    <CopyToClipboard text={value}>
      <Button
        className='w-full'
        variant='outline'
        onClick={() => {
          setCopyLabel('Copied!');
          setDisabled(true);
          setTimeout(() => {
            setCopyLabel(label);
            setDisabled(false);
          }, 2500);
        }}
        disabled={disabled}
      >
        {copyLabel}
      </Button>
    </CopyToClipboard>
  );
}

type PaymentProps = {
  invoice: string;
  store: StoreType;
};

export function Payment({ invoice, store }: PaymentProps) {
  return (
    <div className='flex flex-col gap-4'>
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col items-center gap-4'>
            <div className='p-2 md:p-4 bg-white rounded-lg'>
              {invoice ? (
                <QRCodeSVG
                  size={260}
                  value={invoice}
                  imageSettings={{ src: store?.image, height: 32, width: 32, excavate: true }}
                />
              ) : (
                <Skeleton className='w-[260px] h-[260px] bg-black' />
              )}
            </div>
            <p className='text-center text-muted-foreground'>
              ¡Recuerda pagar con una wallet de Bitcoin compatible con Lightning Network!
            </p>
          </div>
        </CardContent>
      </Card>
      <Copyable value={invoice} label='Copy Invoice' />
    </div>
  );
}

type SummaryProps = {
  orderId: string;
  store: StoreType;
};

export function Summary({ orderId, store }: SummaryProps) {
  return (
    <div className='flex flex-col gap-4'>
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col items-center gap-4'>
            <div className='flex justify-center items-center w-12 h-12 rounded-full bg-background'>
              <Heart className='size-4 text-orange-500' />
            </div>
            <div className='flex flex-col items-center gap-2 text-center'>
              <h3 className='font-semibold text-xl tracking-tighter text-balance'>¡Pago exitoso!</h3>
              <p>
                ¡Gracias por los sats! 🫡<br />
                Revisa tu mail (o mensaje privado en NOSTR) que ya te debe haber llegado el ticket.
              </p>
            </div>
          </div>
        </CardContent>
        <CardContent className='pt-6'>
          <div className='flex flex-col items-center gap-4'>
            <div className='text-center text-muted-foreground'>
              ¡También podes guardar este QR!
            </div>
            <div className='flex justify-center items-center w-48 h-48 rounded-full bg-background'>
              <QRCodeSVG
                size={260}
                value={orderId}
                imageSettings={{ src: store?.image, height: 48, width: 48, excavate: true }}
              />
            </div>
            <div className='text-center text-muted-foreground'>
              O copiar y guardar este código: 
              <br></br>{orderId}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* {CHECKOUT?.success_url && (
        <Button className='w-full' onClick={onComplete} asChild>
          <Link href={CHECKOUT?.success_url}>Go to Home</Link>
        </Button>
      )} */}
    </div>
  );
}

type Step = 'information' | 'payment' | 'summary';

interface CustomAccordion {
  store: StoreType;
  product: ProductType;
  quantity: number;
  readOnly: boolean;
}

export function CustomAccordion(props: CustomAccordion) {
  const { store, product, quantity, readOnly } = props;

  const [activeStep, setActiveStep] = useState<Step>(readOnly ? 'payment' : 'information');
  const [completedSteps, setCompletedSteps] = useState<Step[]>([]);

  const [orderId, setOrderId] = useState<string>('');
  const [invoice, setInvoice] = useState<string>('');
  const [verify, setVerify] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [pubkey, setPubkey] = useState<string>('');

  const price = product?.price * quantity;

  useEffect(() => {
    const handlePaymentConfirmation = async (isPaid: boolean) => {
      if (isPaid) {
        try {
          await modifyOrder(orderId);
          
          if (email) {
            await sendEmail(email, orderId);
          } 
          else if (pubkey) {
            await sendNOSTRMessage(pubkey,orderId);
          }
          else {
            throw new Error('There is no email or pubkey to send the ticket!');
          }
          handleComplete('payment');
        } catch (error) {
          console.error('Error en confirmación de pago:', error);
        }
      }
    };
  
    if (orderId && verify) {
      listenPayment({
        verifyUrl: verify,
        intervalMs: 5000,
        maxRetries: 48,
        onPaymentConfirmed: handlePaymentConfirmation,
        onPaymentFailed: () => {
          console.log('Falló la verificación del pago');
        },
      });
    }
  }, [orderId, verify, email, store?.name]);

  const handleComplete = async (step: Step) => {
    setCompletedSteps([...completedSteps, step]);
    const nextStep = getNextStep(step);
    if (nextStep) {
      setActiveStep(nextStep);
    }
  };

  const getNextStep = (currentStep: Step): Step | null => {
    const steps: Step[] = ['information', 'payment', 'summary'];
    const currentIndex = steps.indexOf(currentStep);
    return steps[currentIndex + 1] || null;
  };

  const isCompleted = (step: Step) => completedSteps.includes(step);

  const renderIcon = (step: Step) => {
    if (isCompleted(step)) return <Check className='size-4 text-green-500' />;
    switch (step) {
      case 'information':
        return <span className='text-sm text-muted-foreground'>1</span>;
      case 'payment':
        return <span className='text-sm text-muted-foreground'>2</span>;
      case 'summary':
        return <span className='text-sm text-muted-foreground'>3</span>;
    }
  };

  return (
    <Accordion type='single' value={activeStep} className='w-full max-w-sm' {...props}>
      <AccordionItem value='information'>
        <AccordionTrigger className='flex justify-between'>
          <div className='flex items-center gap-2'>
            <div className='flex justify-center items-center w-8 h-8 rounded bg-white border'>
              {renderIcon('information')}
            </div>
            <span>Información</span>
          </div>
          {/* {isCompleted('information') && <span className='text-sm text-green-500'>Completed</span>} */}
        </AccordionTrigger>
        <AccordionContent>
          <Information
            store={store}
            disabled={readOnly}
            onEmail={setEmail}
            onPubKey={setPubkey}
            onComplete={async (id) => {
              const _id = await addOrder({
                customer_id: id,
                product_id: String(product?.id),
                amount: price,
                currency: product?.currency,
                quantity,
              });

              setOrderId(_id);
              handleComplete('information');

              // General Payment
              // TO-DO: Validate LUD16
              const data = await generatePayment({
                lightningAddress: store?.lnaddress,
                amount: price,
              });

              setInvoice(data?.invoice?.pr);
              setVerify(data?.invoice?.verify);
            }}
          />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value='payment'>
        <AccordionTrigger className='flex justify-between' disabled={!isCompleted('information')}>
          <div className='flex items-center gap-2'>
            <div className='flex justify-center items-center w-8 h-8 rounded bg-white border'>
              {renderIcon('payment')}
            </div>
            <span>Pago</span>
          </div>
          {/* {isCompleted('payment') && <span className='text-sm text-green-500'>Completed</span>} */}
        </AccordionTrigger>
        <AccordionContent>
          <Payment store={store} invoice={invoice} />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value='summary'>
        <AccordionTrigger className='flex justify-between' disabled={!isCompleted('payment')}>
          <div className='flex items-center gap-2'>
            <div className='flex justify-center items-center w-8 h-8 rounded bg-white border'>
              {renderIcon('summary')}
            </div>
            <span>Sumario</span>
          </div>
          {/* {isCompleted('summary') && <span className='text-sm text-green-500'>Completed</span>} */}
        </AccordionTrigger>
        <AccordionContent>
          <Summary orderId={orderId} store={store} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
