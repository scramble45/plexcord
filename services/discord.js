const discord      = require('discord.js')
const path         = require('path')
const _            = require('lodash')
const config       = require('../config')
const debug        = require('debug')('plexCord')

// files
const libraryList     = require('../lib/queries').libraryList
const libraryFileInfo = require('../lib/queries').libraryFileInfo

// cmds
var helpDialog = 'Help Commands\n'
  helpDialog += '```\nPlexCord:\n'
  helpDialog += `   \nAll file transactions are logged...\n`
  helpDialog += '   ~!list                List all files by id\n'
  helpDialog += '   ~!search name here    Search by title name\n'
  helpDialog += '   ~!description 00000   Description of file by id\n'
  helpDialog += '   ~!request 00000       Request a file by id\n\n```'

const bot = new discord.Client()
module.exports = (token) => {
  bot.login(token) // login

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

    if (cmd === 'search'){
      if (!args) message.channel.send('You must provide a search term.')
      if (!_.isArray(args)) args = [args]
      let term = args


      libraryList(null, (err, results) => {
        if (err) return err

        debug('search term:', term)

        let matches = []

        _.forEach(term, (t) => {
          let searchTerm = new RegExp(t, 'i')
          debug('running search for:', searchTerm)


          for (var i=0; i < results.length; i++) {
            if (results[i].title.match(searchTerm)) {
              matches.push(results[i])
            }
          }
        })

        // dedupe
        matches = _.uniqBy(matches, 'title')

        if (!matches.length > 0) {
          message.channel.send('No search results found.')
          return
        }

        let list = ""
        _.forEach(matches, (i) => {
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

          let fileName = _.get(f, 'fileName')
          let fileId   = _.get(f, 'id')
          if (!fileName || !fileId) {
            debug('Filename or id did not return')
            return
          }

          let encodedFilename = encodeURI(path.normalize(fileName))
          let curlCmd = "`" + `curl -o "${fileName}" --url http://${config.external_hostname}:${config.web_port}/files/${fileId}/${encodedFilename} -H "Authorization: Basic b64"` + "`"

          message.author.send({
              embed: {
                title: title,
                color: 15105570,
                fields: [{
                    name: "Year:",
                    value: _.get(results, 'year', 'N/A') || 'N/A'
                  },
                  {
                    name: "Summary:",
                    value: _.get(results, 'summary', 'N/A') || 'N/A'
                  },
                  {
                    name: "Size:",
                    value: _.get(f, 'size', 'N/A') || 'N/A'
                  },
                  {
                    name: "Hash:",
                    value: "`" + (_.get(f, 'hash', 'N/A') || 'N/A') + "`"
                  },
                  {
                    name: "Link:",
                    value: `[Download](http://${config.external_hostname}:${config.web_port}/files/${fileId}/${fileName})`
                  },
                  {
                    name: "Curl:",
                    value: curlCmd
                  }
                ],
                timestamp: new Date()
              }
            }
          )
        })
      })
    }

    if (cmd === 'description') {
      let [id] = args
      if (!id) message.channel.send('You must provide an id.')
      libraryFileInfo(id, (err, results) => {
        if (err) return err
        if (!results) return message.channel.send(`Nothing found by that id: ${id}`)
        debug(results)

        let filesArray = _.get(results, 'file.0', [])
        let title = _.get(results, 'title', 'Download')

        let filesToProcess = _.map([filesArray], (f) => {
          console.log('testing f:', f)
          return {
            id: f.id,
            dirPath: path.dirname(f.file),
            fileName: f.filename,
            size: f.size,
            hash: f.hash
          }
        })

        _.forEach(filesToProcess, (file) => {
          console.log('FILE TEST:', JSON.stringify(file, null, 2))
          debug('fileName requested:', file.dirPath, file.fileName)

          let fileName = _.get(file, 'fileName')
          let fileId   = _.get(file, 'id')
          if (!fileName || !fileId) {
            debug('Filename or id did not return')
            message.author.send('There was a problem with the requested file id')
            return
          }

          message.author.send({
              "embed":{
                title: title,
                color: 15105570,
                fields: [{
                    name: "Year:",
                    value: _.get(results, 'year', 'N/A') || 'N/A'
                  },
                  {
                    name: "Summary:",
                    value: _.get(results, 'summary', 'N/A') || 'N/A'
                  },
                  {
                    name: "Size:",
                    value: _.get(file, 'size', 'N/A') || 'N/A'
                  },
                  {
                    name: "Hash:",
                    value: "`" + (_.get(file, 'hash', 'N/A') || 'N/A') + "`"
                  }
                ],
                timestamp: new Date()
              }
            }
          )
        })
      })
    }
  })

  return bot
}
