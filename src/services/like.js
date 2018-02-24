const connectionFactory = require('../db/connection_factory')
const moment = require('moment')
const async = require('async')

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

const update = (like, callback) => {
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
    .where('dd_post', like.dd_post)
    .andWhere('dd_user', like.dd_user)
    .update(likeParsed)
    .returning('id')
    .toString()

  connectionFactory.executeSql(sql, (err, result) => {
    if (err) return callback(err)
    callback(null, result.rows[0])
  })
}

const getByUser = (userId, postId, callback) => {
  const sql = QueryBuilder('dd_like') // eslint-disable-line
    .where('dd_user', userId)
    .andWhere('dd_post', postId)
    .select('id')
    .toString()

  connectionFactory.executeSql(sql, (err, result) => {
    if (err) return callback(err)
    callback(null, result.rows[0])
  })
}

const upsert = (like, callback) => {
  var isInsert = false
  async.series([
    (done) => {
      getByUser(like.dd_user, like.dd_post, (err, result) => {
        if (err) return done(err)
        if (!result) {
          isInsert = true
        }
        done()
      })
    },
    (done) => {
      if (!isInsert) {
        return done()
      }

      create(like, done)
    },
    (done) => {
      if (isInsert) {
        return done()
      }

      update(like, done)
    }
  ], (err) => {
    if (err) return callback(err)
    callback(null, like)
  })
}

const getLikesByPost = (postId, callback) => {
  const sql = QueryBuilder('dd_like') // eslint-disable-line
    .where('dd_post', postId)
    .andWhere('liked', true)
    .count('id')
    .toString()

  connectionFactory.executeSql(sql, (err, result) => {
    if (err) return callback(err)
    callback(null, result.rows[0].count)
  })
}

module.exports = { upsert, getLikesByPost }
