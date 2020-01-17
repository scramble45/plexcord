const debug     = require('debug')('plexCord')
const express   = require('express')
const fileQuery = require('../lib/queries').fileQuery
const router    = express.Router()

// files by: id + filename
router.get('/:id/:filename', function (req, res, next) {
  fileQuery(req, res, (err, results) => {
    if (err) debug(err)
    debug(results)
  })
})

module.exports = router
