const dotenv = require('dotenv').config()
var nodemailer = require('nodemailer');
const myEmail = process.env.EMAILADDRESS
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: myEmail,
    pass: process.env.EMAILPASS
  }
});

  function sendEmail(clientEmail)
  {
    var mailOptions = {
      from: myEmail,
      to: clientEmail,
      subject: 'Sending Emails using Node.js',
      text: 'Test Email',
      html: "<h1>Hello world</h1>",
    };
    return transporter.sendMail(mailOptions)

  }



module.exports = {
  sendEmail
}