'use client';

import React, { useState, useEffect } from 'react';
import { Container } from './container';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './button';
import { Badge } from './ui/badge';
import {
  IconCheck,
  IconCrown,
  IconBolt,
  IconStar,
  IconUsers,
  IconShield,
  IconLoader
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Plan {
  id: string;
  name: string;
  description: string;
  metadata: Record<string, string>;
  prices: {
    id: string;
    amount: number;
    currency: string;
    interval: string | null;
    interval_count: number | null;
  }[];
}

export function PricingSection() {
  const [products, setProducts] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/stripe/products', {
          cache: 'no-store'
        });

        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
        } else {
          // Fallback to mock data for display
          setProducts(getMockProducts());
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to mock data
        setProducts(getMockProducts());
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const getMockProducts = (): Plan[] => [
    {
      id: 'prod_solo',
      name: 'Solo',
      description: 'Perfect for individual professionals',
      metadata: {},
      prices: [
        { id: 'price_solo_monthly', amount: 1900, currency: 'usd', interval: 'month', interval_count: 1 },
        { id: 'price_solo_yearly', amount: 19000, currency: 'usd', interval: 'year', interval_count: 1 }
      ]
    },
    {
      id: 'prod_entrepreneur',
      name: 'Entrepreneur',
      description: 'Ideal for growing businesses',
      metadata: {},
      prices: [
        { id: 'price_entrepreneur_monthly', amount: 4900, currency: 'usd', interval: 'month', interval_count: 1 },
        { id: 'price_entrepreneur_yearly', amount: 49000, currency: 'usd', interval: 'year', interval_count: 1 }
      ]
    },
    {
      id: 'prod_team',
      name: 'Team',
      description: 'Advanced features for teams',
      metadata: {},
      prices: [
        { id: 'price_team_monthly', amount: 9900, currency: 'usd', interval: 'month', interval_count: 1 },
        { id: 'price_team_yearly', amount: 99000, currency: 'usd', interval: 'year', interval_count: 1 }
      ]
    }
  ];

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'solo':
        return <IconBolt className="h-5 w-5 text-blue-400" />;
      case 'entrepreneur':
        return <IconStar className="h-5 w-5 text-purple-400" />;
      case 'team':
        return <IconUsers className="h-5 w-5 text-emerald-400" />;
      default:
        return <IconShield className="h-5 w-5 text-neutral-400" />;
    }
  };

  const getPlanFeatures = (planName: string) => {
    const features: Record<string, string[]> = {
      'Solo': [
        'Up to 1,000 email scans per month',
        'Real-time phishing detection',
        'Basic AI threat analysis',
        'Email & chat support',
        'Standard security rules',
        'API access',
        'Mobile app access'
      ],
      'Entrepreneur': [
        'Up to 5,000 email scans per month',
        'Advanced threat detection',
        'AI-powered malware scanning',
        'Priority support',
        'Custom security policies',
        'Full API access',
        'Advanced reporting',
        'Team collaboration tools',
        'Slack/Teams integration'
      ],
      'Team': [
        'Up to 20,000 email scans per month',
        'Enterprise threat detection',
        'Advanced AI analysis',
        'Dedicated account manager',
        'Custom integrations',
        'HIPAA compliance ready',
        'Multi-team management',
        'Advanced analytics',
        'SSO integration',
        'Custom reporting'
      ]
    };
    return features[planName] || [];
  };

  const getPopularPlan = () => 'Entrepreneur';

  if (loading) {
    return (
      <Container className="py-20">
        <div className="flex justify-center items-center">
          <IconLoader className="h-8 w-8 animate-spin text-emerald-400" />
          <span className="ml-2 text-neutral-400">Loading pricing...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-20">
      {/* Billing Toggle */}
      <div className="flex justify-center mb-12">
        <div className="flex items-center space-x-4 bg-neutral-900/50 rounded-lg p-1 border border-neutral-800">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
              billingCycle === 'monthly'
                ? 'bg-emerald-600 text-white'
                : 'text-neutral-400 hover:text-white'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2',
              billingCycle === 'yearly'
                ? 'bg-emerald-600 text-white'
                : 'text-neutral-400 hover:text-white'
            )}
          >
            <span>Yearly</span>
            <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">Save 20%</Badge>
          </button>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {products.map((product) => {
          const monthlyPrice = product.prices.find(p => p.interval === 'month');
          const yearlyPrice = product.prices.find(p => p.interval === 'year');
          const currentPrice = billingCycle === 'monthly' ? monthlyPrice : yearlyPrice;
          const isPopular = product.name === getPopularPlan();

          if (!currentPrice) return null;

          return (
            <Card
              key={product.id}
              className={cn(
                'relative border-neutral-800 bg-neutral-900/50 backdrop-blur-sm hover:bg-neutral-900/70 transition-all duration-300 group',
                'hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10',
                isPopular && 'border-emerald-500/50 shadow-emerald-500/10 shadow-2xl scale-105 bg-emerald-500/5'
              )}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-emerald-600 text-white px-3 py-1">
                    <IconCrown className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <div className={cn(
                    'p-3 rounded-lg',
                    isPopular ? 'bg-emerald-500/20' : 'bg-neutral-800/50'
                  )}>
                    {getPlanIcon(product.name)}
                  </div>
                </div>

                <CardTitle className="text-xl font-semibold mb-2">
                  {product.name}
                </CardTitle>

                <p className="text-neutral-400 text-sm mb-4">
                  {product.description}
                </p>

                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {formatPrice(currentPrice.amount, currentPrice.currency)}
                    <span className="text-lg font-normal text-neutral-400">
                      /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && monthlyPrice && (
                    <p className="text-sm text-emerald-400 mt-1">
                      Billed annually • Save {Math.round((1 - (currentPrice.amount / 12) / monthlyPrice.amount) * 100)}%
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3 mb-6">
                  {getPlanFeatures(product.name).map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <IconCheck className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-neutral-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href="/dashboard" className="block w-full">
                  <Button
                    variant={isPopular ? "primary" : "outline"}
                    className={cn(
                      'w-full transition-all duration-200',
                      isPopular
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'border-neutral-700 hover:border-emerald-500/50 text-neutral-300 hover:text-white'
                    )}
                  >
                    Start Free Trial
                  </Button>
                </Link>

                <p className="text-xs text-neutral-500 text-center mt-3">
                  14-day free trial • No credit card required
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Enterprise Option */}
      <div className="mt-16 text-center">
        <Card className="max-w-2xl mx-auto border-neutral-800 bg-neutral-900/30">
          <CardContent className="p-8">
            <div className="flex items-center justify-center mb-4">
              <IconShield className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
            <p className="text-neutral-400 mb-6">
              Custom pricing for large organizations with advanced security requirements
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/contact">
                <Button variant="outline" className="border-emerald-600 text-emerald-400 hover:bg-emerald-600 hover:text-white">
                  Contact Sales
                </Button>
              </Link>
              <span className="text-sm text-neutral-500">
                SOC2 • HIPAA • Custom SLA
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
