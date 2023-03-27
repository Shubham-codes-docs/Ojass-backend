const nodemailer = require("nodemailer");
console.log(process.env.EMAIL_USER_NAME);
console.log(process.env.EMAIL_USER_PASSWORD);

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: "shubhut17@gmail.com",
    pass: "fddysdswjcbpsghx",
  },
});

module.exports = transport;
