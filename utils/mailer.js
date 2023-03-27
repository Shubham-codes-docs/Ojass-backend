const nodemailer = require("nodemailer");
console.log(process.env.EMAIL_USER_NAME);
console.log(process.env.EMAIL_USER_PASSWORD);

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.EMAIL_USER_NAME,
    pass: process.env.EMAIL_USER_PASSWORD,
  },
});

module.exports = transport;
