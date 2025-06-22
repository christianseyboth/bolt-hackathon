'use client';
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { IconShield, IconMail, IconChartBar } from '@tabler/icons-react';
import { useTour } from '@/hooks/useTour';

export const WelcomeModal = () => {
    const { isTourActive, startTour, endTour } = useTour();

    return (
        <Dialog open={isTourActive}>
            <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <IconShield className='h-6 w-6 text-blue-500' />
                        Welcome to SecPilot!
                    </DialogTitle>
                </DialogHeader>

                <div className='space-y-4'>
                    <p className='text-neutral-400'>
                        Let's get you set up for maximum email security in just a few quick steps.
                    </p>

                    <div className='space-y-3'>
                        <div className='flex items-center gap-3 p-3 bg-neutral-800/30 rounded-lg'>
                            <IconMail className='h-5 w-5 text-blue-400' />
                            <div>
                                <p className='text-sm font-medium'>Set up email forwarding</p>
                                <p className='text-xs text-neutral-400'>Start analyzing threats</p>
                            </div>
                        </div>

                        <div className='flex items-center gap-3 p-3 bg-neutral-800/30 rounded-lg'>
                            <IconChartBar className='h-5 w-5 text-emerald-400' />
                            <div>
                                <p className='text-sm font-medium'>Configure alerts</p>
                                <p className='text-xs text-neutral-400'>Get notified of threats</p>
                            </div>
                        </div>
                    </div>

                    <div className='flex gap-2 pt-4'>
                        <Button onClick={endTour} variant='outline' className='flex-1'>
                            Skip for now
                        </Button>
                        <Button onClick={startTour} className='flex-1'>
                            Start Tour (2 min)
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
