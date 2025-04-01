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
};
