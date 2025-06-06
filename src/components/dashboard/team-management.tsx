"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import { useToast } from "../ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { IconUsers, IconAlertCircle, IconPlus, IconTrash, IconCheck, IconX, IconClock } from "@tabler/icons-react";
import { Badge } from "../ui/badge";
import { getTeamMembers, addTeamMember, removeTeamMember, updateTeamMemberStatus, type TeamMember } from "@/services/teams";
import { getSubscriptionStatus } from "@/services/subscription";

export function TeamManagement() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingMember, setAddingMember] = useState(false);

  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Subscription plan details
  const [maxTeamMembers, setMaxTeamMembers] = useState(0);
  const currentMemberCount = members.length;
  const memberPercentage = maxTeamMembers > 0 ? (currentMemberCount / maxTeamMembers) * 100 : 0;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, you would get the organization ID from context or state management
        const orgId = 'current-org-id'; // This should be dynamically obtained

        // Fetch team members
        const teamMembers = await getTeamMembers(orgId);
        setMembers(teamMembers);

        // Fetch subscription status to get the member limit
        const subscription = await getSubscriptionStatus('current-user-id'); // This should be dynamically obtained
        if (subscription) {
          setMaxTeamMembers(subscription.usage.teamMembers.total);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load team data. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Add new team member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an email address.",
      });
      return;
    }

    if (currentMemberCount >= maxTeamMembers) {
      toast({
        variant: "destructive",
        title: "User limit reached",
        description: "You've reached the maximum number of users for your plan. Please upgrade to add more team members.",
      });
      return;
    }

    // Check if email already exists
    if (members.some(member => member.email === email)) {
      toast({
        variant: "destructive",
        title: "Email already exists",
        description: "This email is already added to your team.",
      });
      return;
    }

    setAddingMember(true);

    try {
      // In a real app, you would get the organization ID from context or state management
      const orgId = 'current-org-id'; // This should be dynamically obtained
      const newMember = await addTeamMember(orgId, email, note);

      if (newMember) {
        setMembers([...members, newMember]);
        setEmail("");
        setNote("");

        toast({
          title: "Team member added",
          description: `${email} has been added to your team.`,
        });
      } else {
        throw new Error("Failed to add team member");
      }
    } catch (error) {
      console.error("Error adding team member:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add team member. Please try again.",
      });
    } finally {
      setAddingMember(false);
    }
  };

  // Delete team member
  const handleDeleteClick = (id: string) => {
    setMemberToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (memberToDelete) {
      try {
        const success = await removeTeamMember(memberToDelete);

        if (success) {
          const memberToRemove = members.find(m => m.id === memberToDelete);
          const updatedMembers = members.filter(member => member.id !== memberToDelete);
          setMembers(updatedMembers);

          toast({
            title: "Team member removed",
            description: `${memberToRemove?.email} has been removed from your team.`,
          });
        } else {
          throw new Error("Failed to remove team member");
        }
      } catch (error) {
        console.error("Error removing team member:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to remove team member. Please try again.",
        });
      } finally {
        setMemberToDelete(null);
        setShowDeleteDialog(false);
      }
    }
  };

  // Update member status
  const handleStatusChange = async (id: string, status: 'active' | 'pending' | 'disabled') => {
    try {
      const success = await updateTeamMemberStatus(id, status);

      if (success) {
        // Update local state
        const updatedMembers = members.map(member =>
          member.id === id ? { ...member, status } : member
        );

        setMembers(updatedMembers);

        toast({
          title: "Status updated",
          description: `Team member status has been updated.`,
        });
      } else {
        throw new Error("Failed to update member status");
      }
    } catch (error) {
      console.error("Error updating member status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update member status. Please try again.",
      });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-emerald-900/30 text-emerald-400 flex items-center space-x-1">
            <IconCheck className="h-3 w-3 mr-1" />
            <span>Active</span>
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-900/30 text-amber-400 flex items-center space-x-1">
            <IconClock className="h-3 w-3 mr-1" />
            <span>Pending</span>
          </Badge>
        );
      case 'disabled':
        return (
          <Badge className="bg-neutral-800 text-neutral-400 flex items-center space-x-1">
            <IconX className="h-3 w-3 mr-1" />
            <span>Disabled</span>
          </Badge>
        );
      default:
        return null;
    }
  };

  // Render status menu (for changing status)
  const renderStatusMenu = (member: TeamMember) => {
    return (
      <div className="flex space-x-1">
        {member.status !== 'active' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleStatusChange(member.id, 'active')}
            className="h-7 px-2 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30"
          >
            <IconCheck className="h-3.5 w-3.5 mr-1" />
            Activate
          </Button>
        )}

        {member.status !== 'disabled' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleStatusChange(member.id, 'disabled')}
            className="h-7 px-2 text-xs text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800/80"
          >
            <IconX className="h-3.5 w-3.5 mr-1" />
            Disable
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="border-neutral-800 bg-neutral-900">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <div className="bg-neutral-800 p-2 rounded-md">
              <IconUsers className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Team Usage</CardTitle>
              <CardDescription>Manage your team&apos;s access</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">Team Members</div>
              <div className="text-sm text-neutral-400">
                {currentMemberCount} of {maxTeamMembers} used
              </div>
            </div>
            <Progress value={memberPercentage} className="h-2" />

            {currentMemberCount >= maxTeamMembers && (
              <div className="bg-amber-900/20 border border-amber-900/30 text-amber-400 px-4 py-3 rounded-md flex items-start mt-4">
                <IconAlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  You&apos;ve reached the maximum number of team members for your current plan.
                  <a href="/dashboard/settings\" className="underline ml-1 hover:text-amber-300">
                    Upgrade your plan
                  </a> to add more team members.
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-neutral-800 bg-neutral-900">
        <CardHeader>
          <CardTitle className="text-lg">Add Team Member</CardTitle>
          <CardDescription>
            Add a new member to your team who will be able to send emails for analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="team.member@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Note (Optional)</Label>
                <Input
                  id="note"
                  placeholder="Role or department"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="flex items-center"
              disabled={currentMemberCount >= maxTeamMembers || addingMember}
            >
              <IconPlus className="h-4 w-4 mr-2" />
              {addingMember ? "Adding..." : "Add Team Member"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-neutral-800 bg-neutral-900">
        <CardHeader>
          <CardTitle className="text-lg">Team Members</CardTitle>
          <CardDescription>
            Manage your existing team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-neutral-700 border-t-cyan-500"></div>
              <p className="mt-2 text-neutral-400">Loading team members...</p>
            </div>
          ) : members.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Added On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.email}</TableCell>
                    <TableCell>{renderStatusBadge(member.status)}</TableCell>
                    <TableCell>{member.note || "-"}</TableCell>
                    <TableCell>{formatDate(member.addedAt)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      {renderStatusMenu(member)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(member.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-950/30 h-8 w-8 p-0"
                      >
                        <IconTrash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-neutral-400">
              No team members added yet. Add your first team member above.
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove this team member and revoke their access to send emails for analysis.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
