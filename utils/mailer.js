const dotenv = require("dotenv");
dotenv.config();

const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.EMAIL_USER_NAME,
    pass: process.env.EMAIL_USER_PASSWORD,
  },
});

module.exports = transport;
