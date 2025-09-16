import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // 587 için kesinlikle false olmalı
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
    console.log("✅ Mail gönderildi:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Mail gönderilemedi:", error);
    throw error;
  }
};

export default sendEmail;
