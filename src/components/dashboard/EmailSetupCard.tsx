import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  IconMail,
  IconCopy,
  IconCheck,
  IconArrowRight,
  IconInfoCircle
} from '@tabler/icons-react';

export const EmailSetupCard = () => {
  const [copied, setCopied] = useState(false);
  const [isSetup, setIsSetup] = useState(false); // This should come from user context/API

  const forwardingEmail = "user-security@secpilot.ai"; // This should be dynamic based on user

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Card className="border border-neutral-800 bg-neutral-900">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <IconMail className="h-5 w-5 text-blue-400" />
          Email Forwarding Setup
          {isSetup ? (
            <Badge variant="default" className="bg-emerald-600 text-white">
              <IconCheck className="h-3 w-3 mr-1" />
              Active
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-amber-600 text-white">
              Setup Required
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isSetup ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <IconInfoCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-400 mb-1">Quick Setup</h4>
                  <p className="text-sm text-neutral-300">
                    Forward suspicious emails to start analysis. We'll scan them for threats and provide detailed reports.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-neutral-200 block mb-2">
                  Your Forwarding Address
                </label>
                <div className="flex gap-2">
                  <Input
                    value={forwardingEmail}
                    readOnly
                    className="flex-1 bg-neutral-800 border-neutral-700"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(forwardingEmail)}
                    className="px-3"
                  >
                    {copied ? (
                      <IconCheck className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <IconCopy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Set up a forwarding rule in your email client to send suspicious emails here
                </p>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">
                  <IconArrowRight className="h-4 w-4 mr-2" />
                  Setup Guide
                </Button>
                <Button variant="outline">
                  Test Setup
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <IconCheck className="h-5 w-5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Email forwarding is active</span>
              </div>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-neutral-800/30 rounded-lg">
                <div className="text-lg font-semibold text-emerald-400">24</div>
                <div className="text-xs text-neutral-400">Emails Analyzed</div>
              </div>
              <div className="p-3 bg-neutral-800/30 rounded-lg">
                <div className="text-lg font-semibold text-red-400">3</div>
                <div className="text-xs text-neutral-400">Threats Detected</div>
              </div>
              <div className="p-3 bg-neutral-800/30 rounded-lg">
                <div className="text-lg font-semibold text-amber-400">1</div>
                <div className="text-xs text-neutral-400">False Positives</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
