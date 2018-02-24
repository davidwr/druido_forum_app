const connectionFactory = require('../db/connection_factory')
const moment = require('moment')
const async = require('async')

const create = (relevance, callback) => {
  if (!relevance) {
    return callback({
      message: 'Relevance is null.',
      statusCode: 400
    })
  }

  if (!relevance.positive && relevance.positive !== false) {
    return callback({
      message: 'Positive not found. Field: (positive)',
      statusCode: 400
    })
  }

  if (!relevance.dd_comment) {
    return callback({
      message: 'Comment ID not found. Field: (dd_comment)',
      statusCode: 400
    })
  }

  if (!relevance.dd_user) {
    return callback({
      message: 'User ID not found. Field: (dd_user)',
      statusCode: 400
    })
  }

  relevance.created_at = moment().format('YYYY-MM-DD hh:mm:ss')

  const relevanceParsed = {
    positive: relevance.positive,
    dd_comment: relevance.dd_comment,
    dd_user: relevance.dd_user,
    created_at: relevance.created_at
  }

  const sql = QueryBuilder('dd_relevance').insert(relevanceParsed).returning('id').toString() // eslint-disable-line

  connectionFactory.executeSql(sql, (err, result) => {
    if (err) return callback(err)
    callback(null, result.rows[0])
  })
}

const update = (relevance, callback) => {
  if (!relevance) {
    return callback({
      message: 'Relevance is null.',
      statusCode: 400
    })
  }

  relevance.updated_at = moment().format('YYYY-MM-DD hh:mm:ss')

  const relevanceParsed = {
    positive: relevance.positive,
    updated_at: relevance.updated_at
  }

  const sql = QueryBuilder('dd_relevance') // eslint-disable-line
    .where('dd_comment', relevance.dd_comment)
    .andWhere('dd_user', relevance.dd_user)
    .update(relevanceParsed)
    .returning('id')
    .toString()

  connectionFactory.executeSql(sql, (err, result) => {
    if (err) return callback(err)
    callback(null, result.rows[0])
  })
}

const getByUser = (userId, commentId, callback) => {
  const sql = QueryBuilder('dd_relevance') // eslint-disable-line
    .where('dd_user', userId)
    .andWhere('dd_comment', commentId)
    .select('id')
    .toString()

  connectionFactory.executeSql(sql, (err, result) => {
    if (err) return callback(err)
    callback(null, result.rows[0])
  })
}

const upsert = (relevance, callback) => {
  var isInsert = false
  async.series([
    (done) => {
      getByUser(relevance.dd_user, relevance.dd_comment, (err, result) => {
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

      create(relevance, done)
    },
    (done) => {
      if (isInsert) {
        return done()
      }

      update(relevance, done)
    }
  ], (err) => {
    if (err) return callback(err)
    callback(null, relevance)
  })
}

const getCountPositiveByComment = (commentId, callback) => {
  const sql = QueryBuilder('dd_relevance') // eslint-disable-line
    .where('dd_comment', commentId)
    .andWhere('positive', true)
    .count('id')
    .toString()

  connectionFactory.executeSql(sql, (err, result) => {
    if (err) return callback(err)
    callback(null, result.rows[0].count)
  })
}

const getCountNegativeByComment = (commentId, callback) => {
  const sql = QueryBuilder('dd_relevance') // eslint-disable-line
    .where('dd_comment', commentId)
    .andWhere('positive', false)
    .count('id')
    .toString()

  connectionFactory.executeSql(sql, (err, result) => {
    if (err) return callback(err)
    callback(null, result.rows[0].count)
  })
}

module.exports = { upsert, getCountPositiveByComment, getCountNegativeByComment }
