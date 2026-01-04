export type Order = {
  id: string;
  order_number: string;
  date: string;
  brand: string;
  items: string;
  total: string;
  status: 'paid' | 'delivered' | 'processing' | 'pending' | 'canceled' | 'failed';
};
