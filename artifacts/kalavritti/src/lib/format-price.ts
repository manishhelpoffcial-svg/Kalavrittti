export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

export const calculateDiscount = (mrp: number, price: number) => {
  if (mrp <= price) return null;
  return Math.round((1 - price / mrp) * 100);
};
