import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Set open CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email, name } = req.body || {};

    if (!email) {
      return res.status(400).json({ error: 'Recipient email is required' });
    }

    const recipientName = name && name.trim() ? name.trim() : 'User';
    const emailUser = process.env.EMAIL_USER || 'presentationevaluator2@gmail.com';
    const emailPassword = process.env.EMAIL_PASSWORD || 'oqifftiejiinklwd';

    // Port 465 with SSL/TLS directly to Gmail
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });

    const textContent = `Hello ${recipientName},

Welcome to Presentation Evaluator! You have successfully registered your account with this email address (${email}).

You can now sign in at any time to start analyzing and improving your presentation skills with real-time AI coaching.

Regards,
Presentation Evaluator Team
presentationevaluator2@gmail.com`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #059669; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Presentation Evaluator</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 6px;">Analyze &bull; Improve &bull; Succeed</p>
        </div>
        
        <p style="color: #334155; font-size: 16px; line-height: 1.6;">Hello <strong>${recipientName}</strong>,</p>
        
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          Welcome to <strong>Presentation Evaluator</strong>! You have successfully registered your account with this email address (<strong>${email}</strong>).
        </p>
        
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #166534; margin: 0 0 10px 0; font-size: 15px; font-weight: 700;">What you can do next:</h3>
          <ul style="color: #15803d; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>Practice presentations with real-time AI speech coaching</li>
            <li>Get AI pacing, cadence, and filler-word metrics</li>
            <li>Track your growth and speaker tier over time</li>
          </ul>
        </div>
        
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          You can now sign in at any time to begin your presentation rehearsals.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;" />
        
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
          Presentation Evaluator Team &bull; <a href="mailto:presentationevaluator2@gmail.com" style="color: #059669; text-decoration: none;">presentationevaluator2@gmail.com</a>
        </p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: emailUser,
      to: email.trim(),
      subject: 'Welcome to Presentation Evaluator! You have registered successfully 🎉',
      text: textContent,
      html: htmlContent,
    });

    console.log(`[WELCOME EMAIL DISPATCH] Sent to ${email}: ${info.messageId}`);
    return res.status(200).json({ success: true, message: `Welcome email sent to ${email}` });
  } catch (error) {
    console.error('[WELCOME EMAIL ERROR]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
