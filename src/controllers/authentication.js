const connectionFactory = require('../db/connection_factory')
const userService = require('../services/user')
const utils = require('../services/utils')
const shortId = require('shortid')

module.exports.login = (req, res, next) => {
  if (req.session.username) {
    return res.send('Already have a session running, please logout.')
  }

  if (!req.body.username) {
    return res.status(400).send('Username has not informed.')
  }

  if (!req.body.password) {
    return res.status(400).send('Password has not informed.')
  }

  const sql = QueryBuilder('dd_user') // eslint-disable-line
    .where('username', req.body.username)
    .andWhere('password', req.body.password)
    .select('id', 'confirmed')
    .toString()

  connectionFactory.executeSql(sql, (err, result) => {
    if (err) return next(err)
    if (!result.rows[0]) return res.status(403).send('Access Denied.')

    if (!result.rows[0].confirmed) {
      return res.status(403).send('Please confirm your account in your email.')
    }

    req.session.username = req.body.username
    res.send('Authenticated!')
  })
}

module.exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err)

    res.send('See you!')
  })
}

module.exports.confirmation = (req, res, next) => {
  if (!req.params) {
    return next({
      message: 'Invalid confirmation link.',
      status: 400
    })
  }

  if (!req.params.hash) {
    return next({
      message: 'Invalid confirmation link.',
      status: 400
    })
  }

  userService.confirm(req.params.hash, (err) => {
    if (err) return next(err)
    res.send('Druido App Forum: Your account is confirmed with success!')
  })
}

module.exports.forgotPassword = (req, res, next) => {
  if (!req.body.email) {
    return next({
      message: 'Email not found. Field: (email)',
      status: 400
    })
  }

  const sql = QueryBuilder('dd_user') // eslint-disable-line
    .where('email', req.body.email)
    .select('id', 'email')
    .toString()

  connectionFactory.executeSql(sql, (err, result) => {
    if (err) return next(err)
    if (!result.rows[0]) return res.status(404).send('Account not found.')

    const newPassword = shortId.generate()
    userService.update(result.rows[0].id, {
      password: newPassword
    }, null, (err) => {
      if (err) return next(err)
      utils.sendEmailResetPassword(result.rows[0].email, newPassword, (err) => {
        if (err) return next(err)
        res.send('Password reseted, please check your email.')
      })
    })
  })
}
