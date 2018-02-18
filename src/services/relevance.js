const connectionFactory = require('../db/connection_factory')
const moment = require('moment')

const create = (relevance, callback) => {
  if (!relevance) {
    return callback({
      message: 'Relevance is null.',
      statusCode: 400
    })
  }

  if (!relevance.positive) {
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

const update = (id, relevance, callback) => {
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
    .where('id', id)
    .andWhere('dd_user', relevance.dd_user)
    .update(relevanceParsed)
    .returning('id')
    .toString()

  connectionFactory.executeSql(sql, (err, result) => {
    if (err) return callback(err)
    callback(null, result.rows[0])
  })
}

module.exports = { create, update }
