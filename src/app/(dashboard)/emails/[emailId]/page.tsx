import React from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { EmailDetail, EmailAnalysisData } from "@/components/dashboard/email-detail";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

// This would normally come from an API or database
// Using mock data for demonstration
const getMockEmailAnalysis = (emailId: string): EmailAnalysisData => {
  // This is based on the sample analysis in the request
  return {
    id: emailId,
    sender: "rachel.ashford@gmx.at",
    subject: "Ihr süßer Begleiter beim Fettabbau CYMEE:048",
    receivedAt: "2023-05-16T09:30:00",
    summary: {
      text: "The email, disguised as a forwarded message, contains a suspicious subject line related to \"fat loss\" and a long string of random characters in the body. It includes an embedded image and a link pointing to an AWS S3 bucket with a randomized path, strongly indicating malicious intent.",
      threatLevel: "high",
      category: "Phishing/Malware",
      recommendation: "Immediately delete this email. Do NOT click on any links or download any content from this email. Block the sender (`rachel.ashford@gmx.at`) to prevent future similar attacks."
    },
    contentAnalysis: {
      randomTextPattern: true,
      legitimateLinks: false,
      suspiciousImage: true,
      suspiciousElements: [
        "Suspicious subject line: \"Ihr süßer Begleiter beim Fettabbau\" combined with a technical code \"CYMEE:048\".",
        "Randomized character strings within the email body.",
        "Link to an AWS S3 bucket with an obscure path.",
        "Sender email address (`rachel.ashford@gmx.at`) does not align with the apparent forwarded content.",
        "The embedded image and the surrounding HTML appears to be an attempt to mask the malicious link."
      ]
    },
    urlAnalysis: {
      urls: [
        {
          url: "https://oyijbgebegrytj.s3.eu-north-1.amazonaws.com/bvretn#4sUkmd15091ElCE386pbtvzynulf452YRMMXNTIOJSIXPE60718/738579d9",
          description: "Points to an Amazon S3 bucket with a highly randomized path, likely containing malicious content.",
          risk: "high"
        }
      ]
    },
    attachmentRisk: "low",
    emailContent: `From: rachel.ashford@gmx.at
Subject: Ihr süßer Begleiter beim Fettabbau CYMEE:048
Date: May 16, 2023, 9:30 AM

8jGHuifvzRT45ty1LmNbVcX3sQpD0wE9yAoZrKl2FgS...
[TRUNCATED RANDOM TEXT]

<img src="cid:image001.jpg@01D8C5A0.EADS4520">

Klicken Sie hier für weitere Informationen:
<a href="https://oyijbgebegrytj.s3.eu-north-1.amazonaws.com/bvretn#4sUkmd15091ElCE386pbtvzynulf452YRMMXNTIOJSIXPE60718/738579d9">Erfahren Sie mehr über unsere Methode</a>

9kRpTzBmUyV7fXcN6gEwDlA5oJiHs2qS4...
[MORE RANDOM TEXT TRUNCATED]`,
  };
};

export default async function EmailDetailPage({ params }: { params: { emailId: string } }) {
  // In a real app, you'd fetch this data from an API
  const emailAnalysis = getMockEmailAnalysis(params.emailId);
  
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Email Analysis"
        subheading="Detailed security analysis of the selected email"
      >
        <Button variant="outline" size="sm" asChild className="mt-4 md:mt-0">
          <Link href="/dashboard/emails">
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back to Email List
          </Link>
        </Button>
      </DashboardHeader>
      
      <div className="mt-8">
        <EmailDetail data={emailAnalysis} />
      </div>
    </DashboardShell>
  );
}