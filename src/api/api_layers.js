var toobusy = require('toobusy-js')

module.exports.serviceUnavailable = (req, res, next) => {
  if (!toobusy()) return next()
  log.error('503 Service Unavailable.')
  res.status(503).send('Service Unavailable.')
}

module.exports.unexpectedError = (err, req, res, next) => {
  log.error(err)
  if (err.statusCode && err.message) {
    return res.status(err.statusCode).send(err.message)
  }

  res.status(500).send(err.message)
}

module.exports.routeNotFound = (req, res, next) => {
  log.error('404 Not Found.')
  res.status(404).send('Not Found.')
}
