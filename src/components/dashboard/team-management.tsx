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
} from '@tabler/icons-react';
import { Badge } from '../ui/badge';
import { addTeamMember, removeTeamMember } from '@/app/(dashboard)/dashboard/team/actions';
import { useToast } from '../ui/use-toast';

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

    const { toast } = useToast();

    function handleSuccess() {
        formRef.current?.reset();
    }

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
            case 'pending':
                return (
                    <Badge className='bg-amber-900/30 text-amber-400 flex items-center space-x-1'>
                        <IconClock className='h-3 w-3 mr-1' />
                        <span>Pending</span>
                    </Badge>
                );
            case 'disabled':
                return (
                    <Badge className='bg-neutral-800 text-neutral-400 flex items-center space-x-1'>
                        <IconX className='h-3 w-3 mr-1' />
                        <span>Disabled</span>
                    </Badge>
                );
            default:
                return null;
        }
    }

    return (
        <div className='space-y-6'>
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
                            <div className='text-sm text-neutral-400'>
                                {currentMemberCount} of {maxTeamMembers} used
                            </div>
                        </div>
                        <Progress value={memberPercentage} className='h-2' />
                        {currentMemberCount >= maxTeamMembers && (
                            <div className='bg-amber-900/20 border border-amber-900/30 text-amber-400 px-4 py-3 rounded-md flex items-start mt-4'>
                                <IconAlertCircle className='h-5 w-5 mr-2 flex-shrink-0 mt-0.5' />
                                <div className='text-sm'>
                                    You've reached the maximum number of team members for your
                                    current plan.
                                    <a
                                        href='/dashboard/settings'
                                        className='underline ml-1 hover:text-amber-300'
                                    >
                                        Upgrade your plan
                                    </a>{' '}
                                    to add more team members.
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Add Member */}
            <Card className='border-neutral-800 bg-neutral-900' data-tour="add-team-member">
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
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='note'>Note (Optional)</Label>
                                <Input id='note' name='note' placeholder='Role or department' />
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
                    </form>
                </CardContent>
            </Card>

            {/* Team Members */}
            <Card className='border-neutral-800 bg-neutral-900'>
                <CardHeader>
                    <CardTitle className='text-lg'>Team Members</CardTitle>
                    <CardDescription>Manage your existing team members</CardDescription>
                </CardHeader>
                <CardContent>
                    {isPending ? (
                        <div className='text-center py-8'>
                            <div className='inline-block h-6 w-6 animate-spin rounded-full border-4 border-neutral-700 border-t-cyan-500'></div>
                            <p className='mt-2 text-neutral-400'>Loading team members...</p>
                        </div>
                    ) : initialMembers.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Note</TableHead>
                                    <TableHead>Added On</TableHead>
                                    <TableHead className='text-right'>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {initialMembers.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell className='font-medium'>
                                            {member.email}
                                        </TableCell>
                                        <TableCell>{renderStatusBadge(member.status)}</TableCell>
                                        <TableCell>{member.label || '-'}</TableCell>
                                        <TableCell>
                                            {new Date(member.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className='text-right space-x-1'>
                                            <Button
                                                type='button'
                                                variant='ghost'
                                                size='sm'
                                                className='text-red-400 hover:text-red-300 hover:bg-red-950/30 h-8 w-8 p-0'
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
                                ))}
                            </TableBody>
                        </Table>
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
                                            description: 'The member was successfully removed.',
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
