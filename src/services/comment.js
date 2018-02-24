const moment = require('moment')
const connectionFactory = require('../db/connection_factory')
const async = require('async')
const relevance = require('./relevance')

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
    .orderBy('created_at', 'asc')
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

  function getComments (callback) {
    let sql = QueryBuilder('dd_comment') // eslint-disable-line
      .where('dd_post', postId)
      .innerJoin('dd_user', 'dd_user.id', 'dd_comment.dd_user')
      .select('dd_comment.*', 'dd_user.name')
      .orderBy('created_at', 'asc')
      .toString()

    connectionFactory.executeSql(sql, (err, result) => {
      if (err) return callback(err)
      callback(null, result.rows)
    })
  }

  var comments = {}
  async.series([
    (done) => {
      getComments((err, commentsResult) => {
        if (err) return done(err)
        comments = commentsResult
        done()
      })
    },
    (done) => {
      async.each(comments, (comment, doneEach) => {
        relevance.getCountPositiveByComment(comment.id, (err, result) => {
          if (err) return doneEach(err)
          comment.positives = result
          doneEach()
        })
      }, (err) => {
        if (err) return done(err)
        done()
      })
    },
    (done) => {
      async.each(comments, (comment, doneEach) => {
        relevance.getCountNegativeByComment(comment.id, (err, result) => {
          if (err) return doneEach(err)
          comment.negatives = result
          doneEach()
        })
      }, (err) => {
        if (err) return done(err)
        done()
      })
    }
  ], (err, results) => {
    if (err) return callback(err)
    callback(null, comments)
  })
}

const getCountCommentsByPost = (postId, callback) => {
  const sql = QueryBuilder('dd_comment') // eslint-disable-line
    .where('dd_post', postId)
    .count('id')
    .toString()

  connectionFactory.executeSql(sql, (err, result) => {
    if (err) return callback(err)
    callback(null, result.rows[0].count)
  })
}

module.exports = { create, update, remove, find, findByPost, getCountCommentsByPost }
