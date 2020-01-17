const _            = require('lodash')
const apiAuth      = require("./middleware/auth")
const bodyParser   = require('body-parser')
const config       = require('./config')
const cookieParser = require('cookie-parser')
const debug        = require('debug')('plexCord')
const discord      = require('discord.js')
const express      = require('express')
const helmet       = require("helmet")
const morgan       = require('morgan')
const path         = require('path')

// files
const libraryList     = require('./lib/queries').libraryList
const libraryFileInfo = require('./lib/queries').libraryFileInfo
const fileQuery       = require('./lib/queries').fileQuery

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

const bot = new discord.Client()
bot.login(process.env.discord_token) // login

// bot ready
bot.on('ready', () => {
  debug(`PlexCord BOT is connected! - ${bot.user.tag}`)
})

bot.on('message', message => {
  // So the bot doesn't reply to iteself
  if (message.author.bot) return

  // Check if the message starts with the `~!` trigger
  let prefix = '~!'
  if (!message.content.startsWith(prefix)) return;

  // parse arguments
  let args = message.content.slice(prefix.length).trim().split(/ +/g)
  let cmd = args.shift().toLowerCase()
  debug('Command Passed:', cmd, args)

  if (message.content === '~!help'){
    message.channel.send(helpDialog)
  }

  if (message.content === '~!list'){
    libraryList(null, (err, results) => {
      if (err) return err
      let list = ""
      _.forEach(results, (i) => {
        list += `ID: ${i.id} - ${i.title} (${i.year})\n`
      })

      debug(list)

      message.channel.send(list, { code: 'text', split: true })      
    })
   
  }

  if (cmd === 'request') {
    let [id] = args
    if (!id) message.channel.send('You must provide an id.')
    libraryFileInfo(id, (err, results) => {
      if (err) return err
      if (!results) return message.channel.send(`Nothing found by that id: ${id}`)
      debug(results)
      
      let filesArray = _.get(results, 'file.0', [])
      let title = _.get(results, 'title', 'Download')

      let filesToProcess = _.map([filesArray], (f) => {
        return {
          id: f.id,
          dirPath: path.dirname(f.file),
          fileName: f.filename,
          size: f.size,
          hash: f.hash
        }
      })

      _.forEach(filesToProcess, (f) => {
        debug('fileName requested:', f.dirPath, f.fileName)
        
        message.author.send({
            "embed":{
              "title": title,
              "description": `Size: ${f.size}\nFile Hash: ${f.hash}`
            }
          }
        )

        let encodedFilename = encodeURI(path.normalize(f.fileName))
        message.author.send(`http://${config.external_hostname}:${config.web_port}/files/${f.id}/${f.fileName}`)
        message.author.send(`curl -o "${f.fileName}" --url http://${config.external_hostname}:${config.web_port}/files/${f.id}/${encodedFilename} -H "Authorization: Basic b64"`, { code: 'text', split: true })
      })
    })
  }

})

// cmds
var helpDialog = 'Help Commands\n'
  helpDialog += '```\nPlexCord:\n'
  helpDialog += `   \nAll file transactions are logged...\n`
  helpDialog += '   ~!list          List all files by id\n'
  // helpDialog += '   ~!description   Description of file by id\n'
  helpDialog += '   ~!request 00000 Request a file by id\n\n```'

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
app.get('/files/:id/:filename', function (req, res, next) {
  fileQuery(req, res, (err, results) => {
    if (err) debug(err)
    debug(results)
  })
})

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
