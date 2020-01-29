const _       = require('lodash')
const chatBot = require('./chat-bot')
const config  = require('../config')
const debug   = require('debug')('plexCord')
const discord = require('discord.js')

if (!config.discord_token){
  console.error('Missing discord bot token in config.js file')
  process.exit(1)
}

const cmdPrefix = config.discord_cmdPrefix || '~!'

const formatList = (type, results) => {
  let list = ''
  if (type) {
    list = `${type}:\n--------------------\n`
  }
  _.forEach(results, (i) => {
    list += `ID: ${i.id} - ${i.title} (${i.year})\n`
  })
  debug(list)
  return list
}

const formatTVList = (results) => {
  let list = ''
  _.forEach(results, (i) => {
    list += `ID: ${i.id} ${i.series} - (${i.seasonEpisode}) - ${i.title}\n`
  })
  debug(list)
  return list
}

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

    // Check if the message starts with the prefix trigger
    if (!message.content.startsWith(cmdPrefix)) return

    // parse arguments
    let args = message.content.slice(cmdPrefix.length).trim().split(/ +/g)
    let cmd = args.shift().toLowerCase()
    debug('Command Passed:', cmd, args)

    if (cmd === 'help'){
      message.channel.send(chatBot.help(cmdPrefix))
    }

    if (cmd === 'list' | cmd === 'ls'){
      chatBot.libraryList(null, (err, results) => {
        console.log('testing our results:', results)
        if (err) return err

        let moviesArray = _.get(results, 'movies', [])
        let tvArray = _.get(results, 'tv', [])

        let moviesList = formatList('Movies', moviesArray)
        let tvList = formatList('TV Shows', tvArray)

        let libraryList = `${moviesList}\n${tvList}`
        if (!libraryList) return message.channel.send('No results found.')
        message.channel.send(libraryList, { code: 'text', split: true })
      })

    }

    if (cmd === 'search'){
      if (!args) message.channel.send('You must provide a search term.')
      if (!_.isArray(args)) args = [args]
      let term = args

      chatBot.search(term, (err, results) => {
        if (err) return err

        // todo fix this for both tv and movies
        if (!results.length > 0) {
          message.channel.send('No search results found.')
          return
        }

        let list = formatList(null, results)
        message.channel.send(list, { code: 'text', split: true })
      })

    }

    if (cmd === 'request') {
      let [id] = args
      if (!id) message.channel.send('You must provide an id.')

      chatBot.fileInfo(id, (err, files) => {
        if (err) return err
        if (!files) return message.channel.send(`Nothing found by that id: ${id}`)
        debug(files)

        _.forEach(files, (file) => message.author.send(file))
      })
    }

    if (cmd === 'description') {
      let [id] = args
      if (!id) message.channel.send('You must provide an id.')
      chatBot.description(id, (err, files) => {
        if (err) return err
        if (!files) return message.channel.send(`Nothing found by that id or filename did not return: ${id}`)
        debug('discord files %O', {files})

        _.forEach(files, (file) => message.author.send(file))
      })
    }

    if (cmd === 'tv') {
      let [id] = args
      if (!id) message.channel.send('You must provide an id.')
      chatBot.tv(id, (err, episodes) => {
        if (err) return err
        if (!episodes) return message.channel.send(`Nothing found by that id: ${id}`)
        debug('discord tv episodes %O', {episodes})

        let list = formatTVList(episodes)
        message.channel.send(list, { code: 'text', split: true })
      })
    }

  })

  return bot
}
