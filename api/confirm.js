// api/confirm.js
// Vercel Serverless Function — handles M-PESA donation confirmation submissions.
// Sends a confirmation email to the donor and a champion notification to SO4MH team.

const nodemailer = require('nodemailer');

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Format KES amounts with commas
function formatKES(amount) {
  return `KES ${parseInt(amount, 10).toLocaleString('en-KE')}`;
}

module.exports = async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { donorName, amount, ref, email } = req.body || {};

  // Basic validation
  if (!donorName || !amount || !ref || !email) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: donorName, amount, ref, email',
    });
  }

  const parsedAmount = parseInt(amount, 10);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid amount' });
  }

  const campaignEmail = process.env.CAMPAIGN_EMAIL || 'info@standout4mentalhealth.org';
  const campaignName = process.env.CAMPAIGN_NAME || 'MindBridge #100for100 Campaign';
  const donationDate = new Date().toLocaleDateString('en-KE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  try {
    const transporter = createTransport();

    // ── 1. Official confirmation to donor ──────────────────────────────────────
    await transporter.sendMail({
      from: `"${campaignName}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `🏆 Hongera ${donorName.split(' ')[0]}! You're a #100for100 Champion — Donation Confirmation`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d0e12; color: #e5e7eb; padding: 24px; border-radius: 8px;">
          <div style="background: #10B981; color: #000; padding: 8px 16px; border-radius: 4px; display: inline-block; font-weight: bold; font-size: 12px; letter-spacing: 1px; margin-bottom: 20px;">
            OFFICIAL DONATION CONFIRMATION
          </div>

          <h2 style="color: #ffffff; margin-top: 0;">Hongera, ${donorName}! 🌟</h2>
          <p style="color: #d1d5db; line-height: 1.6; font-size: 16px;">
            You are now officially a <strong style="color: #F59E0B;">#100for100 Champion</strong>. Your contribution goes directly into equipping the MindBridge Therapy & Rehabilitation Centre for children with neurodevelopmental disabilities in Nairobi.
          </p>

          <!-- Confirmation Box -->
          <div style="background: #1f2937; border: 1px solid #374151; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h3 style="color: #F59E0B; margin-top: 0; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">Donation Confirmation</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #374151;">
                <td style="padding: 10px 0; color: #9ca3af; font-size: 14px;">Donor Name</td>
                <td style="padding: 10px 0; color: #ffffff; font-weight: bold; text-align: right;">${donorName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #374151;">
                <td style="padding: 10px 0; color: #9ca3af; font-size: 14px;">Amount Contributed</td>
                <td style="padding: 10px 0; color: #10B981; font-weight: bold; font-size: 20px; text-align: right;">${formatKES(parsedAmount)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #374151;">
                <td style="padding: 10px 0; color: #9ca3af; font-size: 14px;">Transaction Reference</td>
                <td style="padding: 10px 0; color: #ffffff; font-family: monospace; text-align: right;">${ref.toUpperCase()}</td>
              </tr>
              <tr style="border-bottom: 1px solid #374151;">
                <td style="padding: 10px 0; color: #9ca3af; font-size: 14px;">Payment Channel</td>
                <td style="padding: 10px 0; color: #ffffff; text-align: right;">M-PESA Paybill 891300</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #9ca3af; font-size: 14px;">Date Recorded</td>
                <td style="padding: 10px 0; color: #ffffff; text-align: right;">${donationDate}</td>
              </tr>
            </table>
          </div>

          <div style="background: #1f2937; border-left: 3px solid #F59E0B; padding: 16px; border-radius: 0 6px 6px 0; margin-bottom: 24px;">
            <p style="margin: 0; color: #d1d5db; font-style: italic; line-height: 1.6;">
              "Behind every statistic is a child who wants to participate, communicate, play and learn — and a caregiver who simply wants to know: <em>'How can I help my child?'</em>"
            </p>
          </div>

          <p style="color: #d1d5db; line-height: 1.6;">
            You will receive an invitation to our <strong>centre launch ceremony</strong> and a campaign progress update when we hit 100 Champions. An itemized equipping audit will be shared with all champions at the end of Phase 1.
          </p>

          <p style="color: #d1d5db; line-height: 1.6;">
            Share the campaign and help us find the remaining champions:<br>
            <strong style="color: #F59E0B;">M-PESA Paybill: 891300 | Account: 148469</strong>
          </p>

          <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #374151;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              Stand Out 4 Mental Health (SO4MH) · Registered CBO, Kenya<br>
              Embakasi East / Mukuru, Nairobi · Phone: +254 780 796 146<br>
              <a href="mailto:info@standout4mentalhealth.org" style="color: #F59E0B;">info@standout4mentalhealth.org</a> ·
              <a href="https://standout4mentalhealth.org" style="color: #F59E0B;">standout4mentalhealth.org</a><br><br>
              This is an auto-generated confirmation. Please keep it for your records.
            </p>
          </div>
        </div>
      `,
    });

    // ── 2. Champion notification to SO4MH team ────────────────────────────
    await transporter.sendMail({
      from: `"${campaignName}" <${process.env.SMTP_USER}>`,
      to: campaignEmail,
      subject: `🏆 New Champion! ${donorName} — ${formatKES(parsedAmount)} | Ref: ${ref.toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d0e12; color: #e5e7eb; padding: 24px; border-radius: 8px;">
          <div style="background: #F59E0B; color: #000; padding: 8px 16px; border-radius: 4px; display: inline-block; font-weight: bold; font-size: 12px; letter-spacing: 1px; margin-bottom: 20px;">
            NEW CHAMPION CONFIRMED
          </div>
          <h2 style="color: #ffffff; margin-top: 0;">New #100for100 Champion</h2>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="border-bottom: 1px solid #374151;">
              <td style="padding: 10px 0; color: #9ca3af; width: 40%;">Name</td>
              <td style="padding: 10px 0; color: #ffffff; font-weight: bold;">${donorName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #374151;">
              <td style="padding: 10px 0; color: #9ca3af;">Amount</td>
              <td style="padding: 10px 0; color: #10B981; font-weight: bold; font-size: 20px;">${formatKES(parsedAmount)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #374151;">
              <td style="padding: 10px 0; color: #9ca3af;">M-PESA Ref</td>
              <td style="padding: 10px 0; color: #ffffff; font-family: monospace;">${ref.toUpperCase()}</td>
            </tr>
            <tr style="border-bottom: 1px solid #374151;">
              <td style="padding: 10px 0; color: #9ca3af;">Email</td>
              <td style="padding: 10px 0; color: #ffffff;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #9ca3af;">Date</td>
              <td style="padding: 10px 0; color: #ffffff;">${donationDate}</td>
            </tr>
          </table>

          <div style="background: #1f2937; border: 1px solid #374151; border-radius: 6px; padding: 16px; margin-top: 20px;">
            <p style="margin: 0; color: #9ca3af; font-size: 14px;">
              ⚡ <strong style="color: #F59E0B;">Action Required:</strong> Verify this M-PESA transaction (Ref: <strong>${ref.toUpperCase()}</strong>) in your Paybill 891300 statement, then add <strong>${donorName}</strong> to the Champions Wall.
            </p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: `Champion registered! Confirmation sent to ${email}.`,
      champion: {
        name: donorName,
        amount: parsedAmount,
        ref: ref.toUpperCase(),
      },
    });

  } catch (err) {
    console.error('[confirm] Email error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to send confirmation. Please contact info@standout4mentalhealth.org with your transaction reference.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

