/* eslint-disable camelcase */
module.exports = {
  discord_token: process.env.discord_token,
  discord_cmdPrefix: process.env.discord_cmdPrefix,
  auth_password: process.env.auth_password,
  database: process.env.plexLibrary,
  external_hostname: process.env.external_hostname,
  plex_library_id: 1,
  web_port: 2599,
  test: process.env.plexCord_test || false
}
