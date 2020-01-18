const _            = require('lodash')
const apiAuth      = require("./middleware/auth")
const bodyParser   = require('body-parser')
const config       = require('./config')
const cookieParser = require('cookie-parser')
const debug        = require('debug')('plexCord')
const discord      = require('./services/discord')
const express      = require('express')
const helmet       = require("helmet")
const morgan       = require('morgan')
const path         = require('path')

// files
const libraryList     = require('./lib/queries').libraryList
const libraryFileInfo = require('./lib/queries').libraryFileInfo

// discord
if (!process.env.discord_token){
  console.error('Missing discord bot token in config.js file')
  process.exit(1)
}

if (!process.env.external_hostname){
  console.error('You will want to specify you external hostname/domain name in config.js')
  process.exit(1)
}

if (!process.env.auth_password){
  console.error('You need to specify a basic auth password in your config.js')
  process.exit(1)
}

if (!process.env.plexLibrary) {
  console.error('You need to set your plex database path in config.js')
  process.exit(1)
}

// express
var app = express()
const port = config.web_port

// time how long a request takes
app.use((req, res, next) => {
  req.start = Date.now()
  next()
})

// helmet
app.use(helmet.xssFilter())
app.use(helmet.frameguard("deny"))
app.use(helmet.hidePoweredBy())
app.use(helmet.ieNoOpen())
app.use(helmet.noSniff())
app.use(helmet.hsts({
  maxAge: 10886400000, // Must be at least 18 weeks to be approved by Google
  preload: true
}))

// morgan
app.enable("trust proxy")
app.use(morgan('short'))

// body parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// cookie parser
app.use(cookieParser())

// basic auth
app.use(apiAuth)

// listen
app.listen(port, () => debug(`PlexCord webserver listening on port: ${port}`))

// files by: id + filename
app.use('/files', require('./routes/files'))

app.get('/', function (req, res) {
  res.status(200).json({
    message: 'Listening and awaiting your commands...'
  })
})

// share config
app.use(function(req, res, next) {
  res.locals.config = config
  next()
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// development error handler will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500).json({
      message: `${err.message}`,
    })
  })
}

// production error handler no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    message: `${err.message}`,
  })
})
