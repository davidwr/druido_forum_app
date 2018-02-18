const likeService = require('../services/like')

const post = (req, res, next) => {
  likeService.create(req.body, (err, like) => {
    if (err) return next(err)
    res.status(202).send(like)
  })
}

const put = (req, res, next) => {
  likeService.update(req.params.id, req.body, (err, like) => {
    if (err) return next(err)

    if (!like) {
      return next({
        message: 'Not found',
        statusCode: 404
      })
    }

    res.status(200).send(like)
  })
}

module.exports = { post, put }
