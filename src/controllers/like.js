const likeService = require('../services/like')

const put = (req, res, next) => {
  likeService.upsert(req.body, (err, like) => {
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

module.exports = { put }
