const _            = require('lodash')
const apiAuth      = require("./middleware/auth")
const bodyParser   = require('body-parser')
const config       = require('./config')
const cookieParser = require('cookie-parser')
const debug        = require('debug')('plexCord')

const express      = require('express')
const helmet       = require("helmet")
const morgan       = require('morgan')

const discord      = require('./services/discord')
const chatBot      = require('./services/chat-bot')

// express
let app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

console.info("starting with config\n", config)

if (!process.env.discord_token){
  console.warn('Missing discord bot token in config.js file')
}

if (!process.env.external_hostname){
  console.error('You will want to specify you external hostname/domain name in config.js')
  process.exit(1)
}

if (!process.env.auth_password){
  console.error('You need to specify a basic auth password in your config.js')
  process.exit(1)
}

if (!process.env.database) {
  console.error('You need to set your plex database path in config.js')
  process.exit(1)
}

if (process.env.discord_token) {
  discord(process.env.discord_token)
}

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

// files by: id + filename
app.use('/files', require('./routes/files'))

app.get('/', function (req, res) {
  res.status(200).json({
    message: 'Listening and awaiting your commands...'
  })
})

app.get('/chat', (req, res) => {
  res.render('index.ejs')

  io.sockets.on('connection', function(socket) {
    socket.on('username', function(username) {
      socket.username = username
      io.emit('is_online', '🔵 <i>' + socket.username + ' join the chat..</i>')
    })

    socket.on('disconnect', function(username) {
      io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>')
    })

    socket.on('chat_message', function(message) {
      io.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message)
      if (message.indexOf("~!help") !== -1) {
        io.emit('chat_message', '<strong>BOT</strong>: ' + chatBot.helpDialog)
      }
    })
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

const server = http.listen(config.web_port, function() {
  console.log('listening on *:', config.web_port);
});