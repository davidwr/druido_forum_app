const moment = require('moment')
const connectionFactory = require('../db/connection_factory')

const create = (comment, image, callback) => {
  if (!comment) {
    return callback({
      message: 'Comment is null.',
      statusCode: 400
    })
  }

  if (!comment.message) {
    return callback({
      message: 'Message not found. Field: (message)',
      statusCode: 400
    })
  }

  if (!comment.dd_post) {
    return callback({
      message: 'Post ID not found. Field: (dd_post)',
      statusCode: 400
    })
  }

  if (!comment.dd_user) {
    return callback({
      message: 'User ID not found. Field: (dd_user)',
      statusCode: 400
    })
  }

  comment.created_at = moment().format('YYYY-MM-DD hh:mm:ss')

  const commentParsed = {
    message: comment.message,
    dd_post: comment.dd_post,
    dd_user: comment.dd_user,
    created_at: comment.created_at
  }

  const sql = QueryBuilder('dd_comment').insert(commentParsed).returning('id').toString() // eslint-disable-line

  connectionFactory.executeSql(sql, (err, result) => {
    if (err) return callback(err)
    callback(null, result.rows[0])
  })
}

const update = (id, comment, callback) => {
  if (!id) {
    return callback({
      message: 'ID is null.',
      statusCode: 400
    })
  }

  if (!comment) {
    return callback({
      message: 'Comment is null.',
      statusCode: 400
    })
  }

  comment.updated_at = moment().format('YYYY-MM-DD hh:mm:ss')

  const commentParsed = {
    message: comment.message,
    updated_at: comment.updated_at
  }

  const sql = QueryBuilder('dd_comment') // eslint-disable-line
    .where('id', id)
    .andWhere('dd_user', comment.dd_user)
    .update(commentParsed)
    .returning('id')
    .toString()

  connectionFactory.executeSql(sql, (err, result) => {
    if (err) return callback(err)
    callback(null, result.rows[0])
  })
}

const remove = (id, comment, callback) => {
  if (!id) {
    return callback({
      message: 'ID is null.',
      statusCode: 400
    })
  }

  const sql = QueryBuilder('dd_comment') // eslint-disable-line
    .where('id', id)
    .andWhere('dd_user', comment.dd_user)
    .returning('id')
    .del()
    .toString()

  connectionFactory.executeSql(sql, (err, result) => {
    if (err) return callback(err)
    callback(null, result.rows[0])
  })
}

const find = (id, callback) => {
  var sql = QueryBuilder('dd_comment') // eslint-disable-line
    .select('*')

  if (id) {
    sql.where('id', id)
  }

  sql = sql.toString()
  connectionFactory.executeSql(sql, (err, result) => {
    if (err) return callback(err)

    if (id) {
      return callback(null, result.rows[0])
    }

    callback(null, result.rows)
  })
}

const findByPost = (postId, callback) => {
  if (!postId) {
    return callback({
      message: 'Post ID is null.',
      statusCode: 400
    })
  }

  var sql = QueryBuilder('dd_comment') // eslint-disable-line
    .where('dd_post', postId)
    .select('*')
    .toString()

  connectionFactory.executeSql(sql, (err, result) => {
    if (err) return callback(err)
    callback(null, result.rows)
  })
}

module.exports = { create, update, remove, find, findByPost }
