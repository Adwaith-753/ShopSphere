const nodemailer = require("nodemailer");

const isSmtpConfigured = () =>
  Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );

const sendPasswordResetEmail = async (email, resetUrl) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from:
      process.env.SMTP_FROM ||
      `"ShopSphere" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset your ShopSphere password",
    text: `Reset your password within 30 minutes:\n${resetUrl}`,
    html: `
      <h2>Reset your ShopSphere password</h2>
      <p>This link expires in 30 minutes.</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
    `,
  });
};

module.exports = {
  isSmtpConfigured,
  sendPasswordResetEmail,
};
