// Shared feature matrix for pricing and subscription components
export const allFeatures = [
    {
        name: 'Email scans per month',
        description: 'Monthly email analysis limit',
        plans: {
            Solo: '10 scans per month',
            Entrepreneur: '30 scans per month',
            Team: '100 scans per month'
        }
    },
    {
        name: 'AI threat analysis',
        description: 'Artificial intelligence powered threat detection',
        plans: {
            Solo: true,
            Entrepreneur: true,
            Team: true
        }
    },
    {
        name: 'Support level',
        description: 'Customer support and assistance',
        plans: {
            Solo: 'Email & Chat Support',
            Entrepreneur: 'Email & Chat Support',
            Team: 'Priority Support'
        }
    },
    {
        name: 'Advanced Analytics',
        description: 'Advanced Analytics',
        plans: {
            Solo: false,
            Entrepreneur: true,
            Team: true
        }
    },
    {
        name: 'API access',
        description: 'Programmatic access to security features',
        plans: {
            Solo: false,
            Entrepreneur: false,
            Team: true
        }
    },
    {
        name: 'Reporting',
        description: 'Advanced reporting Possibility',
        plans: {
            Solo: false,
            Entrepreneur: false,
            Team: true
        }
    },
];

export interface FeatureItem {
    name: string;
    description: string;
    included: string | boolean;
    value: string | boolean;
}

export const getPlanFeatures = (planName: string): FeatureItem[] => {
    return allFeatures.map(feature => ({
        name: feature.name,
        description: feature.description,
        included: feature.plans[planName as keyof typeof feature.plans],
        value: feature.plans[planName as keyof typeof feature.plans]
    }));
};

// Legacy function for backward compatibility
export const getDefaultFeatures = (planName: string): string[] => {
    return getPlanFeatures(planName)
        .filter(feature => feature.included !== false)
        .map(feature =>
            typeof feature.included === 'string'
                ? feature.included
                : feature.name
        );
};
