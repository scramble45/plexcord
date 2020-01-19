const basicAuth = require('basic-auth')
const config = require('../config')

let basicAuthLogins = {
  admin: process.env.plexCordPassword || config.auth_password
}

function basicAuthCheck(username, password) {
  return basicAuthLogins[username] && basicAuthLogins[username] === password
}

function apiAuth(req, res, next) {
  let credentials = basicAuth(req)

  if (!credentials || !basicAuthCheck(credentials.name, credentials.pass)) {
    res.set({'WWW-Authenticate': 'Basic realm="simple-admin"'})
    return res.status(401).send()
  }

  req.credentials = {
    username: credentials.name,
    password: credentials.pass
  }
  return next()
}

module.exports = apiAuth
