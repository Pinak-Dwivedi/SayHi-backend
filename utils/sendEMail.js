const nodemailer = require("nodemailer");

async function sendEMail(to, subject, text) {
  try {
    const transport = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_ID,
      to,
      subject,
      text,
    };

    const res = await transport.sendMail(mailOptions);

    if (res.messageId != null) return "Email sent successfully!";
  } catch (error) {
    return "Email not sent";
  }
}

module.exports = sendEMail;
