let users = {};
const prisma = require("../../DB/db.config");

const socket = (io) => {
  io.use(async (socket, next) => {
    const userId = Number(socket.handshake.query.userId);

    if (!userId || userId === 0) {
      return;
    } else {
      // Join personal room
      socket.join(userId);

      if (!users[userId]) {
        users[userId] = [];
      }
      users[userId].push(socket.id);
      console.log(`socket id ${socket.id} joined in room ${userId}`);
      next();
    }
  });

  io.on("connection", async (socket) => {
    socket.on("updateStatus", async ({ order_id }) => {
      const order = await prisma.order_summary_view.findUnique({
        where: {
          order_id: Number(order_id),
        },
      });

      if (order) {
        io.to(Number(order.customer_id)).emit("updateStatus", order);
        io.to(Number(order.vendor_id)).emit("updateStatus", order);
        if (order.delivery_man_id) {
          io.to(Number(order.delivery_man_id)).emit("updateStatus", order);
        }
        console.log("emitted");
      }
    });

    socket.on("addOrder", async ({ order_id }) => {
      setTimeout(async () => {
        const order = await prisma.order_summary_view.findUnique({
          where: { order_id: Number(order_id) },
        });

        if (order) {
          io.to(Number(order.vendor_id)).emit("addOrder", order);
        }
      }, 500); // 300–500ms max
    });

    socket.on("acceptDeliveryRequest", async ({ order_id }) => {
      setTimeout(async () => {
        const order = await prisma.order_summary_view.findUnique({
          where: { order_id: Number(order_id) },
        });

        if (order) {
          io.to(Number(order.vendor_id)).emit("updateStatus", order);
          io.to(Number(order.vendor_id)).emit("acceptDeliveryRequest", order);
          io.to(Number(order.delivery_man_id)).emit("addToDashboard", order);
        }
      }, 500); // 300–500ms max
    });

    socket.on("deliveryRequest", ({ delivery_man_id, order }) => {
      io.to(Number(delivery_man_id)).emit("deliveryRequest", order);
    });
  });
};
module.exports = socket;
