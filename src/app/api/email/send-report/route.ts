import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();

    // Validate required fields
    if (!requestBody.recipients || requestBody.recipients.length === 0) {
      return NextResponse.json(
        { error: "Recipients array is required" },
        { status: 400 }
      );
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

    // Create HTML email template (inline to avoid external files)
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SecPilot ${reportType} Report</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; border-bottom: 2px solid #ccc; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0; }
    .metric { background: #f8f9fa; padding: 20px; border-radius: 6px; text-align: center; }
    .metric-value { font-size: 28px; font-weight: bold; color: #2563eb; }
    .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">SecPilot</div>
    <h1>${reportType} Security Report</h1>
    <p>Report Period: ${periodStart} - ${periodEnd}</p>
  </div>
  <div class="metrics">
    <div class="metric">
      <div class="metric-value">${emailsScanned.toLocaleString()}</div>
      <div>Emails Scanned</div>
    </div>
    <div class="metric">
      <div class="metric-value">${threatsBlocked.toLocaleString()}</div>
      <div>Threats Blocked</div>
    </div>
    <div class="metric">
      <div class="metric-value">${securityScore}%</div>
      <div>Security Score</div>
    </div>
  </div>
  <div style="text-align: center;">
    <p>Your ${frequency} security report is ready for download.</p>
    <a href="${downloadUrl}" class="btn">Download ${reportFormat.toUpperCase()} Report</a>
  </div>
  <div style="margin-top: 40px; text-align: center; color: #666; font-size: 14px;">
    <p>Generated on ${reportDate} | © 2024 SecPilot</p>
  </div>
</body>
</html>`;

    const textContent = `SecPilot ${reportType} Security Report
Report Period: ${periodStart} - ${periodEnd}

Security Metrics:
- Emails Scanned: ${emailsScanned.toLocaleString()}
- Threats Blocked: ${threatsBlocked.toLocaleString()}
- Security Score: ${securityScore}%

Download your ${reportFormat.toUpperCase()} report: ${downloadUrl}

Generated on ${reportDate}
SecPilot - AI-Powered Email Security`;

    // Send emails using Mailgun API directly with fetch
    const mailgunUrl = process.env.MAILGUN_HOST_REGION === 'eu'
      ? `https://api.eu.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`
      : `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`;

    const emailPromises = recipients.map(async (recipient: string) => {
      const formData = new URLSearchParams();
      formData.append('from', `SecPilot Reports <reports@${process.env.MAILGUN_DOMAIN}>`);
      formData.append('to', recipient);
      formData.append('subject', `SecPilot ${reportType} Report - ${reportDate}`);
      formData.append('html', htmlContent);
      formData.append('text', textContent);

      const response = await fetch(mailgunUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Mailgun API error: ${response.status} - ${errorText}`);
      }

      return response.json();
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

    return NextResponse.json({
      message: `Successfully sent ${successful} emails, ${failed} failed`,
      successful,
      failed,
      total: recipients.length,
      results: results.map((result, index) => ({
        recipient: recipients[index],
        status: result.status === 'fulfilled' ? 'sent' : 'failed',
        messageId: result.status === 'fulfilled' ? result.value.id : undefined,
        error: result.status === 'rejected' ? result.reason.message : undefined
      }))
    });

  } catch (error) {
    console.error('Error sending scheduled report emails:', error);
    return NextResponse.json(
      {
        error: "Failed to send report emails",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
