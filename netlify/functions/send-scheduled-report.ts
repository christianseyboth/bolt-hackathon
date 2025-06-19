import type { Handler } from "@netlify/functions";

interface ReportEmailData {
  recipients: string[];
  reportType: string;
  reportDate: string;
  frequency: string;
  periodStart: string;
  periodEnd: string;
  emailsScanned: number;
  threatsBlocked: number;
  securityScore: number;
  downloadUrl: string;
  reportFormat: string;
}

const handler: Handler = async function(event) {
  if (event.body === null) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Payload required" }),
    };
  }

  try {
    const requestBody = JSON.parse(event.body) as ReportEmailData;

    // Validate required fields
    if (!requestBody.recipients || requestBody.recipients.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Recipients array is required" }),
      };
    }

    const {
      recipients,
      reportType,
      reportDate,
      frequency,
      periodStart,
      periodEnd,
      emailsScanned,
      threatsBlocked,
      securityScore,
      downloadUrl,
      reportFormat
    } = requestBody;

    // Send email to each recipient
    const emailPromises = recipients.map(async (recipient) => {
      const response = await fetch(`${process.env.URL}/.netlify/functions/emails/scheduled-report`, {
        headers: {
          "netlify-emails-secret": process.env.NETLIFY_EMAILS_SECRET as string,
        },
        method: "POST",
        body: JSON.stringify({
          from: `SecPilot Reports <no-reply@secpilot.com>`,
          to: recipient,
          subject: `SecPilot ${reportType} Report - ${reportDate}`,
          parameters: {
            reportType,
            reportDate,
            frequency,
            periodStart,
            periodEnd,
            emailsScanned: emailsScanned.toLocaleString(),
            threatsBlocked: threatsBlocked.toLocaleString(),
            securityScore,
            downloadUrl,
            reportFormat: reportFormat.toUpperCase()
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send email to ${recipient}: ${errorText}`);
      }

      return { recipient, status: 'sent' };
    });

    const results = await Promise.allSettled(emailPromises);

    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    // Log any failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to send email to ${recipients[index]}:`, result.reason);
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Report emails processed`,
        successful,
        failed,
        total: recipients.length,
        results: results.map((result, index) => ({
          recipient: recipients[index],
          status: result.status === 'fulfilled' ? 'sent' : 'failed',
          error: result.status === 'rejected' ? result.reason.message : undefined
        }))
      }),
    };

  } catch (error) {
    console.error('Error sending scheduled report emails:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to process report emails",
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

export { handler };
