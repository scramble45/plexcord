const {humanFileSize} = require('./helpers')
const config          = require('../config')
const plexLibraryId   = config.plex_library_id // determines location of movies or TV shows
const sqlite3 = require('sqlite3').verbose()

let db = new sqlite3.Database(config.database, sqlite3.OPEN_READONLY, (err) => {
  if (!err) return console.info("connected to db")
  console.error(err)
  process.exit(1)
})

process.on('SIGINT', function onSigterm () {
  if(db) {
    console.log("shutting db conn down")
    return db.close()
  }
})


module.exports = {
  libraryList: (cmd, cb) => {
    let  items = []
    let query = "SELECT id, title, year FROM metadata_items WHERE parent_id IS NULL AND library_section_id = ? ORDER BY year ASC"
    db.serialize(() => {
      db.each(query, plexLibraryId, (err, row) => {
        if (!err) items.push(row)
        else return cb(err)
      }, () => {
        return cb(null, items)
      })
    })
  },
  libraryFileInfo: (id, cb) => {
    db.get("SELECT id, title, original_title, studio, rating, summary, duration, tags_genre, tags_star, year FROM metadata_items WHERE id = ?", id, function(err, row) {
      row.tags_genre = row.tags_genre.split('|')
      row.tags_star = row.tags_star.split('|')
      row.rating = Math.round(row.rating, 2)
      row.file = []

      db.each("SELECT id, file, size, hash, duration FROM media_parts where media_item_id IN (SELECT id FROM media_items WHERE metadata_item_id = ? )", id, function(error, line) {
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
    db.get("SELECT file FROM media_parts WHERE id = ?", req.params.id, function(err, row) {
      var options = {
        dotfiles: 'deny',
        headers: {
          'x-timestamp': Date.now(),
          'x-sent': true
        }
      };
      var fileName = row.file
      res.sendFile(fileName , options, function (err) {
        if (err) {
          res.status(err.status).end()
          cb(err)
        }
        else {
          cb(null, `Sent file:, ${fileName}`)
        }
      })
    })
  }
}
