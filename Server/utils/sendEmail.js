const nodemailer = require("nodemailer");

const getEmailUser = () => process.env.EMAIL_USER || process.env.SMTP_EMAIL;
const getEmailPass = () => process.env.EMAIL_PASS || process.env.SMTP_PASSWORD;

// Create transporter using Gmail or mock for testing
const createTransporter = () => {
  if (process.env.USE_MOCK_EMAIL === "true") {
    return {
      verify: async () => true,
      sendMail: async (options) => ({
        messageId: "mock-" + Date.now(),
        accepted: [options.to],
        rejected: [],
      }),
    };
  }

  const user = getEmailUser();
  const pass = getEmailPass();
  if (!user || !pass) {
    throw new Error(
      'Missing email credentials. Set either EMAIL_USER/EMAIL_PASS or SMTP_EMAIL/SMTP_PASSWORD in your ".env".'
    );
  }

  const port = parseInt(process.env.SMTP_PORT) || 587;
  
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: port,
    secure: port === 465,
    auth: {
      user,
      pass,
    }
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generic email sender (kept for forgot-password etc.)
const sendEmail = async ({ email, subject, message, html }) => {
  const transporter = createTransporter();
  await transporter.verify();

  const fromAddress = getEmailUser();
  return transporter.sendMail({
    from: {
      name: process.env.FROM_NAME || "SkillBarter Teams",
      address: fromAddress,
    },
    replyTo: fromAddress,
    to: email,
    subject,
    text: message,
    html: html || message,
  });
};

// Send OTP email
const sendOTPEmail = async (email, otp, username) => {
  const subject = "Your SkillBarter Login OTP";
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SkillBarter Login Verification</title>
</head>
<body style="background-color: #f9f9f9; padding: 20px; font-family: Arial, sans-serif;">
  <div style="max-width: 520px; margin: 0 auto; padding: 20px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
    <h2 style="margin: 0 0 12px 0; color: #111827;">SkillBarter Login Verification</h2>
    <p style="margin: 0 0 10px 0; color: #374151;">Hello <strong>${username || "User"}</strong>,</p>
    <p style="margin: 0 0 16px 0; color: #374151;">Your one-time password (OTP) is:</p>
    <div style="background:#f3f4f6; padding: 16px; text-align: center; border-radius: 10px; margin: 12px 0 16px;">
      <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color:#111827;">${otp}</span>
    </div>
    <p style="margin: 0 0 6px 0; color: #6b7280; font-size: 14px;">This OTP is valid for 10 minutes.</p>
    <p style="margin: 0; color: #6b7280; font-size: 14px;">If you didn’t request this, please ignore this email.</p>
  </div>
</body>
</html>`;

  const result = await sendEmail({
    email,
    subject,
    message: `Hello ${username || "User"},\n\nYour SkillBarter login OTP is ${otp}. It is valid for 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
    html,
  });

  return { success: true, messageId: result.messageId };
};

module.exports = {
  createTransporter,
  generateOTP,
  sendEmail,
  sendOTPEmail,
};