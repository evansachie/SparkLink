import nodemailer from 'nodemailer';
import crypto from 'crypto';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASSWORD!
  }
});

export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

// Helper function to escape HTML
const escapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

export const sendVerificationEmail = async (email: string, otp: string, firstName?: string) => {
  // Escape user input to prevent XSS
  const safeFirstName = firstName ? escapeHtml(firstName) : '';
  
  const mailOptions = {
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: 'Verify Your SparkLink Account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .otp-code { background: #667eea; color: white; padding: 15px 30px; font-size: 24px; font-weight: bold; text-align: center; border-radius: 6px; margin: 20px 0; letter-spacing: 3px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to SparkLink!</h1>
          </div>
          <div class="content">
            <h2>Hi ${safeFirstName || 'there'}!</h2>
            <p>Thanks for signing up with SparkLink. To complete your registration and verify your email address, please use the verification code below:</p>
            
            <div class="otp-code">${otp}</div>
            
            <p>This code will expire in 10 minutes for security reasons.</p>
            
            <p>If you didn't create an account with SparkLink, please ignore this email.</p>
            
            <div class="footer">
              <p>Best regards,<br>The SparkLink Team</p>
              <p><small>This is an automated email, please do not reply.</small></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};
