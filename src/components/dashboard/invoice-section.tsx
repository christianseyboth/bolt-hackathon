'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { IconDownload, IconExternalLink, IconLoader, IconReceipt } from '@tabler/icons-react';
import { useToast } from '../ui/use-toast';

interface Invoice {
    id: string;
    number: string | null;
    amount_paid: number;
    amount_due: number;
    currency: string;
    status: string;
    created: number;
    due_date: number | null;
    hosted_invoice_url: string | null;
    invoice_pdf: string | null;
    period_start: number | null;
    period_end: number | null;
    description: string;
}

interface InvoiceSectionProps {
    accountId: string;
}

export function InvoiceSection({ accountId }: InvoiceSectionProps) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchInvoices();
    }, [accountId]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/stripe/invoices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ accountId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch invoices');
            }

            setInvoices(data.invoices || []);
        } catch (error) {
            console.error('Error fetching invoices:', error);

            // Handle specific error cases
            const errorMessage =
                error instanceof Error ? error.message : 'Failed to fetch invoices';

            // Don't show toast for "No Stripe customer" case - it's not really an error
            if (
                !errorMessage.includes('No Stripe customer') &&
                !errorMessage.includes('No subscription found')
            ) {
                setError(errorMessage);
                toast({
                    title: 'Error',
                    description: 'Failed to load invoice history',
                    variant: 'destructive',
                });
            } else {
                // For no customer/subscription cases, just set empty invoices without error
                setInvoices([]);
                setError(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(amount / 100);
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return (
                    <Badge className='bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'>
                        Paid
                    </Badge>
                );
            case 'open':
                return (
                    <Badge className='bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'>
                        Open
                    </Badge>
                );
            case 'void':
                return (
                    <Badge className='bg-neutral-500/20 text-neutral-400 hover:bg-neutral-500/30'>
                        Void
                    </Badge>
                );
            case 'uncollectible':
                return (
                    <Badge className='bg-red-500/20 text-red-400 hover:bg-red-500/30'>
                        Uncollectible
                    </Badge>
                );
            default:
                return (
                    <Badge className='bg-neutral-500/20 text-neutral-400 hover:bg-neutral-500/30'>
                        {status}
                    </Badge>
                );
        }
    };

    const handleViewInvoice = (url: string) => {
        window.open(url, '_blank');
    };

    const handleDownloadInvoice = (url: string) => {
        window.open(url, '_blank');
    };

    if (loading) {
        return (
            <Card className='border-neutral-800 bg-neutral-900'>
                <CardHeader>
                    <div className='flex items-center space-x-2'>
                        <IconReceipt className='h-5 w-5 text-blue-400' />
                        <CardTitle>Invoice History</CardTitle>
                    </div>
                    <CardDescription>Your billing and payment history</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='flex items-center justify-center py-8'>
                        <IconLoader className='h-6 w-6 animate-spin text-neutral-400' />
                        <span className='ml-2 text-neutral-400'>Loading invoices...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className='border-neutral-800 bg-neutral-900'>
                <CardHeader>
                    <div className='flex items-center space-x-2'>
                        <IconReceipt className='h-5 w-5 text-blue-400' />
                        <CardTitle>Invoice History</CardTitle>
                    </div>
                    <CardDescription>Your billing and payment history</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='text-center py-8'>
                        <p className='text-red-400 mb-4'>{error}</p>
                        <Button variant='outline' onClick={fetchInvoices}>
                            Try Again
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className='border-neutral-800 bg-neutral-900'>
            <CardHeader>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                        <IconReceipt className='h-5 w-5 text-blue-400' />
                        <div>
                            <CardTitle>Invoice History</CardTitle>
                            <CardDescription>Your billing and payment history</CardDescription>
                        </div>
                    </div>
                    <Button variant='outline' size='sm' onClick={fetchInvoices}>
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {invoices.length === 0 ? (
                    <div className='text-center py-8 text-neutral-400'>
                        <IconReceipt className='h-12 w-12 mx-auto mb-4 opacity-50' />
                        <p>No invoices found</p>
                        <p className='text-sm mt-2'>
                            Invoices will appear here after you subscribe to a plan and make your
                            first payment
                        </p>
                    </div>
                ) : (
                    <div className='overflow-auto'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className='text-right'>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className='font-medium'>
                                            {invoice.number || invoice.id.slice(-8)}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className='text-sm'>{invoice.description}</p>
                                                {invoice.period_start && invoice.period_end && (
                                                    <p className='text-xs text-neutral-400'>
                                                        {formatDate(invoice.period_start)} -{' '}
                                                        {formatDate(invoice.period_end)}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {formatPrice(
                                                invoice.amount_paid || invoice.amount_due,
                                                invoice.currency
                                            )}
                                        </TableCell>
                                        <TableCell>{formatDate(invoice.created)}</TableCell>
                                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                                        <TableCell className='text-right'>
                                            <div className='flex justify-end space-x-2'>
                                                {invoice.hosted_invoice_url && (
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        onClick={() =>
                                                            handleViewInvoice(
                                                                invoice.hosted_invoice_url!
                                                            )
                                                        }
                                                    >
                                                        <IconExternalLink className='h-4 w-4' />
                                                    </Button>
                                                )}
                                                {invoice.invoice_pdf && (
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        onClick={() =>
                                                            handleDownloadInvoice(
                                                                invoice.invoice_pdf!
                                                            )
                                                        }
                                                    >
                                                        <IconDownload className='h-4 w-4' />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
