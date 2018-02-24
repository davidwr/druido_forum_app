const relevanceService = require('../services/relevance')

const put = (req, res, next) => {
  relevanceService.upsert(req.body, (err, relevance) => {
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

module.exports = { put }
