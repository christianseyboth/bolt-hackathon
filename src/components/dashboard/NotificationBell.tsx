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
    IconAlertTriangle,
    IconShield,
    IconMail,
    IconCheck,
    IconX
} from '@tabler/icons-react';
import { createClient } from '@/utils/supabase/client';
import { useAccount } from '@/hooks/useAccount';

interface MailEvent {
    id: string;
    subject: string | null;
    sender: string | null;
    threat_level: 'critical' | 'high' | 'medium' | 'low' | null;
    threat_type: string | null;
    created_at: string;
    is_read?: boolean | null;
}

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
        if (!accountId) return; // Wait for accountId to be available

        // Load initial notifications
        loadNotifications();

        // Set up realtime subscription with account filtering
        const channel = supabase
            .channel('mail_events_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'mail_events',
                    filter: `account_id=eq.${accountId}`, // Filter by account_id
                },
                (payload) => {
                    console.log('New mail event:', payload);
                    handleNewMailEvent(payload.new as MailEvent);
                }
            )
            .subscribe((status) => {
                console.log('Subscription status:', status);
            });

        return () => {
            console.log('Cleaning up subscription');
            supabase.removeChannel(channel);
        };
    }, [accountId]); // Add accountId as dependency

    const loadNotifications = async () => {
        try {
            const { data: mailEvents, error } = await supabase
                .from('mail_events')
                .select('*')
                .eq('account_id', accountId)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) {
                console.error('Supabase error:', error);
                return;
            }

            if (!mailEvents) {
                setNotifications([]);
                setUnreadCount(0);
                return;
            }

            const notifications = mailEvents
                .filter(event => event && event.id)
                .map(event => createNotificationFromMailEvent(event))
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            setNotifications(notifications);
            setUnreadCount(notifications.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Error loading notifications:', error);
            setNotifications([]);
            setUnreadCount(0);
        }
    };

    const handleNewMailEvent = (mailEvent: MailEvent) => {
        const notification = createNotificationFromMailEvent(mailEvent);

        setNotifications(prev => {
            const updated = [notification, ...prev].slice(0, 10);
            return updated.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        });

        setUnreadCount(prev => prev + 1);

        // Show browser notification for critical/high threats
        if (mailEvent.threat_level === 'critical' || mailEvent.threat_level === 'high') {
            if (Notification.permission === 'granted') {
                new Notification(`${mailEvent.threat_level.toUpperCase()} Threat Detected`, {
                    body: `${mailEvent.threat_type} from ${mailEvent.sender}`,
                    icon: '/favicon.ico',
                });
            }
        }
    };

    const createNotificationFromMailEvent = (mailEvent: MailEvent): Notification => {
        const getThreatTitle = (riskLevel: string, threatType: string) => {
            const level = (riskLevel || 'unknown').toUpperCase();
            const type = threatType || 'Threat';
            return `${level} ${type} Detected`;
        };

        const getThreatMessage = (subject: string, sender: string) => {
            const safeSubject = subject || 'Unknown Subject';
            const safeSender = sender || 'Unknown Sender';
            return `"${safeSubject}" from ${safeSender}`;
        };

        return {
            id: mailEvent.id,
            title: getThreatTitle(mailEvent.threat_level || '', mailEvent.threat_type || ''),
            message: getThreatMessage(mailEvent.subject || '', mailEvent.sender || ''),
            type: (mailEvent.threat_level as 'critical' | 'high' | 'medium' | 'low') || 'low',
            timestamp: mailEvent.created_at || new Date().toISOString(),
            is_read: mailEvent.is_read || false,
            mailEventId: mailEvent.id,
        };
    };

    const markAsRead = async (notificationId: string) => {
        try {
            // Update in database
            await supabase
                .from('mail_events')
                .update({ is_read: true })
                .eq('id', notificationId);

            // Update local state
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId ? { ...n, is_read: true } : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const { data, error } = await supabase
                .from('mail_events')
                .update({ is_read: true })
                .eq('account_id', accountId)
                .select('id, is_read');

            if (error) {
                console.error('Database update error:', error);
                return;
            }

            if (data && data.length > 0) {
                await loadNotifications();
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'critical':
            case 'high':
                return <IconAlertTriangle className="h-4 w-4 text-red-400" />;
            default:
                return <IconShield className="h-4 w-4 text-amber-400" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'critical': return 'text-red-400';
            case 'high': return 'text-orange-400';
            case 'medium': return 'text-amber-400';
            case 'low': return 'text-blue-400';
            default: return 'text-neutral-400';
        }
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

    // Request notification permission on component mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const handleNotificationClick = (notification: Notification) => {
        // Mark as read when clicked
        if (!notification.is_read) {
            markAsRead(notification.id);
        }

        // Close the popover
        setIsOpen(false);

        // Navigate to the specific email
        router.push(`/dashboard/emails/${notification.mailEventId}`);
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
                <PopoverContent className="w-80 p-0" align="end">
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium">
                                    Threat Notifications
                                </CardTitle>
                                {unreadCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs"
                                        onClick={markAllAsRead}
                                    >
                                        Mark all read
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
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
                                            className={`p-3 border-b border-neutral-800 transition-colors hover:bg-neutral-700/50 cursor-pointer ${!notification.is_read ? 'bg-neutral-800/20' : ''
                                                }`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    {getNotificationIcon(notification.type)}
                                                </div>
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
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-neutral-500">
                                                            {formatTime(notification.timestamp)}
                                                        </span>
                                                        <span className="text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            Click to view
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
