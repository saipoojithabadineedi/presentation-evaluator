import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Set open CORS headers so frontend and backend can call this endpoint
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
    const { to, otp } = req.body || {};

    if (!to || !otp) {
      return res.status(400).json({ error: 'Recipient email and OTP are required' });
    }

    const emailUser = process.env.EMAIL_USER || 'thupakulakulayappa24@gmail.com';
    const emailPassword = process.env.EMAIL_PASSWORD || 'blxwhvqotlyrthbr';

    // Port 465 with SSL/TLS directly to Gmail (Never blocked on Vercel)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Presentation Evaluator</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 6px;">Password Reset Verification</p>
        </div>
        
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hello,</p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">We received a request to reset your Presentation Evaluator account password. Use the verification code below to complete the reset process:</p>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; margin: 28px 0;">
          <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1e293b;">${otp}</span>
        </div>
        
        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">This code is valid for <strong>5 minutes</strong>. If you did not request this code, you can safely ignore this email — your account remains secure.</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;" />
        
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">Presentation Evaluator Team &bull; Real-time AI Presentation Feedback</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Presentation Evaluator" <${emailUser}>`,
      to: to.trim(),
      subject: `Presentation Evaluator Verification Code: ${otp}`,
      text: `Your Presentation Evaluator verification code is: ${otp}. It is valid for 5 minutes.`,
      html: htmlContent,
    });

    console.log(`[EMAIL DISPATCH] Successfully sent email to ${to}: ${info.messageId}`);
    return res.status(200).json({ success: true, message: `Verification code sent to ${to}` });
  } catch (error) {
    console.error('[EMAIL DISPATCH ERROR]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
