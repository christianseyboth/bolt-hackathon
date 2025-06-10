export const tourSteps = [
    {
        target: '[data-tour="welcome"]',
        title: '👋 Welcome to SecPilot!',
        content: 'Let\'s take a quick tour to get you started with email security monitoring. This will only take 2 minutes.',
        placement: 'center'
    },
    {
        target: '[data-tour="security-score"]',
        title: '🛡️ Your Security Score',
        content: 'This shows your overall email security health. Higher scores mean better protection. You\'ll see this improve as we analyze your emails.',
        placement: 'bottom'
    },
    {
        target: '[data-tour="email-forwarding"]',
        title: '📧 Email Forwarding Setup',
        content: 'The most important step! Set up email forwarding to start analyzing threats. Click Next to go to the detailed setup page.',
        placement: 'left',
        action: () => {
            // Preserve tour state before navigation
            localStorage.setItem('tour-current-step', '3');
            localStorage.setItem('tour-navigating', 'true');
            // Navigate to profile email tab
            window.location.href = '/dashboard/profile?tab=email';
        }
    },
    {
        target: '[data-tour="email-setup-detailed"]',
        title: '⚙️ Detailed Email Setup',
        content: 'Here you can configure your email forwarding settings in detail.',
        placement: 'bottom'
    },
    {
        target: '[data-tour="threat-alerts"]',
        title: '🚨 Threat Alerts',
        content: 'Click the bell icon to see real-time threat notifications. You\'ll get notified immediately when suspicious emails are detected. Click Next to see all your emails.',
        placement: 'bottom',
        action: () => {
            // Preserve tour state before navigation to emails page
            localStorage.setItem('tour-current-step', '5');
            localStorage.setItem('tour-navigating', 'true');
            // Navigate to emails page
            window.location.href = '/dashboard/emails';
        }
    },
    {
        target: '[data-tour="email-list"]',
        title: '📊 Email Analysis',
        content: 'View all your analyzed emails here. See threat classifications, risk levels, and detailed analysis reports.',
        placement: 'top'
    },
    // {
    //     target: '[data-tour="profile-settings"]',
    //     title: '⚙️ Profile & Settings',
    //     content: 'Customize your security preferences, notification settings, and API access from your profile.',
    //     placement: 'left'
    // },
    {
        target: '[data-tour="help-center"]',
        title: '💡 Need Help?',
        content: 'Access documentation, tutorials, and support from the help center. We\'re always here to assist you!',
        placement: 'bottom'
    }
];
