'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    IconBell,
    IconShield,
    IconCheck,
    IconChecks,
    IconMail,
    IconAlertTriangle,
} from '@tabler/icons-react';
import { createClient } from '@/utils/supabase/client';
import { useAccount } from '@/hooks/useAccount';
import { useToast } from '@/components/ui/use-toast';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'critical' | 'high' | 'medium' | 'low';
    timestamp: string;
    is_read: boolean;
    mailEventId: string;
}

// Global subscription manager to prevent multiple subscriptions
class RealtimeSubscriptionManager {
    private static instance: RealtimeSubscriptionManager;
    private channel: any = null;
    private subscribers: Set<(event: any, type: 'new' | 'update') => void> = new Set();
    private supabase = createClient();
    private currentAccountId: string | null = null;

    static getInstance(): RealtimeSubscriptionManager {
        if (!RealtimeSubscriptionManager.instance) {
            RealtimeSubscriptionManager.instance = new RealtimeSubscriptionManager();
        }
        return RealtimeSubscriptionManager.instance;
    }

    subscribe(accountId: string, callback: (event: any, type: 'new' | 'update') => void) {
        this.subscribers.add(callback);

        // If we need to change account or start fresh subscription
        if (this.currentAccountId !== accountId) {
            this.cleanup();
            this.currentAccountId = accountId;
            this.setupSubscription(accountId);
        }

        return () => {
            this.subscribers.delete(callback);
            if (this.subscribers.size === 0) {
                this.cleanup();
            }
        };
    }

    private setupSubscription(accountId: string) {
        if (this.channel) return; // Already subscribed

        console.log('Setting up global realtime subscription for accountId:', accountId);

        this.channel = this.supabase
            .channel(`mail-events-${accountId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'mail_events',
                    filter: `account_id=eq.${accountId}`,
                },
                (payload) => {
                    console.log('Global subscription - Change received!', payload);

                    const eventType = payload.eventType === 'INSERT' ? 'new' : 'update';
                    this.subscribers.forEach((callback) => {
                        callback(payload.new, eventType);
                    });
                }
            )
            .subscribe((status) => {
                console.log('Global subscription status:', status);
            });
    }

    private cleanup() {
        if (this.channel) {
            console.log('Cleaning up global realtime subscription');
            this.supabase.removeChannel(this.channel);
            this.channel = null;
        }
        this.currentAccountId = null;
    }
}

export const NotificationBell = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [hasNewNotification, setHasNewNotification] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<
        'connecting' | 'connected' | 'error' | 'disconnected'
    >('disconnected');
    const supabase = createClient();
    const { accountId } = useAccount();
    const router = useRouter();
    const { toast } = useToast();
    const subscriptionManager = RealtimeSubscriptionManager.getInstance();

    useEffect(() => {
        if (!accountId) {
            console.log('No accountId available, skipping realtime setup');
            return;
        }

        console.log('NotificationBell: Setting up with accountId:', accountId);
        loadNotifications();

        // Subscribe to global realtime updates
        const unsubscribe = subscriptionManager.subscribe(accountId, (event, type) => {
            if (type === 'new') {
                handleNewThreatDetected(event);
            } else if (type === 'update') {
                handleThreatUpdated(event);
            }
        });

        setConnectionStatus('connected');

        return unsubscribe;
    }, [accountId]);

    const handleNewThreatDetected = (newEvent: any) => {
        const newNotification: Notification = {
            id: newEvent.id,
            title: `${(newEvent.threat_level || 'UNKNOWN').toUpperCase()} Threat Detected`,
            message: `${newEvent.subject || 'Unknown Subject'} from ${
                newEvent.sender || 'Unknown Sender'
            }`,
            type: (newEvent.threat_level as 'critical' | 'high' | 'medium' | 'low') || 'low',
            timestamp: newEvent.created_at,
            is_read: newEvent.is_read || false,
            mailEventId: newEvent.id,
        };

        // Add to notifications list (prepend to keep newest first)
        setNotifications((prev) => {
            const updated = [newNotification, ...prev.slice(0, 9)]; // Keep only latest 10
            return updated;
        });

        // Update unread count if it's a new unread notification
        if (!newEvent.is_read) {
            setUnreadCount((prev) => prev + 1);
        }

        // Trigger notification animation
        setHasNewNotification(true);
        setTimeout(() => setHasNewNotification(false), 3000);

        // Show toast notification based on threat level
        const getThreatIcon = (level: string) => {
            switch (level) {
                case 'critical':
                case 'high':
                    return <IconAlertTriangle className='h-4 w-4' />;
                default:
                    return <IconShield className='h-4 w-4' />;
            }
        };

        const getThreatVariant = (level: string) => {
            switch (level) {
                case 'critical':
                    return 'destructive';
                case 'high':
                    return 'destructive';
                default:
                    return 'default';
            }
        };

        toast({
            title: (
                <div className='flex items-center gap-2'>
                    {getThreatIcon(newEvent.threat_level)}
                    New {newEvent.threat_level?.toUpperCase() || 'UNKNOWN'} Threat Detected
                </div>
            ) as any,
            description: `${newEvent.subject || 'Unknown Subject'} from ${
                newEvent.sender || 'Unknown Sender'
            }`,
            variant: getThreatVariant(newEvent.threat_level),
            duration: 5000,
        });
    };

    const handleThreatUpdated = (updatedEvent: any) => {
        // Update existing notification if it exists in our list
        setNotifications((prev) =>
            prev.map((notification) =>
                notification.id === updatedEvent.id
                    ? {
                          ...notification,
                          is_read: updatedEvent.is_read || false,
                      }
                    : notification
            )
        );

        // Recalculate unread count
        setNotifications((prev) => {
            const unreadCount = prev.filter((n) =>
                n.id === updatedEvent.id ? !updatedEvent.is_read : !n.is_read
            ).length;
            setUnreadCount(unreadCount);
            return prev;
        });
    };

    const loadNotifications = async () => {
        if (!accountId) return;

        setIsLoading(true);
        try {
            console.log('Loading notifications for accountId:', accountId);

            const { data: mailEvents, error } = await supabase
                .from('mail_events')
                .select('*')
                .eq('account_id', accountId)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) {
                console.error('Error loading notifications:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load notifications.',
                    variant: 'destructive',
                });
                return;
            }

            console.log('Loaded notifications:', mailEvents?.length || 0);

            if (!mailEvents) {
                setNotifications([]);
                setUnreadCount(0);
                return;
            }

            const formattedNotifications = mailEvents.map((event) => ({
                id: event.id,
                title: `${(event.threat_level || 'UNKNOWN').toUpperCase()} Threat Detected`,
                message: `${event.subject || 'Unknown Subject'} from ${
                    event.sender || 'Unknown Sender'
                }`,
                type: (event.threat_level as 'critical' | 'high' | 'medium' | 'low') || 'low',
                timestamp: event.created_at,
                is_read: event.is_read || false,
                mailEventId: event.id,
            }));

            setNotifications(formattedNotifications);
            setUnreadCount(formattedNotifications.filter((n) => !n.is_read).length);
        } catch (error) {
            console.error('Error loading notifications:', error);
            toast({
                title: 'Error',
                description: 'Failed to load notifications.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (notificationId: string, e?: React.MouseEvent) => {
        e?.stopPropagation(); // Prevent triggering the parent click handler

        try {
            await supabase.from('mail_events').update({ is_read: true }).eq('id', notificationId);

            setNotifications((prev) =>
                prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);

            if (unreadIds.length > 0) {
                await supabase.from('mail_events').update({ is_read: true }).in('id', unreadIds);

                setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        // Only navigate, don't mark as read here since user can use the mark-as-read button
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
        <div data-tour='threat-alerts'>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant='ghost'
                        className={`relative cursor-pointer transition-all duration-300 ${
                            hasNewNotification ? 'animate-pulse scale-110' : ''
                        }`}
                    >
                        <IconBell
                            className={`h-8 w-8 transition-colors duration-300 ${
                                hasNewNotification ? 'text-red-400' : ''
                            }`}
                            style={{ width: '20px', height: '20px' }}
                        />
                        {unreadCount > 0 && (
                            <Badge
                                variant='default'
                                className={`absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs transition-all duration-300 ${
                                    hasNewNotification ? 'animate-bounce' : ''
                                }`}
                            >
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </Badge>
                        )}
                        {hasNewNotification && (
                            <div className='absolute inset-0 rounded-full bg-red-400/20 animate-ping' />
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className='w-80 p-0'>
                    <Card className='border-0 shadow-lg'>
                        <CardHeader className='pb-3'>
                            <div className='flex items-center justify-between'>
                                <CardTitle className='text-sm font-medium'>
                                    Threat Notifications
                                </CardTitle>
                                {unreadCount > 0 && (
                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        onClick={markAllAsRead}
                                        className='text-xs text-neutral-400 hover:text-white p-1 h-auto'
                                    >
                                        <IconChecks className='h-3 w-3 mr-1' />
                                        Mark all read
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {notifications.length === 0 ? (
                                <div className='text-center py-6 text-neutral-400'>
                                    <IconShield className='h-8 w-8 mx-auto mb-2 text-emerald-400' />
                                    <p className='text-sm'>No notifications</p>
                                    <p className='text-xs'>You're all caught up!</p>
                                </div>
                            ) : (
                                <div
                                    className='max-h-80 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:bg-neutral-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500'
                                    style={{
                                        scrollbarWidth: 'thin',
                                        scrollbarColor: '#525252 #262626',
                                    }}
                                >
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-3 border-b border-neutral-800 transition-colors hover:bg-neutral-700/50 ${
                                                !notification.is_read ? 'bg-neutral-800/20' : ''
                                            }`}
                                        >
                                            <div className='flex items-start gap-2'>
                                                <div
                                                    className='flex-1 min-w-0 cursor-pointer'
                                                    onClick={() =>
                                                        handleNotificationClick(notification)
                                                    }
                                                >
                                                    <div className='flex items-center gap-2 mb-1'>
                                                        <h4 className='text-sm font-medium text-neutral-200 truncate'>
                                                            {notification.title}
                                                        </h4>
                                                        {!notification.is_read && (
                                                            <div className='h-2 w-2 bg-blue-500 rounded-full flex-shrink-0' />
                                                        )}
                                                    </div>
                                                    <p className='text-xs text-neutral-400 line-clamp-2 mb-1'>
                                                        {notification.message}
                                                    </p>
                                                    <div className='flex items-center justify-between text-xs'>
                                                        <span className='text-neutral-500'>
                                                            {formatTime(notification.timestamp)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className='flex flex-col gap-1 ml-2'>
                                                    {!notification.is_read && (
                                                        <Button
                                                            variant='ghost'
                                                            size='sm'
                                                            onClick={(e) =>
                                                                markAsRead(notification.id, e)
                                                            }
                                                            className='p-1 h-auto text-neutral-400 hover:text-white'
                                                            title='Mark as read'
                                                        >
                                                            <IconCheck className='h-3 w-3' />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        onClick={() =>
                                                            handleNotificationClick(notification)
                                                        }
                                                        className='p-1 h-auto text-neutral-400 hover:text-white'
                                                        title='View email'
                                                    >
                                                        <IconMail className='h-3 w-3' />
                                                    </Button>
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
