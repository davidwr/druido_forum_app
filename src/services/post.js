const moment = require('moment')
const connectionFactory = require('../db/connection_factory')
const utils = require('./utils')
const likeService = require('./like')
const commentService = require('./comment')
const async = require('async')

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

const find = (id, filter, callback) => {
  var sql = QueryBuilder('dd_post') // eslint-disable-line
    .innerJoin('dd_user', 'dd_user.id', 'dd_post.dd_user')
    .select('dd_post.*', 'dd_user.name')

  if (id) {
    sql.where('id', id)
  }

  if (filter) {
    if (filter.recents) {
      sql.orderBy('created_at', 'desc')
    }
  }

  sql = sql.toString()

  console.log(sql)

  var posts = []
  async.series([
    (done) => {
      connectionFactory.executeSql(sql, (err, result) => {
        if (err) return done(err)
        posts = result.rows
        done()
      })
    },
    (done) => {
      async.each(posts, (post, doneEach) => {
        likeService.getLikesByPost(post.id, (err, result) => {
          if (err) return doneEach(err)
          post.likes = result
          doneEach()
        })
      }, (err) => {
        if (err) return done(err)
        done()
      })
    },
    (done) => {
      async.each(posts, (post, doneEach) => {
        commentService.getCountCommentsByPost(post.id, (err, result) => {
          if (err) return doneEach(err)
          post.comments = result
          doneEach()
        })
      }, (err) => {
        if (err) return done(err)
        done()
      })
    },
    (done) => {
      if (!filter) {
        return done()
      }

      if (filter.most_rated) {
        posts = posts.sort((a, b) => {
          return parseInt(a.likes, 10) < parseInt(b.likes, 10)
        })
      }

      if (filter.most_commented) {
        posts = posts.sort((a, b) => {
          return parseInt(a.comments, 10) < parseInt(b.comments, 10)
        })
      }

      done()
    }
  ], (err) => {
    if (err) return callback(err)

    if (id) {
      return callback(null, posts[0])
    }

    callback(null, posts)
  })
}

const findByCategory = (categoryId, filter, callback) => {
  if (!categoryId) {
    return callback({
      message: 'Category ID is null.',
      statusCode: 400
    })
  }

  var sql = QueryBuilder('dd_post') // eslint-disable-line
    .where('dd_category', categoryId)
    .innerJoin('dd_user', 'dd_user.id', 'dd_post.dd_user')
    .select('dd_post.*', 'dd_user.name')

  if (filter) {
    if (filter.recents) {
      sql.orderBy('created_at', 'desc')
    }
  }

  sql = sql.toString()

  var posts = []
  async.series([
    (done) => {
      connectionFactory.executeSql(sql, (err, result) => {
        if (err) return done(err)
        posts = result.rows
        done()
      })
    },
    (done) => {
      async.each(posts, (post, doneEach) => {
        likeService.getLikesByPost(post.id, (err, result) => {
          if (err) return doneEach(err)
          post.likes = result
          doneEach()
        })
      }, (err) => {
        if (err) return done(err)
        done()
      })
    },
    (done) => {
      async.each(posts, (post, doneEach) => {
        commentService.getCountCommentsByPost(post.id, (err, result) => {
          if (err) return doneEach(err)
          post.comments = result
          doneEach()
        })
      }, (err) => {
        if (err) return done(err)
        done()
      })
    },
    (done) => {
      if (!filter) {
        return done()
      }

      if (filter.most_rated) {
        posts = posts.sort((a, b) => {
          return parseInt(a.likes, 10) < parseInt(b.likes, 10)
        })
      }

      if (filter.most_commented) {
        posts = posts.sort((a, b) => {
          return parseInt(a.comments, 10) < parseInt(b.comments, 10)
        })
      }

      done()
    }
  ], (err) => {
    if (err) return callback(err)
    callback(null, posts)
  })
}

module.exports = { create, update, remove, find, findByCategory }
