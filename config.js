/* eslint-disable camelcase */

if (!process.env.external_hostname){
  console.error('You will want to specify you external hostname/domain name in config.js')
  process.exit(1)
}

if (!process.env.auth_password){
  console.error('You need to specify a basic auth password in your config.js')
  process.exit(1)
}

if (!process.env.plexdb) {
  console.error('You need to set your plex database path in config.js')
  process.exit(1)
}

module.exports = {
  discord_token: process.env.discord_token,
  discord_cmdPrefix: process.env.discord_cmdPrefix,
  auth_password: process.env.auth_password,
  plexdb: process.env.plexdb,
  external_hostname: process.env.external_hostname,
  libraries: {
    'movies': 1,
    'tv': 2
  },
  web_port: 2599,
  test: process.env.plexCord_test || false
}
