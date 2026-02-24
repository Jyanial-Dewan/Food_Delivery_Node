const socket = (io) => {
  io.use(async (socket, next) => {
    const userId = Number(socket.handshake.query.userId);

    if (!userId || userId === 0) {
      return;
    } else {
      // Join personal room
      socket.join(`user_${userId}`);
      console.log(`socket id ${socket.id} joined in room -user_${userId}-`);
      next();
    }
  });
};
module.exports = socket;
