
const chatBot      = require('./chat-bot')

module.exports = (http) => {
  const io = require('socket.io')(http)
  io.sockets.on('connection', function(socket) {
    socket.on('username', function(username) {
      socket.username = username
      console.info("is_online", username)
      io.emit('is_online', '<i>' + socket.username + ' join the chat..</i>')
    })

    socket.on('disconnect', function(username) {
      console.info("is_offline", username)
      io.emit('is_online', '<i>' + socket.username + ' left the chat..</i>')
    })

    socket.on('chat_message', function(message) {
      console.info("message", message)
      io.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message)

      switch (message) {
        case "~!help":
          io.emit('chat_message', '<strong>BOT</strong>: ' + chatBot.helpDialog)
          break
        case "~!list":
          chatBot.list((err, list) => {
            if (err) return console.error(err)
            io.emit('chat_message', '<strong>BOT</strong>' + list)
          })
      }
    })
  })

  return io
}