import dbConnect from '../../../utils/db';
import Invitation from '../../../models/Invitation';
import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: 'Slug is required' });
  }

  try {
    await dbConnect();
    
    const invitation = await Invitation.findOne({ slug });
    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    // Launch puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set viewport for better PDF rendering
    await page.setViewport({ width: 1200, height: 800 });
    
    // Navigate to the invitation URL
    const invitationUrl = `${req.headers.origin || 'http://localhost:3000'}/undangan/${slug}`;
    await page.goto(invitationUrl, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Wait for the page to load completely
    await page.waitForTimeout(3000);

    // Click "Buka Undangan" button if it exists
    try {
      await page.click('button:contains("Buka Undangan")');
      await page.waitForTimeout(2000);
    } catch (e) {
      // Button might not exist, continue
    }

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    await browser.close();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="undangan-${slug}.pdf"`);
    res.setHeader('Content-Length', pdf.length);

    // Send PDF
    res.send(pdf);

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ 
      error: 'Failed to generate PDF',
      message: error.message 
    });
  }
}
