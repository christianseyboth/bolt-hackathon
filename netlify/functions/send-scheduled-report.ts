import type { Handler } from "@netlify/functions";
import Mailgun from "mailgun.js";
import formData from "form-data";

const handler: Handler = async (event: any) => {
  if (event.body === null) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Payload required" }),
    };
  }

  try {
    const requestBody = JSON.parse(event.body);

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

    // Initialize Mailgun
    const mailgun = new Mailgun(formData);
    const mg = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY || '',
      url: process.env.MAILGUN_HOST_REGION === 'eu' ? 'https://api.eu.mailgun.net' : 'https://api.mailgun.net'
    });

    // Create HTML email template
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SecPilot ${reportType} Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8f9fa;
    }
    .container {
      background: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #e9ecef;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 10px;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    .metric {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 6px;
      text-align: center;
    }
    .metric-value {
      font-size: 28px;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 5px;
    }
    .metric-label {
      color: #6b7280;
      font-size: 14px;
    }
    .download-btn {
      display: inline-block;
      background: #2563eb;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      margin: 20px 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e9ecef;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">SecPilot</div>
      <h1>${reportType} Security Report</h1>
      <p>Report Period: ${periodStart} - ${periodEnd}</p>
    </div>

    <div class="metrics">
      <div class="metric">
        <div class="metric-value">${emailsScanned.toLocaleString()}</div>
        <div class="metric-label">Emails Scanned</div>
      </div>
      <div class="metric">
        <div class="metric-value">${threatsBlocked.toLocaleString()}</div>
        <div class="metric-label">Threats Blocked</div>
      </div>
      <div class="metric">
        <div class="metric-value">${securityScore}%</div>
        <div class="metric-label">Security Score</div>
      </div>
    </div>

    <div style="text-align: center;">
      <p>Your ${frequency} security report is ready for download.</p>
      <a href="${downloadUrl}" class="download-btn">
        Download ${reportFormat.toUpperCase()} Report
      </a>
    </div>

    <div class="footer">
      <p>This report was generated on ${reportDate}</p>
      <p>© 2024 SecPilot - AI-Powered Email Security</p>
      <p>If you have questions, contact us at support@secpilot.io</p>
    </div>
  </div>
</body>
</html>`;

    // Send emails to all recipients
    const emailPromises = recipients.map(async (recipient: string) => {
      const mailData = {
        from: `SecPilot Reports <reports@${process.env.MAILGUN_DOMAIN}>`,
        to: recipient,
        subject: `SecPilot ${reportType} Report - ${reportDate}`,
        html: htmlContent,
        text: `
SecPilot ${reportType} Security Report
Report Period: ${periodStart} - ${periodEnd}

Security Metrics:
- Emails Scanned: ${emailsScanned.toLocaleString()}
- Threats Blocked: ${threatsBlocked.toLocaleString()}
- Security Score: ${securityScore}%

Download your ${reportFormat.toUpperCase()} report: ${downloadUrl}

Generated on ${reportDate}
SecPilot - AI-Powered Email Security
        `.trim()
      };

      return mg.messages.create(process.env.MAILGUN_DOMAIN || '', mailData);
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
      }),
    };

  } catch (error) {
    console.error('Error sending scheduled report emails:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to send report emails",
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

export { handler };

