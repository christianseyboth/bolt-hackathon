import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { IconCrown } from "@tabler/icons-react";

export function SubscriptionInfo() {
  return (
    <Card className="border border-neutral-800 bg-neutral-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-amber-500 to-amber-300 rounded-full p-1.5">
              <IconCrown className="h-4 w-4 text-black" />
            </div>
            <div>
              <div className="text-base font-medium">Pro Plan</div>
              <div className="text-xs text-neutral-400">
                <span className="text-amber-400">28 days</span> remaining
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Manage
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-xs">
            <span>Email Scans</span>
            <span>821 / 1,000</span>
          </div>
          <Progress value={82.1} className="h-2" />

          <div className="flex justify-between text-xs mt-4">
            <span>AI Analysis</span>
            <span>48 / 50</span>
          </div>
          <Progress value={96} className="h-2" />

          <div className="flex justify-between text-xs mt-4">
            <span>Team Members</span>
            <span>3 / 5</span>
          </div>
          <Progress value={60} className="h-2" />
        </div>

        <div className="mt-6 pt-6 border-t border-neutral-800">
          <div className="flex justify-between items-center">
            <div className="text-sm">Need more capacity?</div>
            <Button size="sm">Upgrade</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}