import axios from 'axios';

const YADIO_API_URL = 'https://api.yadio.io/rate/ARS/BTC';

// Get the ARS/BTC exchange rate from Yadio.io
export async function getExchangeRate(): Promise<number> {
  try {
    const response = await axios.get(YADIO_API_URL);
    const exchangeRate = response.data.rate;

    if (!exchangeRate) {
      throw new Error('No se pudo obtener la tasa de cambio.');
    }

    return exchangeRate;
  } catch (error) {
    console.error('Error al obtener la tasa de cambio:', error);
    throw new Error('No se pudo obtener la tasa de cambio desde Yadio.io.');
  }
}

// Calculate the price in SATs 
export async function calculatePriceInSAT(priceInArs: number): Promise<number> {
  return priceInArs / (await getExchangeRate()/100000000);
}