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
        target: '[data-tour="team-setup"]',
        title: '👥 Team Email Setup',
        content: 'Add the email addresses that will be sending emails for analysis. This is crucial for monitoring threats from your team members.',
        placement: 'left',
        action: () => {
            // Preserve tour state before navigation (save NEXT step)
            localStorage.setItem('proactiv-tour-step', '3');
            localStorage.setItem('tour-navigating', 'true');
            // Navigate to team page
            window.location.href = '/dashboard/team';
        }
    },
    {
        target: '[data-tour="add-team-member"]',
        title: '📧 Add Team Member',
        content: 'Add email addresses of team members who will be sending emails for security analysis. Each email added here will be monitored for threats. Click Next to proceed to email forwarding setup.',
        placement: 'top',
        action: () => {
            localStorage.setItem('proactiv-tour-step', '4');
            localStorage.setItem('tour-navigating', 'true');
            window.location.href = '/dashboard/profile?tab=email';
        }
    },
    {
        target: '[data-tour="email-forwarding"]',
        title: '📧 Email Forwarding Setup',
        content: 'The most important step! Set up email forwarding to start analyzing threats. This is where you get your unique forwarding address.',
        placement: 'top'
    },
    {
        target: '[data-tour="threat-alerts"]',
        title: '🚨 Threat Alerts',
        content: 'Click the bell icon to see real-time threat notifications. You\'ll get notified immediately when suspicious emails are detected. Click Next to see all your emails.',
        placement: 'bottom',
        action: () => {
            // Preserve tour state before navigation to emails page
            localStorage.setItem('proactiv-tour-step', '6');
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
