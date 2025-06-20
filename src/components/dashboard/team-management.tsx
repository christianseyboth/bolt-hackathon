'use client';
import React, { useRef, useTransition, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../ui/alert-dialog';
import {
    IconUsers,
    IconAlertCircle,
    IconPlus,
    IconTrash,
    IconCheck,
    IconX,
    IconClock,
    IconExclamationMark,
} from '@tabler/icons-react';
import { Badge } from '../ui/badge';
import {
    addTeamMember,
    removeTeamMember,
    enforceTeamLimits,
} from '@/app/(dashboard)/dashboard/team/actions';
import { useToast } from '../ui/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type TeamMember = {
    id: string;
    email: string;
    label?: string | null;
    created_at: string;
    status: string;
};

type TeamManagementProps = {
    initialMembers: TeamMember[];
    maxTeamMembers: number;
    subscription: any;
    account: any;
};

export function TeamManagement({
    initialMembers,
    maxTeamMembers,
    subscription,
    account,
}: TeamManagementProps) {
    const formRef = useRef<HTMLFormElement>(null);
    const [isPending, startTransition] = useTransition();
    const currentMemberCount = initialMembers.length;
    const memberPercentage = maxTeamMembers > 0 ? (currentMemberCount / maxTeamMembers) * 100 : 0;
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);

    // Check if user is over their subscription limit
    const isOverLimit = currentMemberCount > maxTeamMembers;
    const excessMembers = isOverLimit ? currentMemberCount - maxTeamMembers : 0;

    const { toast } = useToast();
    const router = useRouter();

    function handleSuccess() {
        formRef.current?.reset();
    }

    // Handle manual enforcement of team limits
    const handleEnforceLimits = async () => {
        startTransition(async () => {
            try {
                const result = await enforceTeamLimits(subscription.id);
                if (result.success && result.results) {
                    const { results } = result;
                    toast({
                        title: 'Team limits enforced',
                        description: `${results.members_enabled} members active, ${results.members_disabled} members disabled due to limits.`,
                    });
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Error',
                        description: result.error || 'Could not enforce team limits.',
                    });
                }
            } catch (err: any) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: err?.message || 'Could not enforce team limits.',
                });
            }
        });
    };

    // Handle manual subscription sync from Stripe
    const handleSyncSubscription = async () => {
        startTransition(async () => {
            try {
                toast({
                    title: 'Syncing subscription...',
                    description: 'Fetching latest subscription data from Stripe.',
                });

                const response = await fetch('/api/stripe/sync-subscription-status', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        accountId: account.id,
                    }),
                });

                const result = await response.json();

                if (result.success) {
                    toast({
                        title: 'Subscription synced!',
                        description: `Updated to ${result.subscription.plan_name} plan. Refreshing page...`,
                    });
                    // Force a page refresh to show updated data
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Sync failed',
                        description: result.error || 'Could not sync subscription from Stripe.',
                    });
                }
            } catch (err: any) {
                toast({
                    variant: 'destructive',
                    title: 'Sync error',
                    description: err?.message || 'Could not connect to sync service.',
                });
            }
        });
    };

    // Helper for status badge
    function renderStatusBadge(status: string) {
        switch (status) {
            case 'active':
                return (
                    <Badge className='bg-emerald-900/30 text-emerald-400 flex items-center space-x-1'>
                        <IconCheck className='h-3 w-3 mr-1' />
                        <span>Active</span>
                    </Badge>
                );
            case 'inactive':
                return (
                    <Badge className='bg-red-900/30 text-red-400 flex items-center space-x-1'>
                        <IconX className='h-3 w-3 mr-1' />
                        <span>Inactive</span>
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge className='bg-red-900/30 text-red-400 flex items-center space-x-1'>
                        <IconX className='h-3 w-3 mr-1' />
                        <span>Cancelled</span>
                    </Badge>
                );
            case 'past_due':
                return (
                    <Badge className='bg-amber-900/30 text-amber-400 flex items-center space-x-1'>
                        <IconClock className='h-3 w-3 mr-1' />
                        <span>Past Due</span>
                    </Badge>
                );
            default:
                return (
                    <Badge className='bg-neutral-800 text-neutral-400 flex items-center space-x-1'>
                        <IconClock className='h-3 w-3 mr-1' />
                        <span>Unknown</span>
                    </Badge>
                );
        }
    }

    return (
        <div className='space-y-6'>
            {/* Over Limit Warning */}
            {isOverLimit && (
                <Card className='border-red-800 bg-red-950/20'>
                    <CardHeader className='pb-3'>
                        <div className='flex items-center space-x-2'>
                            <div className='bg-red-900/50 p-2 rounded-md'>
                                <IconExclamationMark className='h-5 w-5 text-red-400' />
                            </div>
                            <div>
                                <CardTitle className='text-lg text-red-400'>
                                    Team Limit Exceeded
                                </CardTitle>
                                <CardDescription className='text-red-300/80'>
                                    Your team has more members than your current subscription allows
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            <div className='bg-red-900/30 border border-red-900/50 text-red-300 px-4 py-3 rounded-md'>
                                <div className='flex items-start'>
                                    <IconAlertCircle className='h-5 w-5 mr-2 flex-shrink-0 mt-0.5' />
                                    <div className='text-sm space-y-2'>
                                        <p>
                                            <strong>Action Required:</strong> You currently have{' '}
                                            {currentMemberCount} team members, but your subscription
                                            only allows {maxTeamMembers}. You need to remove{' '}
                                            {excessMembers} member{excessMembers > 1 ? 's' : ''}
                                            to comply with your subscription.
                                        </p>
                                        <p>
                                            Until you reduce your team size, you won't be able to
                                            add new members, and some features may be restricted.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className='flex flex-col sm:flex-row gap-3'>
                                <Button
                                    variant='outline'
                                    className='border-amber-700 text-amber-400 hover:bg-amber-950/30'
                                    onClick={handleEnforceLimits}
                                    disabled={isPending}
                                >
                                    <IconCheck className='h-4 w-4 mr-2' />
                                    {isPending ? 'Enforcing...' : 'Disable Excess Members'}
                                </Button>
                                <Button
                                    variant='outline'
                                    className='border-red-700 text-red-400 hover:bg-red-950/30'
                                    onClick={() => {
                                        // Scroll to team members section
                                        const teamMembersSection = document.querySelector(
                                            '[data-section="team-members"]'
                                        );
                                        if (teamMembersSection) {
                                            teamMembersSection.scrollIntoView({
                                                behavior: 'smooth',
                                                block: 'start',
                                            });
                                        }
                                    }}
                                >
                                    <IconTrash className='h-4 w-4 mr-2' />
                                    Delete Members Below
                                </Button>
                                <Button
                                    variant='outline'
                                    className='border-cyan-700 text-cyan-400 hover:bg-cyan-950/30'
                                    onClick={() =>
                                        (window.location.href = '/dashboard/subscription')
                                    }
                                >
                                    <IconUsers className='h-4 w-4 mr-2' />
                                    Upgrade Subscription
                                </Button>
                                <Button
                                    variant='outline'
                                    className='border-green-700 text-green-400 hover:bg-green-950/30'
                                    onClick={() => {
                                        router.refresh();
                                        window.location.reload();
                                    }}
                                >
                                    <IconCheck className='h-4 w-4 mr-2' />
                                    Refresh Page
                                </Button>
                                <Button
                                    variant='outline'
                                    className='border-purple-700 text-purple-400 hover:bg-purple-950/30'
                                    onClick={handleSyncSubscription}
                                    disabled={isPending}
                                >
                                    <IconUsers className='h-4 w-4 mr-2' />
                                    {isPending ? 'Syncing...' : 'Sync from Stripe'}
                                </Button>
                                <Button
                                    variant='outline'
                                    className='border-orange-700 text-orange-400 hover:bg-orange-950/30'
                                    onClick={() => {
                                        // Force hard refresh - clears all caches
                                        window.location.href =
                                            window.location.href + '?t=' + Date.now();
                                    }}
                                >
                                    <IconCheck className='h-4 w-4 mr-2' />
                                    Hard Refresh
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Team Usage */}
            <Card className='border-neutral-800 bg-neutral-900'>
                <CardHeader className='pb-3'>
                    <div className='flex items-center space-x-2'>
                        <div className='bg-neutral-800 p-2 rounded-md'>
                            <IconUsers className='h-5 w-5 text-cyan-500' />
                        </div>
                        <div>
                            <CardTitle className='text-lg'>Team Usage</CardTitle>
                            <CardDescription>Manage your team's access</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        <div className='flex justify-between items-center'>
                            <div className='text-sm font-medium'>Team Members</div>
                            <div
                                className={`text-sm ${
                                    isOverLimit ? 'text-red-400 font-medium' : 'text-neutral-400'
                                }`}
                            >
                                {currentMemberCount} of {maxTeamMembers}{' '}
                                {isOverLimit ? '(Over Limit)' : 'used'}
                            </div>
                        </div>
                        <Progress
                            value={memberPercentage}
                            className={`h-2 ${isOverLimit ? '[&>div]:bg-red-500' : ''}`}
                        />
                        {currentMemberCount >= maxTeamMembers && !isOverLimit && (
                            <div className='bg-amber-900/20 border border-amber-900/30 text-amber-400 px-4 py-3 rounded-md flex items-start mt-4'>
                                <IconAlertCircle className='h-5 w-5 mr-2 flex-shrink-0 mt-0.5' />
                                <div className='text-sm'>
                                    You've reached the maximum number of team members for your
                                    current plan.
                                    <Link
                                        href='/dashboard/settings'
                                        className='underline ml-1 hover:text-amber-300'
                                    >
                                        Upgrade your plan
                                    </Link>{' '}
                                    to add more team members.
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Important Information for Account Creators */}
            <Card className='border-blue-800 bg-blue-950/20'>
                <CardHeader className='pb-3'>
                    <div className='flex items-start space-x-3'>
                        <div className='bg-blue-900/50 p-2 rounded-md'>
                            <IconExclamationMark className='h-5 w-5 text-blue-400' />
                        </div>
                        <div>
                            <CardTitle className='text-blue-300 text-lg'>Important Note</CardTitle>
                            <CardDescription className='text-blue-400/80 mt-1'>
                                Account creators should also add themselves as team members
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className='space-y-3 text-sm text-blue-300/90'>
                        <p>
                            <strong>Why?</strong> Your account email and the email you use to send
                            emails for analysis can be different.
                        </p>
                        <div className='bg-blue-900/30 p-3 rounded-lg border border-blue-800/50'>
                            <p className='text-blue-200'>
                                <strong>Example:</strong> If your account is registered with{' '}
                                <code className='bg-blue-800/50 px-1 rounded'>
                                    admin@company.com
                                </code>{' '}
                                but you send emails from{' '}
                                <code className='bg-blue-800/50 px-1 rounded'>
                                    john@company.com
                                </code>
                                , you need to add{' '}
                                <code className='bg-blue-800/50 px-1 rounded'>
                                    john@company.com
                                </code>{' '}
                                as a team member for analysis to work.
                            </p>
                        </div>
                        <p>
                            This ensures all emails you forward for analysis are properly authorized
                            and processed.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Add Member */}
            <Card className='border-neutral-800 bg-neutral-900' data-tour='add-team-member'>
                <CardHeader>
                    <CardTitle className='text-lg'>Add Team Member</CardTitle>
                    <CardDescription>
                        Add a new member to your team who will be able to send emails for analysis
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        ref={formRef}
                        action={async (formData) => {
                            startTransition(async () => {
                                try {
                                    await addTeamMember(formData);
                                    handleSuccess();
                                    toast({
                                        title: 'Team member added',
                                        description: 'The new member was successfully added.',
                                    });
                                } catch (err: any) {
                                    toast({
                                        variant: 'destructive',
                                        title: 'Error',
                                        description: err?.message || 'Could not add team member.',
                                    });
                                }
                            });
                        }}
                        className='space-y-4'
                    >
                        <input type='hidden' name='subscriptionId' value={subscription.id} />
                        <input type='hidden' name='createdBy' value={account.owner_id} />
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='email'>Email Address</Label>
                                <Input
                                    id='email'
                                    name='email'
                                    type='email'
                                    placeholder='team.member@example.com'
                                    required
                                    disabled={isOverLimit}
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='note'>Note (Optional)</Label>
                                <Input
                                    id='note'
                                    name='note'
                                    placeholder='Role or department'
                                    disabled={isOverLimit}
                                />
                            </div>
                        </div>

                        <Button
                            type='submit'
                            className='flex items-center'
                            disabled={currentMemberCount >= maxTeamMembers || isPending}
                        >
                            <IconPlus className='h-4 w-4 mr-2' />
                            {isPending ? 'Adding...' : 'Add Team Member'}
                        </Button>

                        {isOverLimit && (
                            <p className='text-sm text-red-400 flex items-center'>
                                <IconAlertCircle className='h-4 w-4 mr-1' />
                                Remove excess members before adding new ones
                            </p>
                        )}
                    </form>
                </CardContent>
            </Card>

            {/* Team Members */}
            <Card className='border-neutral-800 bg-neutral-900' data-section='team-members'>
                <CardHeader>
                    <CardTitle className='text-lg flex items-center justify-between'>
                        <span>Team Members</span>
                        {isOverLimit && (
                            <Badge className='bg-red-900/30 text-red-400'>
                                {excessMembers} over limit
                            </Badge>
                        )}
                    </CardTitle>
                    <CardDescription>
                        {isOverLimit
                            ? `Remove ${excessMembers} member${
                                  excessMembers > 1 ? 's' : ''
                              } to comply with your subscription`
                            : 'Manage your existing team members'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isPending ? (
                        <div className='text-center py-8'>
                            <div className='inline-block h-6 w-6 animate-spin rounded-full border-4 border-neutral-700 border-t-cyan-500'></div>
                            <p className='mt-2 text-neutral-400'>Loading team members...</p>
                        </div>
                    ) : initialMembers.length > 0 ? (
                        <div
                            className='overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:bg-neutral-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500'
                            style={{ scrollbarWidth: 'thin', scrollbarColor: '#525252 #262626' }}
                        >
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Email</TableHead>
                                        <TableHead className='hidden sm:table-cell'>
                                            Status
                                        </TableHead>
                                        <TableHead className='hidden md:table-cell'>Note</TableHead>
                                        <TableHead className='hidden lg:table-cell'>
                                            Added On
                                        </TableHead>
                                        <TableHead className='text-right'>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {initialMembers.map((member, index) => {
                                        // Highlight members that exceed the limit (newest members first for removal suggestion)
                                        const isExcessMember =
                                            isOverLimit && index >= maxTeamMembers;
                                        const isDisabled = member.status === 'inactive';

                                        return (
                                            <TableRow
                                                key={member.id}
                                                className={
                                                    isDisabled
                                                        ? 'bg-red-950/30 border-red-900/50'
                                                        : isExcessMember
                                                        ? 'bg-red-950/20 border-red-900/30'
                                                        : ''
                                                }
                                            >
                                                <TableCell className='font-medium'>
                                                    <div className='flex items-center space-x-2'>
                                                        <span
                                                            className={
                                                                isDisabled
                                                                    ? 'text-neutral-400 line-through'
                                                                    : ''
                                                            }
                                                        >
                                                            {member.email}
                                                        </span>
                                                        {isDisabled && (
                                                            <Badge
                                                                variant='outline'
                                                                className='border-red-700 text-red-400 text-xs px-1 py-0'
                                                            >
                                                                Inactive
                                                            </Badge>
                                                        )}
                                                        {isExcessMember && !isDisabled && (
                                                            <Badge
                                                                variant='outline'
                                                                className='border-amber-700 text-amber-400 text-xs px-1 py-0'
                                                            >
                                                                Over limit
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className='hidden sm:table-cell'>
                                                    {renderStatusBadge(member.status)}
                                                </TableCell>
                                                <TableCell className='hidden md:table-cell'>
                                                    {member.label || '-'}
                                                </TableCell>
                                                <TableCell className='hidden lg:table-cell'>
                                                    {new Date(
                                                        member.created_at
                                                    ).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className='text-right space-x-1'>
                                                    <Button
                                                        type='button'
                                                        variant='ghost'
                                                        size='sm'
                                                        className={`h-8 w-8 p-0 ${
                                                            isDisabled
                                                                ? 'text-red-400 hover:text-red-300 hover:bg-red-950/30 ring-1 ring-red-700/50'
                                                                : isExcessMember
                                                                ? 'text-red-400 hover:text-red-300 hover:bg-red-950/30 ring-1 ring-red-700/50'
                                                                : 'text-red-400 hover:text-red-300 hover:bg-red-950/30'
                                                        }`}
                                                        onClick={() => {
                                                            setMemberToDelete(member);
                                                            setShowDeleteDialog(true);
                                                        }}
                                                    >
                                                        <IconTrash className='h-4 w-4' />
                                                        <span className='sr-only'>Delete</span>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className='text-center py-6 text-neutral-400'>
                            No team members added yet. Add your first team member above.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Member Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove <b>{memberToDelete?.email}</b> from your team. This
                            action cannot be undone.
                            {isOverLimit && (
                                <span className='block mt-2 text-green-400'>
                                    ✓ This will help bring your team within subscription limits.
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => {
                                setShowDeleteDialog(false);
                                setMemberToDelete(null);
                            }}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                if (!memberToDelete) return;
                                setShowDeleteDialog(false);
                                startTransition(async () => {
                                    try {
                                        // Use FormData to keep your existing server action API
                                        const formData = new FormData();
                                        formData.append('id', memberToDelete.id);
                                        await removeTeamMember(formData);
                                        toast({
                                            title: 'Team member removed',
                                            description: isOverLimit
                                                ? 'The member was successfully removed. Your team is now closer to compliance.'
                                                : 'The member was successfully removed.',
                                        });
                                    } catch (err: any) {
                                        toast({
                                            variant: 'destructive',
                                            title: 'Error',
                                            description:
                                                err?.message || 'Could not remove team member.',
                                        });
                                    } finally {
                                        setMemberToDelete(null);
                                    }
                                });
                            }}
                            className='bg-red-600 hover:bg-red-700 text-white'
                        >
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
