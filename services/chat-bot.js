const _      = require('lodash')
const config = require('../config')
const debug  = require('debug')('plexCord:chat-bot')
const path   = require('path')

// files
const libraryList     = require('../lib/queries').libraryList
const libraryFileInfo = require('../lib/queries').libraryFileInfo

// cmds
function help(prefix) {
  var helpDialog = 'Help Commands\n'
  helpDialog += '```\nPlexCord:\n'
  helpDialog += `   \nAll file transactions are logged...\n`
  helpDialog += `   ${prefix} list                List all files by id\n`
  helpDialog += `   ${prefix} search name here    Search by title name\n`
  helpDialog += `   ${prefix} description 00000   Description of file by id\n`
  helpDialog += `   ${prefix} request 00000       Request a file by id\n\n`
  helpDialog += '```'

  return helpDialog
}

function search(term, cb) {
  libraryList(null, (err, results) => {
    if (err) return err

    debug('search term:', term)

    let matches = []

    _.forEach(term, (t) => {
      let searchTerm = new RegExp(t, 'i')
      debug('running search for:', searchTerm)

      for (var i=0; i < results.length; i++) {
        if (results[i].title.match(searchTerm)) {
          matches.push(results[i])
        }
      }
    })

    // dedupe
    matches = _.uniqBy(matches, 'title')

    return cb(null, matches)
  })
}

function fileInfo(id, cb) {
  libraryFileInfo(id, (err, results) => {
    if (err) return cb(err)
    if (!results) return cb(null, null)
    debug(results)

    let filesArray = _.get(results, 'file.0', [])
    let title = _.get(results, 'title', 'Download')

    let filesToProcess = _.map([filesArray], (f) => {
      return {
        id: f.id,
        dirPath: path.dirname(f.file),
        fileName: f.filename,
        size: f.size,
        hash: f.hash
      }
    })

    let mappedFiles = _.map(filesToProcess, (f) => {
      debug('fileName requested:', f.dirPath, f.fileName)

      let fileName = _.get(f, 'fileName')
      let fileId   = _.get(f, 'id')
      if (!fileName || !fileId) {
        debug('Filename or id did not return')
        return
      }

      let encodedFilename = encodeURI(path.normalize(fileName))
      let curlCmd = '`' + `curl -o "${fileName}" --url http://${config.external_hostname}:${config.web_port}/files/${fileId}/${encodedFilename} -H "Authorization: Basic b64"` + '`'

      return {
        embed: {
          title: title,
          color: 15105570,
          fields: [
            {
              name: 'Year:',
              value: _.get(results, 'year', 'N/A') || 'N/A'
            },
            {
              name: 'Summary:',
              value: _.get(results, 'summary', 'N/A') || 'N/A'
            },
            {
              name: 'Size:',
              value: _.get(f, 'size', 'N/A') || 'N/A'
            },
            {
              name: 'Hash:',
              value: '`' + (_.get(f, 'hash', 'N/A') || 'N/A') + '`'
            },
            {
              name: 'Link:',
              value: `[Download](http://${config.external_hostname}:${config.web_port}/files/${fileId}/${fileName})`
            },
            {
              name: 'Curl:',
              value: curlCmd
            }
          ],
          timestamp: new Date()
        }
      }
    })

    return cb(null, mappedFiles)
  })
}
function description(id, cb) {
  libraryFileInfo(id, (err, results) => {
    if (err) return cb(err)
    if (!results) return cb(null, null)
    debug({results})

    let filesArray = _.get(results, 'file.0', [])
    let title = _.get(results, 'title', 'Download')

    let filesToProcess = _.map([filesArray], (f) => {
      return {
        id: f.id,
        dirPath: path.dirname(f.file),
        fileName: f.filename,
        size: f.size,
        hash: f.hash
      }
    })

    let mappedFiles = _.map(filesToProcess, (file) => {
      debug('fileName requested:', file.dirPath, file.fileName)

      let fileName = _.get(file, 'fileName')
      let fileId   = _.get(file, 'id')
      if (!fileName || !fileId) {
        debug('Filename or id did not return')
        return cb(null, null)
      }

      return {
        embed:{
          title: title,
          color: 15105570,
          fields: [
            {
              name: 'Year:',
              value: _.get(results, 'year', 'N/A') || 'N/A'
            },
            {
              name: 'Summary:',
              value: _.get(results, 'summary', 'N/A') || 'N/A'
            },
            {
              name: 'Size:',
              value: _.get(file, 'size', 'N/A') || 'N/A'
            },
            {
              name: 'Hash:',
              value: '`' + (_.get(file, 'hash', 'N/A') || 'N/A') + '`'
            }
          ],
          timestamp: new Date()
        }
      }
    })
    debug({mappedFiles})
    return cb(null, mappedFiles)
  })
}

module.exports = {
  help,
  libraryList,
  search,
  fileInfo,
  description
}
