import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    IconBell,
    IconAlertTriangle,
    IconShield,
    IconSettings,
    IconCheck
} from '@tabler/icons-react';

interface ThreatAlert {
    id: string;
    type: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    timestamp: string;
    isRead: boolean;
}

const mockAlerts: ThreatAlert[] = [
    {
        id: '1',
        type: 'critical',
        title: 'Phishing Email Detected',
        description: 'Suspicious email mimicking your bank detected from unknown sender',
        timestamp: '2 minutes ago',
        isRead: false
    },
    {
        id: '2',
        type: 'high',
        title: 'Malware Attachment',
        description: 'Email contains suspicious .exe attachment',
        timestamp: '1 hour ago',
        isRead: false
    },
    {
        id: '3',
        type: 'medium',
        title: 'Suspicious Link',
        description: 'Email contains potentially harmful URL',
        timestamp: '3 hours ago',
        isRead: true
    }
];

const getAlertColor = (type: string) => {
    switch (type) {
        case 'critical': return 'bg-red-500';
        case 'high': return 'bg-orange-500';
        case 'medium': return 'bg-amber-500';
        case 'low': return 'bg-blue-500';
        default: return 'bg-neutral-500';
    }
};

const getAlertIcon = (type: string) => {
    switch (type) {
        case 'critical':
        case 'high':
            return <IconAlertTriangle className="h-4 w-4" />;
        default:
            return <IconShield className="h-4 w-4" />;
    }
};

export const ThreatAlertsCard = () => {
    const unreadCount = mockAlerts.filter(alert => !alert.isRead).length;

    return (
        <Card className="border border-neutral-800 bg-neutral-900">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <IconBell className="h-5 w-5 text-amber-400" />
                        Threat Alerts
                        {unreadCount > 0 && (
                            <Badge variant="default" className="bg-red-500 text-white">
                                {unreadCount} new
                            </Badge>
                        )}
                    </CardTitle>
                    <Button variant="outline" size="sm">
                        <IconSettings className="h-4 w-4 mr-1" />
                        Settings
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {mockAlerts.length === 0 ? (
                        <div className="text-center py-6 text-neutral-400">
                            <IconShield className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
                            <p className="text-sm">No active threats detected</p>
                            <p className="text-xs">Your email security is looking good!</p>
                        </div>
                    ) : (
                        <>
                            {mockAlerts.slice(0, 3).map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`p-3 rounded-lg border transition-all hover:bg-neutral-800/50 ${alert.isRead
                                            ? 'bg-neutral-800/20 border-neutral-700'
                                            : 'bg-neutral-800/40 border-neutral-600'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-1 rounded-full ${getAlertColor(alert.type)}`}>
                                            {getAlertIcon(alert.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-sm font-medium text-neutral-200 truncate">
                                                    {alert.title}
                                                </h4>
                                                <Badge
                                                    variant="secondary"
                                                    className={`text-xs ${getAlertColor(alert.type)} text-white`}
                                                >
                                                    {alert.type.toUpperCase()}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-neutral-400 mb-2 line-clamp-2">
                                                {alert.description}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-neutral-500">{alert.timestamp}</span>
                                                {!alert.isRead && (
                                                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                                        <IconCheck className="h-3 w-3 mr-1" />
                                                        Mark Read
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {mockAlerts.length > 3 && (
                                <Button variant="outline" className="w-full mt-3">
                                    View All Alerts ({mockAlerts.length})
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
