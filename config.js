module.exports = {
  discord_token: process.env.discord_token,
  auth_password: process.env.auth_password,
  database: process.env.plexLibrary,
  external_hostname: process.env.external_hostname,
  plex_library_id: 1,
  web_port: 2599,
  init_db: function(){
    var sqlite3 = require('sqlite3').verbose()
    var db = new sqlite3.Database(this.database)
    return db
  }
}
