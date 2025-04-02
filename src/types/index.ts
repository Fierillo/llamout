export type ProductType = {
  variants: any;
  id?: string;
  image: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  discounts: Array<{
    code: string;
    description: string;
    amount: number;
    type: 'percentage' | 'fixed';
    valid_until: string;
    valid_from: string;
    max_uses: number;
  }>;
}
export type StoreType = {
  id?: string;
  website: string;
  name: string;
  image: string;
  lnaddress: string;
};
