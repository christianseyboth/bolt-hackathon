import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
    if (!stripePromise) {
        stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
    }
    return stripePromise;
};

export const formatPrice = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
    }).format(amount / 100);
};

export const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const calculateSavings = (monthlyPrice: number, yearlyPrice: number) => {
    const monthlyTotal = monthlyPrice * 12;
    return monthlyTotal - yearlyPrice;
};

export const formatSavingsPercentage = (monthlyPrice: number, yearlyPrice: number) => {
    const savings = calculateSavings(monthlyPrice, yearlyPrice);
    const percentage = (savings / (monthlyPrice * 12)) * 100;
    return Math.round(percentage);
};
