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
    html: `<p>Please confirm your account cliking on link below.</p><br><a href="${link}">Confirmation link</a>`
  }

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) return callback(err)
    callback(null, info)
  })
}
