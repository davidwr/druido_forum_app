const moment = require('moment')
const connectionFactory = require('../db/connection_factory')
const utils = require('./utils')

const create = (post, image, callback) => {
  if (!post) {
    return callback({
      message: 'Post is null.',
      statusCode: 400
    })
  }

  if (!post.title) {
    return callback({
      message: 'Title not found. Field: (title)',
      statusCode: 400
    })
  }

  if (!post.description) {
    return callback({
      message: 'Description not found. Field: (description)',
      statusCode: 400
    })
  }

  if (!post.dd_category) {
    return callback({
      message: 'Category ID not found. Field: (dd_category)',
      statusCode: 400
    })
  }

  if (!post.dd_user) {
    return callback({
      message: 'User ID not found. Field: (dd_user)',
      statusCode: 400
    })
  }

  if (image) {
    post.image = utils.base64_encode(image.path)
  }

  post.created_at = moment().format('YYYY-MM-DD hh:mm:ss')

  const postParsed = {
    title: post.title,
    description: post.description,
    dd_category: post.dd_category,
    dd_user: post.dd_user,
    image: post.image,
    created_at: post.created_at
  }

  const sql = QueryBuilder('dd_post').insert(postParsed).returning('id').toString() // eslint-disable-line

  connectionFactory.executeSql(sql, (err, result) => {
    if (err) return callback(err)
    callback(null, result.rows[0])
  })
}

const update = (id, post, image, callback) => {
  if (!id) {
    return callback({
      message: 'ID is null.',
      statusCode: 400
    })
  }

  if (!post) {
    return callback({
      message: 'Post is null.',
      statusCode: 400
    })
  }

  if (image) {
    post.image = utils.base64_encode(image.path)
  }

  post.updated_at = moment().format('YYYY-MM-DD hh:mm:ss')

  const postParsed = {
    title: post.title,
    description: post.description,
    dd_category: post.dd_category,
    image: post.image,
    updated_at: post.updated_at
  }

  const sql = QueryBuilder('dd_post') // eslint-disable-line
    .where('id', id)
    .andWhere('dd_user', post.dd_user)
    .update(postParsed)
    .returning('id')
    .toString()

  connectionFactory.executeSql(sql, (err, result) => {
    if (err) return callback(err)
    callback(null, result.rows[0])
  })
}

const remove = (id, post, callback) => {
  if (!id) {
    return callback({
      message: 'ID is null.',
      statusCode: 400
    })
  }

  const sql = QueryBuilder('dd_post') // eslint-disable-line
    .where('id', id)
    .andWhere('dd_user', post.dd_user)
    .returning('id')
    .del()
    .toString()

  connectionFactory.executeSql(sql, (err, result) => {
    if (err) return callback(err)
    callback(null, result.rows[0])
  })
}

const find = (id, callback) => {
  var sql = QueryBuilder('dd_post') // eslint-disable-line
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

const findByCategory = (categoryId, callback) => {
  if (!categoryId) {
    return callback({
      message: 'Category ID is null.',
      statusCode: 400
    })
  }

  var sql = QueryBuilder('dd_post') // eslint-disable-line
    .where('dd_category', categoryId)
    .select('*')
    .toString()

  connectionFactory.executeSql(sql, (err, result) => {
    if (err) return callback(err)
    callback(null, result.rows)
  })
}

module.exports = { create, update, remove, find, findByCategory }
