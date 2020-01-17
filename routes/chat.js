
const debug     = require('debug')('plexCord')
const express   = require('express')
const fileQuery = require('../lib/queries').fileQuery
const chatBot      = require('../services/chat-bot')
const router    = express.Router()

router.get('/', (req, res) => {
  res.render('index.ejs')
})

module.exports = router
