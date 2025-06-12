import { jsPDF } from 'jspdf';

export async function generatePDFFromHTML(htmlContent: string, title: string): Promise<Buffer> {
    try {
        // Try puppeteer first (better quality)
        return await generateWithPuppeteer(htmlContent);
    } catch (error) {
        console.log('Puppeteer failed, using jsPDF fallback:', error);
        // Fallback to jsPDF (lighter, but more basic)
        return generateWithJsPDF(htmlContent, title);
    }
}

async function generateWithPuppeteer(htmlContent: string): Promise<Buffer> {
    const puppeteer = require('puppeteer');

    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
        ]
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
            top: '20mm',
            right: '15mm',
            bottom: '20mm',
            left: '15mm'
        }
    });

    await browser.close();
    return Buffer.from(pdfBuffer);
}

function generateWithJsPDF(htmlContent: string, title: string): Buffer {
    const doc = new jsPDF();

    // Extract text content from HTML for basic PDF
    const textContent = extractTextFromHTML(htmlContent);

    // Add title
    doc.setFontSize(20);
    doc.text(title, 20, 30);

    // Add content
    doc.setFontSize(12);
    let yPosition = 50;
    const maxWidth = 170;
    const lineHeight = 7;

    textContent.forEach((line: string) => {
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 30;
        }

        const lines = doc.splitTextToSize(line, maxWidth);
        doc.text(lines, 20, yPosition);
        yPosition += lines.length * lineHeight + 5;
    });

    return Buffer.from(doc.output('arraybuffer'));
}

function extractTextFromHTML(html: string): string[] {
    // Remove HTML tags and extract meaningful content
    const content: string[] = [];

    // Extract title
    const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (titleMatch) {
        content.push(titleMatch[1]);
        content.push('');
    }

    // Extract metadata
    const metadataMatch = html.match(/<div class="metadata"[^>]*>(.*?)<\/div>/s);
    if (metadataMatch) {
        const metaText = metadataMatch[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        content.push(metaText);
        content.push('');
    }

    // Extract table data
    const tableMatches = html.match(/<table[^>]*>.*?<\/table>/gs);
    if (tableMatches) {
        tableMatches.forEach((table, index) => {
            content.push(`Dataset ${index + 1}:`);
            content.push('');

            // Extract headers
            const headerMatch = table.match(/<thead[^>]*>.*?<\/thead>/s);
            if (headerMatch) {
                const headers = headerMatch[0].match(/<th[^>]*>(.*?)<\/th>/g);
                if (headers) {
                    const headerText = headers.map(h => h.replace(/<[^>]*>/g, '').trim()).join(' | ');
                    content.push(headerText);
                    content.push('-'.repeat(headerText.length));
                }
            }

            // Extract rows
            const rowMatches = table.match(/<tr[^>]*>.*?<\/tr>/gs);
            if (rowMatches) {
                rowMatches.slice(1).forEach(row => { // Skip header row
                    const cells = row.match(/<td[^>]*>(.*?)<\/td>/g);
                    if (cells) {
                        const rowText = cells.map(c => c.replace(/<[^>]*>/g, '').trim()).join(' | ');
                        content.push(rowText);
                    }
                });
            }

            content.push('');
        });
    }

    return content;
}
