const userService = require('../services/user')

const post = (req, res, next) => {
  userService.create(req.body, req.file, (err, user) => {
    if (err) return next(err)
    res.status(202).send(user)
  })
}

const put = (req, res, next) => {
  userService.update(req.params.id, req.body, req.file, (err, user) => {
    if (err) return next(err)

    if (!user) {
      return next({
        message: 'Not found',
        statusCode: 404
      })
    }

    res.status(200).send(user)
  })
}

const get = (req, res, next) => {
  userService.find(req.params.id, req.query.image, (err, user) => {
    if (err) return next(err)
    res.status(200).send(user)
  })
}

module.exports = { post, put, get }
