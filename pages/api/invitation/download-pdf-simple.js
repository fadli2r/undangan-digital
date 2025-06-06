import dbConnect from '../../../utils/db';
import Invitation from '../../../models/Invitation';

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

    // Create HTML content for PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Wedding Invitation - ${invitation.mempelai.pria} & ${invitation.mempelai.wanita}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .title {
            font-size: 36px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .couple-names {
            font-size: 48px;
            font-weight: bold;
            color: #e74c3c;
            margin: 20px 0;
        }
        .date {
            font-size: 18px;
            color: #7f8c8d;
            margin-bottom: 30px;
        }
        .section {
            margin: 30px 0;
            padding: 20px;
            border-left: 4px solid #3498db;
            background: #f8f9fa;
        }
        .section-title {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 15px;
        }
        .event-item {
            margin: 20px 0;
            padding: 15px;
            background: white;
            border-radius: 10px;
            border: 1px solid #ecf0f1;
        }
        .event-name {
            font-size: 20px;
            font-weight: bold;
            color: #e74c3c;
        }
        .event-details {
            margin-top: 10px;
            line-height: 1.6;
        }
        .couple-section {
            display: flex;
            justify-content: space-between;
            margin: 30px 0;
        }
        .couple-item {
            flex: 1;
            text-align: center;
            margin: 0 20px;
        }
        .couple-name {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .parents {
            color: #7f8c8d;
            font-style: italic;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #ecf0f1;
        }
        .quote {
            font-style: italic;
            color: #7f8c8d;
            margin: 20px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="title">The Wedding of</div>
            <div class="couple-names">${invitation.mempelai.pria} & ${invitation.mempelai.wanita}</div>
            <div class="date">${new Date(invitation.acara_utama.tanggal).toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}</div>
        </div>

        <div class="quote">
            "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan‐pasangan untukmu dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya diantaramu rasa kasih dan sayang."<br>
            <strong>(QS. Ar‐Rum Ayat 21)</strong>
        </div>

        <div class="section">
            <div class="section-title">Mempelai</div>
            <div class="couple-section">
                <div class="couple-item">
                    <div class="couple-name">${invitation.mempelai.wanita}</div>
                    <div class="parents">Putri dari<br>${invitation.mempelai.orangtua_wanita}</div>
                </div>
                <div class="couple-item">
                    <div class="couple-name">${invitation.mempelai.pria}</div>
                    <div class="parents">Putra dari<br>${invitation.mempelai.orangtua_pria}</div>
                </div>
            </div>
        </div>

        ${invitation.acara && invitation.acara.length > 0 ? `
        <div class="section">
            <div class="section-title">Acara</div>
            ${invitation.acara.map(event => `
                <div class="event-item">
                    <div class="event-name">${event.nama}</div>
                    <div class="event-details">
                        <strong>Tanggal:</strong> ${new Date(event.tanggal).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}<br>
                        <strong>Waktu:</strong> ${event.waktu}<br>
                        <strong>Tempat:</strong> ${event.lokasi}<br>
                        <strong>Alamat:</strong> ${event.alamat}
                    </div>
                </div>
            `).join('')}
        </div>
        ` : ''}

        <div class="footer">
            <p>Merupakan suatu kebahagiaan apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu</p>
            <div class="couple-names" style="font-size: 24px; margin-top: 20px;">
                ${invitation.mempelai.pria} & ${invitation.mempelai.wanita}
            </div>
        </div>
    </div>
</body>
</html>`;

    // Set response headers for HTML download
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="undangan-${slug}.html"`);
    
    // Send HTML content
    res.send(htmlContent);

  } catch (error) {
    console.error('Error generating HTML:', error);
    res.status(500).json({ 
      error: 'Failed to generate invitation file',
      message: error.message 
    });
  }
}
