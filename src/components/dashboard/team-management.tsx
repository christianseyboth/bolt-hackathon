"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
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
import { IconUsers, IconAlertCircle, IconPlus, IconTrash } from "@tabler/icons-react";

interface TeamMember {
  id: string;
  email: string;
  note?: string;
  addedAt: Date;
}

export function TeamManagement() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: "1",
      email: "john.doe@example.com",
      note: "Marketing Department Lead",
      addedAt: new Date(2023, 4, 10),
    },
    {
      id: "2",
      email: "jane.smith@example.com",
      note: "IT Security Specialist",
      addedAt: new Date(2023, 4, 12),
    },
    {
      id: "3",
      email: "mike.wilson@example.com",
      note: "Sales Representative",
      addedAt: new Date(2023, 4, 15),
    }
  ]);
  
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Subscription plan details
  const maxTeamMembers = 5;
  const currentMemberCount = members.length;
  const memberPercentage = (currentMemberCount / maxTeamMembers) * 100;

  // Add new team member
  const handleAddMember = (e: React.FormEvent) => {
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

    // Add new member
    const newMember: TeamMember = {
      id: Date.now().toString(),
      email,
      note: note || undefined,
      addedAt: new Date(),
    };

    setMembers([...members, newMember]);
    setEmail("");
    setNote("");

    toast({
      title: "Team member added",
      description: `${email} has been added to your team.`,
    });
  };

  // Delete team member
  const handleDeleteClick = (id: string) => {
    setMemberToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (memberToDelete) {
      const memberToRemove = members.find(m => m.id === memberToDelete);
      const updatedMembers = members.filter(member => member.id !== memberToDelete);
      setMembers(updatedMembers);
      
      toast({
        title: "Team member removed",
        description: `${memberToRemove?.email} has been removed from your team.`,
      });
      
      setMemberToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
                  <a href="/dashboard/billing\" className=\"underline ml-1 hover:text-amber-300">
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
              disabled={currentMemberCount >= maxTeamMembers}
            >
              <IconPlus className="h-4 w-4 mr-2" />
              Add Team Member
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
          {members.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Added On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.email}</TableCell>
                    <TableCell>{member.note || "-"}</TableCell>
                    <TableCell>{formatDate(member.addedAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(member.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
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