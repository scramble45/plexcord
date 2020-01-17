const {humanFileSize} = require('./helpers')
const config          = require('../config')
const plexLibraryId   = config.plex_library_id // determines location of movies or TV shows

module.exports = {
  movieList: (cmd, cb) => {
    let db = config.init_db()
    db.serialize(() => {
      let  movies = []
      db.each("SELECT id, title, year FROM metadata_items WHERE parent_id IS NULL AND library_section_id = ?"
      , plexLibraryId, (err, row) => {
        if (!err) movies.push(row)
        else return cb(err)
      }, () => {
        return cb(null, movies)
      })
    })
    db.close()
  },
  movieFileInfo: (id, cb) => {
    let db = config.init_db()
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
    db.close()
  }
}

