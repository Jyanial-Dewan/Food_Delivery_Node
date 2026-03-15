const { Redis } = require("ioredis");

let users = {};
const prisma = require("../../DB/db.config");
const { VALKEY_HOST } = require("../../Variables/variables");

const pub = new Redis(VALKEY_HOST);
const sub = new Redis(VALKEY_HOST);

const socket = (io) => {
  // Subscribe to UPDATE_STATUS Channel
  sub.subscribe("UPDATE_STATUS");
  sub.subscribe("ADD_ORDER");
  sub.subscribe("ACCEPT_DELIVERY_REQUEST");
  sub.on("message", async (channel, message) => {
    const resMessage = JSON.parse(message);

    const order = await prisma.order_summary_view.findUnique({
      where: {
        order_id: Number(resMessage.order_id),
      },
    });
    if (channel === "UPDATE_STATUS") {
      if (order) {
        io.to(Number(order.customer_id)).emit("updateStatus", order);
        io.to(Number(order.vendor_id)).emit("updateStatus", order);
        if (order.delivery_man_id) {
          io.to(Number(order.delivery_man_id)).emit("updateStatus", order);
        }
      }
    } else if (channel === "ADD_ORDER") {
      setTimeout(async () => {
        if (order) {
          io.to(Number(order.vendor_id)).emit("addOrder", order);
        }
      }, 500); // 300–500ms max
    } else if (channel === "ACCEPT_DELIVERY_REQUEST") {
      setTimeout(async () => {
        if (order) {
          io.to(Number(order.vendor_id)).emit("updateStatus", order);
          io.to(Number(order.vendor_id)).emit("acceptDeliveryRequest", order);
          io.to(Number(order.delivery_man_id)).emit("addToDashboard", order);
        }
      }, 500); // 300–500ms max
    }
  });

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
      if (order_id) {
        await pub.publish("UPDATE_STATUS", JSON.stringify({ order_id }));
      }
    });

    socket.on("addOrder", async ({ order_id }) => {
      if (order_id) {
        await pub.publish("ADD_ORDER", JSON.stringify({ order_id }));
      }
    });

    socket.on("acceptDeliveryRequest", async ({ order_id }) => {
      if (order_id) {
        await pub.publish(
          "ACCEPT_DELIVERY_REQUEST",
          JSON.stringify({ order_id }),
        );
      }
    });

    socket.on("deliveryRequest", ({ delivery_man_id, order }) => {
      io.to(Number(delivery_man_id)).emit("deliveryRequest", order);
    });
  });
};
module.exports = socket;
