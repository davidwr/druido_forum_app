const connectionFactory = require('../db/connection_factory')

module.exports = (req, res, next) => {
  if (!req.session.username && !req.headers['token']) {
    return res.status(401).send('Unauthorized.')
  }

  var sql = ''
  if (req.session.username) {
    sql = QueryBuilder('dd_user') // eslint-disable-line
      .where('username', req.session.username)
      .select('id')
      .toString()
  }

  if (req.headers['token']) {
    sql = QueryBuilder('dd_user') // eslint-disable-line
      .where('hash', req.headers['token'])
      .select('id')
      .toString()
  }

  connectionFactory.executeSql(sql, (err, result) => {
    if (err) return next(err)
    if (!result.rows[0]) return res.status(403).send('Forbidden.')

    req.body.dd_user = result.rows[0].id
    return next()
  })
}
