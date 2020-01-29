module.exports = {
  humanFileSize: (bytes, si) => {
    let thresh = si ? 1000 : 1024
    if (Math.abs(bytes) < thresh) {
      return bytes + ' B'
    }
    let units = si
      ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
      : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB']
    let u = -1
    do {
      bytes /= thresh
      ++u
    } while (Math.abs(bytes) >= thresh && u < units.length - 1)
    return bytes.toFixed(1)+' '+units[u]
  },
  formatDuration: (time) => {
    if (typeof time !== 'undefined' && time !== '' && time > 0){
      var d = new Date(time) // time milisecondes
      return module.exports.addZero(d.getHours()-1) + 'h ' + module.exports.addZero(d.getMinutes()) + 'm ' + module.exports.addZero(d.getSeconds()) + 's '
    } else {
      return ''
    }
  },
  addZero: (v) => {
    return v.toString().replace(/^(\d)$/,'0$1')
  }
}
