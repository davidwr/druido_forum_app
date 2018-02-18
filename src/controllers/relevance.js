const relevanceService = require('../services/relevance')

const post = (req, res, next) => {
  relevanceService.create(req.body, (err, relevance) => {
    if (err) return next(err)
    res.status(202).send(relevance)
  })
}

const put = (req, res, next) => {
  relevanceService.update(req.params.id, req.body, (err, relevance) => {
    if (err) return next(err)

    if (!relevance) {
      return next({
        message: 'Not found',
        statusCode: 404
      })
    }

    res.status(200).send(relevance)
  })
}

module.exports = { post, put }
