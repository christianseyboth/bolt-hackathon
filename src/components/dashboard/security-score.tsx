import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { IconShieldCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export function SecurityScore() {
  const score = 85; // Example score out of 100
  
  // Determine color based on score
  const getScoreColor = (value: number) => {
    if (value >= 80) return "text-emerald-400";
    if (value >= 60) return "text-amber-400";
    return "text-red-500";
  };
  
  // Determine progress color based on score
  const getProgressColor = (value: number) => {
    if (value >= 80) return "bg-emerald-400";
    if (value >= 60) return "bg-amber-400";
    return "bg-red-500";
  };

  return (
    <Card className="border border-neutral-800 bg-neutral-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <IconShieldCheck className="mr-2 h-5 w-5 text-emerald-400" />
          Security Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center pt-2">
          <div className={cn("text-5xl font-bold mb-4", getScoreColor(score))}>
            {score}
          </div>
          <Progress 
            value={score} 
            className="h-2 w-full" 
            indicatorClassName={getProgressColor(score)}
          />
          
          <div className="text-xs text-neutral-400 mt-6">
            Your email security score is in the <span className="text-emerald-400 font-medium">excellent</span> range.
          </div>
          
          <div className="text-xs text-neutral-400 mt-2">
            Last updated: Today at 12:45 PM
          </div>
        </div>
      </CardContent>
    </Card>
  );
}