export const STORE = {
  id: 'company-1',
  // image: show image 48x48
  image: 'images/logo.png',
  name: 'La Crypta |🇦🇷',
  website: 'https://x.com/lacryptaok',
  lnaddress: process.env.NEXT_LN_ADDRESS,
};

export const CHECKOUT = {
  success_url: '',
  cancel_url: '',
  // submit_type: '' | 'donate'
  submit_type: 'donate',
  // locale: only 'en'
  locale: 'en',
};

export const PRODUCT = {
  id: 'Rabbit hole ticket',
  // image: 4/3 aspect ratio
  image:
    '',
  name: `RABBIT HOLE PARTY`,
  description: '¡Reserva tu entrada para una fiesta EXCLUSIVA de la mejor comunidad Bitcoiner!',
  price: 15000,
  // currency: only 'SAT'
  currency: 'ARS',
  variants: null,
  discounts: [
    {
      code: process.env.NEXT_DISCOUNT_CODE1,
      description: '10% de descuento',
      amount: 20,
      type: 'percentage',
      valid_until: '2025-04-10',
      valid_from: '2025-04-01',
      // max_uses: 0,
    },
    {
      code: process.env.NEXT_DISCOUNT_CODE2,
      description: '20% de descuento',
      amount: 30,
      type: 'percentage',
      valid_until: '2025-04-10',
      valid_from: '2025-04-01',
      // max_uses: 0,
    },
    {
      code: process.env.NEXT_DISCOUNT_CODE3,
      description: '30% de descuento',
      amount: 40,
      type: 'percentage',
      valid_until: '2025-04-10',
      valid_from: '2025-04-01',
      // max_uses: 0,
    },
    {
      code: process.env.NEXT_DISCOUNT_CODE4,
      description: 'Descuento especial',
      amount: -20,
      type: 'percentage',
      valid_until: '2025-04-10',
      valid_from: '2025-04-01',
      // max_uses: 0,
    }
  ]
};
