'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    IconBell,
    IconShield,
} from '@tabler/icons-react';
import { createClient } from '@/utils/supabase/client';
import { useAccount } from '@/hooks/useAccount';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'critical' | 'high' | 'medium' | 'low';
    timestamp: string;
    is_read: boolean;
    mailEventId: string;
}

export const NotificationBell = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const supabase = createClient();
    const { accountId } = useAccount();
    const router = useRouter();

    useEffect(() => {
        if (!accountId) return;
        loadNotifications();
    }, [accountId]);

    const loadNotifications = async () => {
        if (!accountId) return;

        try {
            const { data: mailEvents, error } = await supabase
                .from('mail_events')
                .select('*')
                .eq('account_id', accountId)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) {
                console.error('Error loading notifications:', error);
                return;
            }

            if (!mailEvents) {
                setNotifications([]);
                setUnreadCount(0);
                return;
            }

            const formattedNotifications = mailEvents.map(event => ({
                id: event.id,
                title: `${(event.threat_level || 'UNKNOWN').toUpperCase()} Threat Detected`,
                message: `${event.subject || 'Unknown Subject'} from ${event.sender || 'Unknown Sender'}`,
                type: (event.threat_level as 'critical' | 'high' | 'medium' | 'low') || 'low',
                timestamp: event.created_at,
                is_read: event.is_read || false,
                mailEventId: event.id,
            }));

            setNotifications(formattedNotifications);
            setUnreadCount(formattedNotifications.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Error:', error);
            setNotifications([]);
            setUnreadCount(0);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.is_read) {
            try {
                await supabase
                    .from('mail_events')
                    .update({ is_read: true })
                    .eq('id', notification.id);

                setNotifications(prev =>
                    prev.map(n =>
                        n.id === notification.id ? { ...n, is_read: true } : n
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error('Error marking as read:', error);
            }
        }

        setIsOpen(false);
        router.push(`/dashboard/emails/${notification.mailEventId}`);
    };

    const formatTime = (timestamp: string) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now.getTime() - time.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    return (
        <div data-tour="threat-alerts">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button variant="ghost" className="relative cursor-pointer">
                        <IconBell className="h-8 w-8" style={{ width: '20px', height: '20px' }} />
                        {unreadCount > 0 && (
                            <Badge
                                variant="default"
                                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs"
                            >
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0">
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">
                                Threat Notifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {notifications.length === 0 ? (
                                <div className="text-center py-6 text-neutral-400">
                                    <IconShield className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
                                    <p className="text-sm">No notifications</p>
                                    <p className="text-xs">You're all caught up!</p>
                                </div>
                            ) : (
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-3 border-b border-neutral-800 transition-colors hover:bg-neutral-700/50 cursor-pointer ${!notification.is_read ? 'bg-neutral-800/20' : ''}`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="flex items-start gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="text-sm font-medium text-neutral-200 truncate">
                                                            {notification.title}
                                                        </h4>
                                                        {!notification.is_read && (
                                                            <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-neutral-400 line-clamp-2 mb-1">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-neutral-500">
                                                            {formatTime(notification.timestamp)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </PopoverContent>
            </Popover>
        </div>
    );
};
