"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function RiskiestSenders() {
  // Mock data for riskiest senders/domains
  const riskiestSenders = [
    {
      id: 1,
      domain: "malicious-domain.com",
      emails: 23,
      riskScore: 95,
      category: "Phishing",
    },
    {
      id: 2,
      domain: "suspicious-news.net",
      emails: 17,
      riskScore: 87,
      category: "Spam",
    },
    {
      id: 3,
      domain: "not-paypal.com",
      emails: 12,
      riskScore: 85,
      category: "Phishing",
    },
    {
      id: 4,
      domain: "totally-legit-bank.info",
      emails: 8,
      riskScore: 82,
      category: "Phishing",
    },
    {
      id: 5,
      domain: "freeaccounts.ru",
      emails: 7,
      riskScore: 79,
      category: "Malware",
    },
    {
      id: 6,
      domain: "cryptocurrency-giveaway.co",
      emails: 6,
      riskScore: 76,
      category: "Scam",
    },
    {
      id: 7,
      domain: "special-deals.info",
      emails: 6,
      riskScore: 71,
      category: "Spam",
    },
    {
      id: 8,
      domain: "exclusive-offer.site",
      emails: 5,
      riskScore: 68,
      category: "Spam",
    },
    {
      id: 9,
      domain: "login-services.co",
      emails: 4,
      riskScore: 66,
      category: "Phishing",
    },
    {
      id: 10,
      domain: "free-prize-claim.xyz",
      emails: 3,
      riskScore: 65,
      category: "Scam",
    },
  ];

  const getRiskBadge = (score: number) => {
    const baseClasses = "text-xs font-medium";
    
    if (score >= 90) return <Badge className={`bg-red-900/40 text-red-400 ${baseClasses}`}>Critical</Badge>;
    if (score >= 75) return <Badge className={`bg-red-900/30 text-red-400 ${baseClasses}`}>High</Badge>;
    if (score >= 60) return <Badge className={`bg-amber-900/30 text-amber-400 ${baseClasses}`}>Medium</Badge>;
    return <Badge className={`bg-yellow-900/30 text-yellow-400 ${baseClasses}`}>Low</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const baseClasses = "text-xs font-medium";
    
    switch (category.toLowerCase()) {
      case "phishing":
        return <Badge className={`bg-purple-900/30 text-purple-400 ${baseClasses}`}>{category}</Badge>;
      case "malware":
        return <Badge className={`bg-red-900/30 text-red-400 ${baseClasses}`}>{category}</Badge>;
      case "spam":
        return <Badge className={`bg-blue-900/30 text-blue-400 ${baseClasses}`}>{category}</Badge>;
      case "scam":
        return <Badge className={`bg-orange-900/30 text-orange-400 ${baseClasses}`}>{category}</Badge>;
      default:
        return <Badge className={`bg-neutral-900/30 text-neutral-400 ${baseClasses}`}>{category}</Badge>;
    }
  };

  return (
    <Card className="border-neutral-800 bg-neutral-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Top 10 Riskiest Senders/Domains</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Domain</TableHead>
              <TableHead className="text-center">Emails</TableHead>
              <TableHead className="text-center">Risk Score</TableHead>
              <TableHead className="text-right">Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {riskiestSenders.map((sender) => (
              <TableRow key={sender.id}>
                <TableCell className="font-medium">{sender.domain}</TableCell>
                <TableCell className="text-center">{sender.emails}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center">
                    <div className="mr-2">{sender.riskScore}</div>
                    {getRiskBadge(sender.riskScore)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {getCategoryBadge(sender.category)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}