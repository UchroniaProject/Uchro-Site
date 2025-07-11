let io;

module.exports = {
  init: (server) => {
    io = require('socket.io')(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    io.on('connection', (socket) => {
      console.log('Nouveau client connecté');
    });

    return io;
  },
  getIO: () => {
    if (!io) throw new Error("Socket.IO non initialisé");
    return io;
  }
};
