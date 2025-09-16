// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';

// dotenv.config(); // .env dosyasını yükler

// async function testMail() {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: process.env.SMTP_PORT,
//       secure: false, // STARTTLS için
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//     });

//     const info = await transporter.sendMail({
//       from: process.env.SMTP_FROM,
//       to: 'emreygt51@gmail.com', // Buraya kendi test mailini yaz
//       subject: 'Test Mail',
//       text: 'Bu bir test mailidir.',
//     });

//     console.log('Mail gönderildi:', info);
//   } catch (err) {
//     console.error('Mail gönderilemedi:', err);
//   }
// }

// testMail();
