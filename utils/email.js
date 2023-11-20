/* eslint-disable import/no-extraneous-dependencies */
const nodemailer = require('nodemailer')
const pug = require('pug')
const {convert} = require('html-to-text')
const path = require('path')

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email
    this.firstName = user.name.split(' ')[0]
    this.url = url
    this.from = `Minilik Zeru ${process.env.EMAIL_FROM}`
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return 1
    }

    return nodemailer.createTransport({
      // 1) Create a transporter
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    })
  }

  async send(template, subject) {
    // 1) Render HTML based on your(in this case pug template) template
    const templatePath = path.join(__dirname, '..', 'views', 'email', `${template}.pug`);
    const html = pug.renderFile(templatePath, {
      firstName: this.firstName,
      url: this.url,
      subject
    })

    // 2) Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html)
    }

    // 3) creat a transport and send email
    await this.newTransport().sendMail(mailOptions)
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!')
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'Your password reset token (valid for only 10 min)')
  }
}

// const sendEmail = async (options) => {
//   // 2) Define the email options
//   const mailOptions = {
//     from: 'Minilik Zeru <hello@minilik.io>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message
//   }

//   // 3) Actually sent the email
// }
