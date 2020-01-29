const config          = require('../config')
const debug           = require('debug')('plexCord:chat-bot')
const plexLibraryId   = config.libraries
const sqlite3         = require('sqlite3').verbose()
const _               = require('lodash')
const async           = require('async')

const {
  humanFileSize,
  formatDuration,
  addZero
} = require('./helpers')

// if test env then use sample db
if (config.test) {
  debug('PlexCord has started in test mode, defaulting to sample.db')
  config.plexdb = './test/sample.db'
}

let db = new sqlite3.Database(config.plexdb, sqlite3.OPEN_READONLY, (err) => {
  if (!err) return console.info('connected to db')
  console.error(err)
  process.exit(1)
})

process.on('SIGINT', function onSigterm () {
  if (db) {
    console.log('shutting db conn down')
    return db.close()
  }
})

module.exports = {
  libraryList: (cmd, cb) => {
    let query = 'SELECT id, title, year FROM metadata_items WHERE parent_id IS NULL AND library_section_id = ? ORDER BY year ASC'
    db.serialize(() => {
      async.parallel({
        movies: function(next) {
          let movies = []
          let libraryMovies = _.get(plexLibraryId, 'movies')
          if (!libraryMovies) return next(null, movies)
          db.each(query, libraryMovies, (err, row) => {
            if (!err) movies.push(row)
            else return next(err)
          }, () => {
            next(null, movies)
          })
        },
        tv: function(next) {
          let tv = []
          let libraryTV = _.get(plexLibraryId, 'tv')
          if (!libraryTV) return next(null, tv)
          db.each(query, libraryTV, (err, row) => {
            if (!err) tv.push(row)
            else return next(err)
          }, () => {
            next(null, tv)
          })
        }
      }, function(err, results) {
        if (err) console.error(err)
        debug(results)
        return cb(null, results)
      })
    })
  },
  libraryFileInfo: (id, cb) => {
    db.get('SELECT id, title, original_title, studio, rating, summary, duration, tags_genre, tags_star, year FROM metadata_items WHERE id = ?', id, function(err, row) {
      if (!row) return cb(null, null)
      // eslint-disable-next-line camelcase
      row.tags_genre = row.tags_genre.split('|')
      // eslint-disable-next-line camelcase
      row.tags_star = row.tags_star.split('|')
      row.rating = Math.round(row.rating, 2)
      row.file = []

      db.each('SELECT id, file, size, hash, duration FROM media_parts where media_item_id IN (SELECT id FROM media_items WHERE metadata_item_id = ? )', id, function(error, line) {
        let tab = line.file.split('/')
        let tab2 = tab[tab.length -1].split('\\')
        let filename = tab2[tab2.length -1]
        line.filename = filename

        line.size = humanFileSize(line.size, true)

        row.file.push(line)
      }, () => {
        return cb(null, row)
      })
    })
  },
  fileQuery: (req, res, cb) => {
    db.get('SELECT file FROM media_parts WHERE id = ?', req.params.id, function(err, row) {
      let options = {
        dotfiles: 'deny',
        headers: {
          'x-timestamp': Date.now(),
          'x-sent': true
        }
      }
      let fileName = row.file
      res.sendFile(fileName , options, function (err) {
        if (err) {
          res.status(err.status).end()
          cb(err)
        } else {
          cb(null, `Sent file:, ${fileName}`)
        }
      })
    })
  },
  tvSeries: (id, cb) => {
    let data = []

    db.serialize(() => {
      db.each('SELECT episode.id as id, episode.title as title, episode.[index] as episode, episode.duration as second, season.[index] as season, show.title as series ' +
      'FROM metadata_items episode,metadata_items season,metadata_items show ' +
      'WHERE episode.parent_id=season.id AND season.parent_id = show.id AND show.id = ? ', id, function (err, row) {
        let episode = _.get(row, 'episode')
        let season = _.get(row, 'season')

        if (episode && season) {
          row.seasonEpisode = 'S' + addZero(season) + 'E' + addZero(episode)
        }

        row.duration = formatDuration(row.second)

        data.push(row)
      },
      function () {
        cb(null, data)
      })
    })
  }
}
