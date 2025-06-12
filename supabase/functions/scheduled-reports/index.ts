import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScheduledReport {
    id: string
    account_id: string
    name: string
    type: string
    format: 'pdf' | 'csv' | 'xlsx'
    frequency: 'daily' | 'weekly' | 'monthly'
    recipients: string[]
    is_active: boolean
    next_run: string
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        console.log('Processing scheduled reports...')

        // Get all active scheduled reports that should run
        const { data: reportsToRun, error: fetchError } = await supabaseClient
            .from('scheduled_reports')
            .select('*')
            .eq('is_active', true)
            .lte('next_run', new Date().toISOString())

        if (fetchError) {
            throw new Error(`Failed to fetch reports: ${fetchError.message}`)
        }

        const results = []

        for (const report of reportsToRun || []) {
            try {
                console.log(`Processing report: ${report.name} (${report.id})`)

                // Generate the report
                const reportData = await generateReport(report, supabaseClient)

                // Send via email
                await sendReportEmail(report, reportData)

                // Update next run time
                await updateNextRunTime(report, supabaseClient)

                results.push({ id: report.id, status: 'success', name: report.name })

            } catch (error) {
                console.error(`Failed to process report ${report.id}:`, error)
                results.push({
                    id: report.id,
                    status: 'error',
                    name: report.name,
                    error: error.message
                })
            }
        }

        return new Response(
            JSON.stringify({
                processed: results.length,
                results
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )

    } catch (error) {
        console.error('Edge function error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            },
        )
    }
})

async function generateReport(report: ScheduledReport, supabase: any) {
    // Generate mock data based on report type
    const mockData = generateMockData(report.type)

    // Convert to desired format
    let reportContent: string
    let mimeType: string
    let filename: string

    switch (report.format) {
        case 'csv':
            reportContent = convertToCSV(mockData)
            mimeType = 'text/csv'
            filename = `${report.name.replace(/\s+/g, '_')}.csv`
            break
        case 'xlsx':
            // For XLSX, you'd need a more complex implementation
            // For now, fallback to CSV
            reportContent = convertToCSV(mockData)
            mimeType = 'text/csv'
            filename = `${report.name.replace(/\s+/g, '_')}.csv`
            break
        case 'pdf':
        default:
            // For PDF, you'd use a PDF generation library
            // For now, create a simple text report
            const textReport = `Report: ${report.name}\nGenerated: ${new Date().toISOString()}\n\n${JSON.stringify(mockData, null, 2)}`
            reportContent = textReport
            mimeType = 'text/plain'
            filename = `${report.name.replace(/\s+/g, '_')}.txt`
            break
    }

    // Save to report history
    await supabase
        .from('report_history')
        .insert({
            account_id: report.account_id,
            name: `${report.name} (Scheduled)`,
            type: report.type,
            format: report.format,
            size: `${Math.round(reportContent.length / 1024)}KB`,
            status: 'completed'
        })

    return {
        content: reportContent,
        mimeType,
        filename
    }
}

function generateMockData(reportType: string) {
    // Generate different mock data based on report type
    switch (reportType) {
        case 'security-summary':
            return {
                totalThreats: Math.floor(Math.random() * 10),
                blockedAttacks: Math.floor(Math.random() * 50),
                suspiciousEmails: Math.floor(Math.random() * 20),
                generatedAt: new Date().toISOString()
            }
        case 'email-analytics':
            return {
                totalEmails: Math.floor(Math.random() * 1000),
                deliveredEmails: Math.floor(Math.random() * 950),
                bounceRate: (Math.random() * 5).toFixed(2) + '%',
                openRate: (Math.random() * 30 + 15).toFixed(2) + '%',
                generatedAt: new Date().toISOString()
            }
        default:
            return {
                reportType,
                data: 'Sample data for ' + reportType,
                generatedAt: new Date().toISOString()
            }
    }
}

function convertToCSV(data: any): string {
    const headers = Object.keys(data).join(',')
    const values = Object.values(data).join(',')
    return `${headers}\n${values}`
}

async function sendReportEmail(report: ScheduledReport, reportData: any) {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    if (!resendApiKey) {
        console.log('RESEND_API_KEY not found, skipping email send')
        return
    }

    try {
        // Create base64 encoded attachment
        const attachmentContent = btoa(reportData.content)

        const emailPayload = {
            from: 'Security Reports <reports@yourdomain.com>', // Replace with your verified domain
            to: report.recipients,
            subject: `Scheduled Report: ${report.name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Your Scheduled Report is Ready</h2>
                    <p>Hello,</p>
                    <p>Your scheduled report "<strong>${report.name}</strong>" has been generated and is attached to this email.</p>

                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #666;">Report Details</h3>
                        <ul style="list-style: none; padding: 0;">
                            <li><strong>Report Name:</strong> ${report.name}</li>
                            <li><strong>Type:</strong> ${report.type}</li>
                            <li><strong>Format:</strong> ${report.format.toUpperCase()}</li>
                            <li><strong>Generated:</strong> ${new Date().toLocaleString()}</li>
                            <li><strong>Frequency:</strong> ${report.frequency}</li>
                        </ul>
                    </div>

                    <p>The report is attached as a ${report.format.toUpperCase()} file. If you have any questions, please contact your system administrator.</p>

                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="color: #888; font-size: 12px;">
                        This is an automated message from your Security Reports system.
                        To modify your report schedule, please log into your dashboard.
                    </p>
                </div>
            `,
            attachments: [
                {
                    filename: reportData.filename,
                    content: attachmentContent,
                    type: reportData.mimeType,
                    disposition: 'attachment'
                }
            ]
        }

        console.log(`Sending email to: ${report.recipients.join(', ')}`)

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailPayload),
        })

        if (!response.ok) {
            const errorData = await response.text()
            throw new Error(`Resend API error: ${response.status} - ${errorData}`)
        }

        const result = await response.json()
        console.log('Email sent successfully:', result)

    } catch (error) {
        console.error('Failed to send email:', error)
        throw error
    }
}

async function updateNextRunTime(report: ScheduledReport, supabase: any) {
    const nextRun = calculateNextRun(report.frequency)

    await supabase
        .from('scheduled_reports')
        .update({ next_run: nextRun })
        .eq('id', report.id)

    console.log(`Updated next run time for ${report.name}: ${nextRun}`)
}

function calculateNextRun(frequency: string): string {
    const now = new Date()

    switch (frequency) {
        case 'daily':
            now.setDate(now.getDate() + 1)
            break
        case 'weekly':
            now.setDate(now.getDate() + 7)
            break
        case 'monthly':
            now.setMonth(now.getMonth() + 1)
            break
        default:
            now.setDate(now.getDate() + 7)
    }

    return now.toISOString()
}
