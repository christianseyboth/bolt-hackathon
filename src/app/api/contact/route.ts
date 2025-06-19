import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();

    // Validate required fields
    const { name, email, company, subject, message } = requestBody;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    // Create HTML email template
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Contact Form Submission - SecPilot</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; border-bottom: 2px solid #ccc; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #10b981; }
    .field { margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 6px; }
    .label { font-weight: bold; color: #374151; margin-bottom: 5px; }
    .value { color: #6b7280; }
    .message-field { background: #f0fdf4; border-left: 4px solid #10b981; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">SecPilot</div>
    <h1>New Contact Form Submission</h1>
  </div>

  <div class="field">
    <div class="label">Name:</div>
    <div class="value">${name}</div>
  </div>

  <div class="field">
    <div class="label">Email:</div>
    <div class="value">${email}</div>
  </div>

  ${company ? `<div class="field">
    <div class="label">Company:</div>
    <div class="value">${company}</div>
  </div>` : ''}

  <div class="field">
    <div class="label">Inquiry Type:</div>
    <div class="value">${subject}</div>
  </div>

  <div class="field message-field">
    <div class="label">Message:</div>
    <div class="value">${message.replace(/\n/g, '<br>')}</div>
  </div>

  <div style="margin-top: 40px; text-align: center; color: #666; font-size: 14px;">
    <p>Submitted on ${new Date().toLocaleString()} | SecPilot Contact Form</p>
  </div>
</body>
</html>`;

    const textContent = `New Contact Form Submission - SecPilot

Name: ${name}
Email: ${email}
${company ? `Company: ${company}` : ''}
Inquiry Type: ${subject}

Message:
${message}

Submitted on ${new Date().toLocaleString()}`;

    // Send email using Mailgun API
    const mailgunUrl = process.env.MAILGUN_HOST_REGION === 'eu'
      ? `https://api.eu.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`
      : `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`;

    const formData = new URLSearchParams();
    formData.append('from', `SecPilot Contact Form <contact@${process.env.MAILGUN_DOMAIN}>`);
    formData.append('to', 'support@secpilot.io'); // Where you want to receive contact form emails
    formData.append('reply-to', email); // Allow direct reply to the customer
    formData.append('subject', `Contact Form: ${subject} - ${name}`);
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
      console.error(`Mailgun API error: ${response.status} - ${errorText}`);
      throw new Error(`Mailgun API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    return NextResponse.json({
      message: "Contact form submitted successfully",
      messageId: result.id,
      success: true
    });

  } catch (error) {
    console.error('Error sending contact form email:', error);
    return NextResponse.json(
      {
        error: "Failed to send contact form",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
