"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconTrash, IconAlertTriangle } from "@tabler/icons-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function DeleteAccountSection() {
  const router = useRouter();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {


    // Close the dialog
    setShowDeleteDialog(false);

    // Show a toast notification
    toast({
      title: "Account deleted",
      description: "Your account has been deleted successfully.",
    });

    // Redirect to home page
    // Using a timeout to allow the toast to be seen
    setTimeout(() => {
      router.push("/");
    }, 1500);
  };

  return (
    <Card className="border-neutral-800 bg-neutral-900">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <div className="bg-neutral-800 p-2 rounded-md">
            <IconTrash className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <CardTitle className="text-lg">Delete Account</CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-red-950/20 border border-red-900/30 text-red-400 px-4 py-3 rounded-md flex items-start mb-4">
          <IconAlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium mb-1">Warning: This action cannot be undone</p>
            <p>
              Once you delete your account, all of your data, including scanned emails,
              security reports, and user preferences will be permanently removed from our systems.
            </p>
          </div>
        </div>

        <Button
          variant="destructive"
          className="bg-red-600 hover:bg-red-700"
          onClick={() => setShowDeleteDialog(true)}
        >
          <IconTrash className="h-4 w-4 mr-2" />
          Delete Account
        </Button>
      </CardContent>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
