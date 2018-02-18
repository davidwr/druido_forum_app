const connectionFactory = require('../db/connection_factory')
const moment = require('moment')

const create = (like, callback) => {
  if (!like) {
    return callback({
      message: 'like is null.',
      statusCode: 400
    })
  }

  if (!like.liked) {
    return callback({
      message: 'Liked not found. Field: (liked)',
      statusCode: 400
    })
  }

  if (!like.dd_post) {
    return callback({
      message: 'Post ID not found. Field: (dd_post)',
      statusCode: 400
    })
  }

  if (!like.dd_user) {
    return callback({
      message: 'User ID not found. Field: (dd_user)',
      statusCode: 400
    })
  }

  like.created_at = moment().format('YYYY-MM-DD hh:mm:ss')

  const likeParsed = {
    liked: like.liked,
    dd_post: like.dd_post,
    dd_user: like.dd_user,
    created_at: like.created_at
  }

  const sql = QueryBuilder('dd_like').insert(likeParsed).returning('id').toString() // eslint-disable-line

  connectionFactory.executeSql(sql, (err, result) => {
    if (err) return callback(err)
    callback(null, result.rows[0])
  })
}

const update = (id, like, callback) => {
  if (!like) {
    return callback({
      message: 'like is null.',
      statusCode: 400
    })
  }

  like.updated_at = moment().format('YYYY-MM-DD hh:mm:ss')

  const likeParsed = {
    liked: like.liked,
    updated_at: like.updated_at
  }

  const sql = QueryBuilder('dd_like') // eslint-disable-line
    .where('id', id)
    .andWhere('dd_user', like.dd_user)
    .update(likeParsed)
    .returning('id')
    .toString()

  connectionFactory.executeSql(sql, (err, result) => {
    if (err) return callback(err)
    callback(null, result.rows[0])
  })
}

module.exports = { create, update }
