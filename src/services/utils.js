const fs = require('fs')
const nodemailer = require('nodemailer')
const emailValidator = require('email-validator')

module.exports.base64_encode = (file) => {
  const image = fs.readFileSync(file)
  return new Buffer(image).toString('base64')
}

module.exports.isValidEmail = (email) => {
  return emailValidator.validate(email)
}

module.exports.sendEmailResetPassword = (email, newPassword, callback) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: CONFIG.email.username,
      pass: CONFIG.email.password
    }
  })

  const mailOptions = {
    from: CONFIG.email.username,
    to: email,
    subject: 'Druido Forum App reset password.',
    html: `<p>New password: <b>${newPassword}</b></p><br><p>Please change your password in your next login for more security.</p>`
  }

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) return callback(err)
    callback(null, info)
  })
}

module.exports.sendEmailConfirmation = (email, link, callback) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: CONFIG.email.username,
      pass: CONFIG.email.password
    }
  })

  const mailOptions = {
    from: CONFIG.email.username,
    to: email,
    subject: 'Druido Forum App account confirmation!',
    html: `<h1>Please confirm your account cliking on link below.</h1><br><a href="${link}">Confirmation link</a>`
  }

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) return callback(err)
    callback(null, info)
  })
}
