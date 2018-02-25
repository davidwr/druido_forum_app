const md5 = require('md5')
const moment = require('moment')
const connectionFactory = require('../db/connection_factory')
const utils = require('./utils')

const create = (user, image, callback) => {
  if (!user) {
    return callback({
      message: 'User is null.',
      statusCode: 400
    })
  }

  if (!user.email) {
    return callback({
      message: 'Email not found. Field: (email)',
      statusCode: 400
    })
  }

  if (!utils.isValidEmail(user.email)) {
    return callback({
      message: 'Invalid email. Field: (email)',
      statusCode: 400
    })
  }

  if (!user.username) {
    return callback({
      message: 'Username not found. Field: (username)',
      statusCode: 400
    })
  }

  if (!user.password) {
    return callback({
      message: 'Password not found. Field: (password)',
      statusCode: 400
    })
  }

  if (!user.name) {
    return callback({
      message: 'Name not found. Field: (name)',
      statusCode: 400
    })
  }

  if (image) {
    user.image = utils.base64_encode(image.path)
  }

  user.hash = md5(user.username + user.password)
  user.created_at = moment().format('YYYY-MM-DD hh:mm:ss')

  const userParsed = {
    email: user.email,
    username: user.username,
    password: user.password,
    name: user.name,
    hash: user.hash,
    created_at: user.created_at,
    image: user.image
  }

  const sql = QueryBuilder('dd_user').insert(userParsed).returning('id').toString() // eslint-disable-line

  connectionFactory.executeSql(sql, (err, result) => {
    if (err) return callback(err)

    const link = CONFIG.api.full_host + 'confirmation/' + user.hash
    utils.sendEmailConfirmation(user.email, link, (err, info) => {
      if (err) return callback(err)
      callback(null, result.rows[0])
    })
  })
}

const update = (id, user, image, callback) => {
  if (!id) {
    return callback({
      message: 'ID is null.',
      statusCode: 400
    })
  }

  if (!user) {
    return callback({
      message: 'User is null.',
      statusCode: 400
    })
  }

  if (image) {
    user.image = utils.base64_encode(image.path)
  }

  user.updated_at = moment().format('YYYY-MM-DD hh:mm:ss')

  const userParsed = {
    password: user.password,
    name: user.name,
    updated_at: user.updated_at,
    image: user.image
  }

  var sql = QueryBuilder('dd_user') // eslint-disable-line
    .where('id', id)
    .update(userParsed)
    .returning('id')

  if (user.dd_user) {
    sql.andWhere('id', user.dd_user)
  }

  const sqlDone = sql.toString()

  connectionFactory.executeSql(sqlDone, (err, result) => {
    if (err) return callback(err)
    callback(null, result.rows[0])
  })
}

const find = (id, params, callback) => {
  if (!id) {
    return callback({
      message: 'ID is null.',
      statusCode: 400
    })
  }

  var fields = ['id', 'name', 'username']

  if (params) {
    if (params.image) {
      fields.push('image')
    }
  }

  const sql = QueryBuilder('dd_user') // eslint-disable-line
    .where('id', id)
    .select(fields)
    .toString()

  connectionFactory.executeSql(sql, (err, result) => {
    if (err) return callback(err)
    callback(null, result.rows[0])
  })
}

const confirm = (hash, callback) => {
  const sql = QueryBuilder('dd_user') // eslint-disable-line
    .where('hash', hash)
    .select('id')
    .toString()

  connectionFactory.executeSql(sql, (err, selectResult) => {
    if (err) return callback(err)

    if (selectResult.rows.length < 1) {
      return callback({
        message: 'User not found.',
        status: 404
      })
    }

    const sqlUpdate = QueryBuilder('dd_user') // eslint-disable-line
      .where('id', selectResult.rows[0].id)
      .update({
        confirmed: true
      })
      .returning('id')
      .toString()

    connectionFactory.executeSql(sqlUpdate, (err, updateResult) => {
      if (err) return callback(err)
      callback(null, updateResult.rows[0])
    })
  })
}

module.exports = { create, update, find, confirm }
