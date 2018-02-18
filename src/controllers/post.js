const postService = require('../services/post')

const post = (req, res, next) => {
  postService.create(req.body, req.file, (err, post) => {
    if (err) return next(err)
    res.status(202).send(post)
  })
}

const put = (req, res, next) => {
  postService.update(req.params.id, req.body, req.file, (err, post) => {
    if (err) return next(err)

    if (!post) {
      return next({
        message: 'Not found',
        statusCode: 404
      })
    }

    res.status(200).send(post)
  })
}

const destroy = (req, res, next) => {
  postService.remove(req.params.id, req.body, (err, post) => {
    if (err) return next(err)

    if (!post) {
      return next({
        message: 'Not found',
        statusCode: 404
      })
    }

    res.status(200).send(post)
  })
}

const getByCategory = (req, res, next) => {
  postService.findByCategory(req.params.categoryId, (err, post) => {
    if (err) return next(err)
    res.status(200).send(post)
  })
}

const get = (req, res, next) => {
  postService.find(req.params.id, (err, post) => {
    if (err) return next(err)
    res.status(200).send(post)
  })
}

const getAll = (req, res, next) => {
  postService.find(null, (err, post) => {
    if (err) return next(err)
    res.status(200).send(post)
  })
}

module.exports = { post, put, get, getAll, destroy, getByCategory }
