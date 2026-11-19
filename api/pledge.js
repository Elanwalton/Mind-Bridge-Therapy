// api/pledge.js
// Vercel Serverless Function — handles In-Kind / Volunteer pledge form submissions
// Sends a notification email to the SO4MH campaign team + an acknowledgement to the pledger.

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

module.exports = async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { item, name, phone, email, notes } = req.body || {};

  // Basic validation
  if (!item || !name || !phone || !email) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: item, name, phone, email',
    });
  }

  const campaignEmail = process.env.CAMPAIGN_EMAIL || 'info@standout4mentalhealth.org';
  const campaignName = process.env.CAMPAIGN_NAME || 'MindBridge #100for100 Campaign';

  try {
    const transporter = createTransport();

    // ── 1. Notification email to SO4MH team ───────────────────────────────
    await transporter.sendMail({
      from: `"${campaignName}" <${process.env.SMTP_USER}>`,
      to: campaignEmail,
      replyTo: email,
      subject: `🌟 New Pledge Received — ${name} | MindBridge #100for100`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d0e12; color: #e5e7eb; padding: 24px; border-radius: 8px;">
          <div style="background: #F59E0B; color: #000; padding: 8px 16px; border-radius: 4px; display: inline-block; font-weight: bold; font-size: 12px; letter-spacing: 1px; margin-bottom: 20px;">
            NEW IN-KIND / ALLY PLEDGE
          </div>
          <h2 style="color: #ffffff; margin-top: 0;">Pledge Submission — MindBridge #100for100</h2>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="border-bottom: 1px solid #374151;">
              <td style="padding: 10px 0; color: #9ca3af; width: 40%;">Pledger Name</td>
              <td style="padding: 10px 0; color: #ffffff; font-weight: bold;">${name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #374151;">
              <td style="padding: 10px 0; color: #9ca3af;">Item / Area of Support</td>
              <td style="padding: 10px 0; color: #F59E0B; font-weight: bold;">${item}</td>
            </tr>
            <tr style="border-bottom: 1px solid #374151;">
              <td style="padding: 10px 0; color: #9ca3af;">Phone / WhatsApp</td>
              <td style="padding: 10px 0; color: #ffffff;">${phone}</td>
            </tr>
            <tr style="border-bottom: 1px solid #374151;">
              <td style="padding: 10px 0; color: #9ca3af;">Email</td>
              <td style="padding: 10px 0; color: #ffffff;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #9ca3af;">Notes / Delivery Prefs</td>
              <td style="padding: 10px 0; color: #ffffff;">${notes || '—'}</td>
            </tr>
          </table>

          <div style="background: #1f2937; border: 1px solid #374151; border-radius: 6px; padding: 16px; margin-top: 20px;">
            <p style="margin: 0; color: #9ca3af; font-size: 14px;">
              ⚡ <strong style="color: #F59E0B;">Action Required:</strong> Contact ${name} within 24 hours via WhatsApp (${phone}) or email (${email}) to coordinate the pledge logistics.
            </p>
          </div>

          <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
            This email was sent automatically by the MindBridge campaign platform. Reply directly to respond to the pledger.
          </p>
        </div>
      `,
    });

    // ── 2. Acknowledgement email to the pledger ────────────────────────────
    await transporter.sendMail({
      from: `"${campaignName}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Asante sana, ${name.split(' ')[0]}! Your MindBridge pledge has been received 🌟`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d0e12; color: #e5e7eb; padding: 24px; border-radius: 8px;">
          <div style="background: #10B981; color: #000; padding: 8px 16px; border-radius: 4px; display: inline-block; font-weight: bold; font-size: 12px; letter-spacing: 1px; margin-bottom: 20px;">
            PLEDGE CONFIRMED
          </div>
          <h2 style="color: #ffffff; margin-top: 0;">Thank You, ${name}!</h2>
          <p style="color: #d1d5db; line-height: 1.6;">
            Your pledge of <strong style="color: #F59E0B;">"${item}"</strong> has been registered with the MindBridge #100for100 campaign team.
          </p>
          <p style="color: #d1d5db; line-height: 1.6;">
            Our partnership team will reach out to you within <strong>24 hours</strong> on <strong>${phone}</strong> to coordinate the next steps.
          </p>
          <div style="background: #1f2937; border-left: 3px solid #F59E0B; padding: 16px; border-radius: 0 6px 6px 0; margin: 24px 0;">
            <p style="margin: 0; color: #d1d5db; font-style: italic; line-height: 1.6;">
              "Behind every statistic is a child who wants to participate, communicate, play and learn — and a caregiver who simply wants to know: <em>'How can I help my child?'</em>"
            </p>
          </div>
          <p style="color: #d1d5db; line-height: 1.6;">
            You are helping close a gap that has been too wide for too long. The children and families of Embakasi East and Mukuru are grateful for your support.
          </p>
          <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #374151;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              Stand Out 4 Mental Health (SO4MH) · Embakasi East, Nairobi · Phone: +254 780 796 146<br>
              <a href="mailto:info@standout4mentalhealth.org" style="color: #F59E0B;">info@standout4mentalhealth.org</a> ·
              <a href="https://standout4mentalhealth.org" style="color: #F59E0B;">standout4mentalhealth.org</a>
            </p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: `Pledge registered for ${name}. Confirmation sent to ${email}.`,
    });

  } catch (err) {
    console.error('[pledge] Email error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to send emails. Please contact info@standout4mentalhealth.org directly.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

