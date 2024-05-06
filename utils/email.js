const nodemailer = require('nodemailer');

module.exports = async (options) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: `Strahinja Zlatanovic <zlatanovichs6@gmail.com>`,
    to: options.to,
    subject: options.subject,
    text: options.message,
  };
  await transport.sendMail(mailOptions);
};
