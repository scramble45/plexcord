const libraryList     = require('../lib/queries').libraryList
const _ = require('lodash')
// cmds
let helpDialog = 'Help Commands\n'
  helpDialog += '```\nPlexCord:\n'
  helpDialog += `   \nAll file transactions are logged...\n`
  helpDialog += '   ~!list                List all files by id\n'
  helpDialog += '   ~!search name here    Search by title name\n'
  helpDialog += '   ~!description 00000   Description of file by id\n'
  helpDialog += '   ~!request 00000       Request a file by id\n\n```'


function list(cb){
  return libraryList(null, (err, results) => {
    if (err) return cb(err)
    let list = ""
    _.each(results, (i) => {
      list += `ID: ${i.id} - ${i.title} (${i.year})\n`
    })

    console.debug(list)

    return cb(null, list)
  })
}

module.exports = {
  helpDialog,
  list,
}