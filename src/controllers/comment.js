const commentService = require('../services/comment')

const post = (req, res, next) => {
  commentService.create(req.body, req.file, (err, comment) => {
    if (err) return next(err)
    res.status(202).send(comment)
  })
}

const put = (req, res, next) => {
  commentService.update(req.params.id, req.body, (err, comment) => {
    if (err) return next(err)

    if (!comment) {
      return next({
        message: 'Not found',
        statusCode: 404
      })
    }

    res.status(200).send(comment)
  })
}

const destroy = (req, res, next) => {
  commentService.remove(req.params.id, req.body, (err, comment) => {
    if (err) return next(err)

    if (!comment) {
      return next({
        message: 'Not found',
        statusCode: 404
      })
    }

    res.status(200).send(comment)
  })
}

const getByPost = (req, res, next) => {
  commentService.findByPost(req.params.postId, (err, comment) => {
    if (err) return next(err)
    res.status(200).send(comment)
  })
}

const get = (req, res, next) => {
  commentService.find(req.params.id, (err, comment) => {
    if (err) return next(err)
    res.status(200).send(comment)
  })
}

module.exports = { post, put, get, destroy, getByPost }
