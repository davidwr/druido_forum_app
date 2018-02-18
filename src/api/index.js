var express = require('express')
var async = require('async')
var cookieParser = require('cookie-parser')
var cors = require('cors')
var bodyParser = require('body-parser')
var session = require('express-session')
var expressLogger = require('morgan')
var MemoryStore = require('session-memory-store')(session)
var http = require('http')
var https = require('https')
var fs = require('fs')

var apiLayers = require('./api_layers')

var app = express()

var sessionDuration = 1000 * 60 * 60 * 24 * 30 // 30 dias
var sessionOptions = {
  secret: CONFIG.session_secret,
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: sessionDuration},
  store: new MemoryStore({
    expires: sessionDuration
  })
}

app.use(expressLogger('dev'))
app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use(session(sessionOptions))
app.use(cookieParser())

if (process.env.NODE_ENV === 'production') {
  var compression = require('compression')
  var shortid = require('shortid')

  shortid.worker(666)

  app.use(compression())
}

app.use(apiLayers.serviceUnavailable)
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(cors({
  origin: true,
  credentials: true
}))
app.use('/api/v1', require('./routes'))
app.use(apiLayers.unexpectedError)
app.use(apiLayers.routeNotFound)

module.exports = (callback) => {
  async.series([
    (cb) => {
      if (!CONFIG.https.active) return cb()
      var credentials = {
        pfx: fs.readFileSync(CONFIG.https.pfx)
      }
      https.createServer(credentials, app).listen(CONFIG.https.port, cb)
    },
    (cb) => {
      if (CONFIG.https.active) {
        http.createServer((req, res) => {
          res.writeHead(301, {'Local': 'https://' + req.headers.host + req.url})
          res.end()
        }).listen(CONFIG.api.port, cb)
      } else {
        http.createServer(app).listen(CONFIG.api.port, cb)
      }
    }
  ], callback)
}
