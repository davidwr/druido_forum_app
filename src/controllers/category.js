const categoryService = require('../services/category')

const get = (req, res, next) => {
  categoryService.find(req.params.id, (err, user) => {
    if (err) return next(err)
    res.status(200).send(user)
  })
}

const getAll = (req, res, next) => {
  categoryService.find(null, (err, user) => {
    if (err) return next(err)
    res.status(200).send(user)
  })
}

module.exports = { get, getAll }
