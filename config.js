process.env.database = process.env.database || "/Volumes/docker/plex/config/Library/Application Support/Plex Media Server/Plug-in Support/Databases/com.plexapp.plugins.library.db"
process.env.web_port = process.env.web_port || 2599
process.env.auth_password = process.env.auth_password || "password"
process.env.external_hostname = process.env.external_hostname || "127.0.0.1"

module.exports = {
  discord_token: process.env.discord_token,
  auth_password: process.env.auth_password,
  database: process.env.database,
  external_hostname: process.env.external_hostname,
  plex_library_id: 1,
  web_port: process.env.web_port,
  init_db: function(){
    var sqlite3 = require('sqlite3').verbose()
    var db = new sqlite3.Database(this.database)
    return db
  }
}
