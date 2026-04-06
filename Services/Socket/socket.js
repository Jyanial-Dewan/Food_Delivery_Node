const { Redis } = require("ioredis");
const prisma = require("../../DB/db.config");
const { VALKEY_HOST } = require("../../Variables/variables");

const pub = new Redis(VALKEY_HOST);
const sub = new Redis(VALKEY_HOST);

const SOCKET_TTL = 30; // seconds

const socket = (io) => {
  // ==============================
  // 🔔 PUB/SUB CHANNELS
  // ==============================
  sub.subscribe("UPDATE_STATUS");
  sub.subscribe("ADD_ORDER");
  sub.subscribe("ACCEPT_DELIVERY_REQUEST");

  sub.on("message", async (channel, message) => {
    const resMessage = JSON.parse(message);

    const order = await prisma.order_summary_view.findUnique({
      where: { order_id: Number(resMessage.order_id) },
    });

    if (!order) return;

    if (channel === "UPDATE_STATUS") {
      io.to(Number(order.customer_id)).emit("updateStatus", order);
      io.to(Number(order.vendor_id)).emit("updateStatus", order);
      if (order.delivery_man_id)
        io.to(Number(order.delivery_man_id)).emit("updateStatus", order);
    }

    if (channel === "ADD_ORDER") {
      setTimeout(
        () => io.to(Number(order.vendor_id)).emit("addOrder", order),
        300,
      );
    }

    if (channel === "ACCEPT_DELIVERY_REQUEST") {
      setTimeout(() => {
        io.to(Number(order.vendor_id)).emit("updateStatus", order);
        io.to(Number(order.vendor_id)).emit("acceptDeliveryRequest", order);
        io.to(Number(order.delivery_man_id)).emit("addToDashboard", order);
      }, 300);
    }
  });

  // ==============================
  // 📊 ADMIN NAMESPACE
  // ==============================
  const adminNamespace = io.of("/admin");

  adminNamespace.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token !== "admin-secret") return next(new Error("Unauthorized"));
    next();
  });

  // ==============================
  // 🧠 HELPERS
  // ==============================
  async function getActiveUsers() {
    const userIds = await pub.smembers("online_users");

    const users = await Promise.all(
      userIds.map(async (id) => {
        const sessions = await pub.scard(`user:${id}:sockets`);
        return { userId: Number(id), sessions };
      }),
    );

    return { totalActiveUsers: users.length, users };
  }

  async function emitActiveUsers() {
    const data = await getActiveUsers();
    adminNamespace.emit("activeUsers", data);
  }

  // ==============================
  // 🔌 CONNECTION HANDLER
  // ==============================
  io.use(async (socket, next) => {
    const userId = Number(socket.handshake.query.userId);
    if (!userId || userId === 0) return next(new Error("Invalid userId"));

    socket.userId = userId;

    // Track individual socket with TTL
    await pub.set(`socket:${socket.id}`, userId, "EX", SOCKET_TTL);

    // Add to user socket set & online_users
    await pub.sadd(`user:${userId}:sockets`, socket.id);
    await pub.sadd("online_users", userId);

    // Emit active users to admin
    await emitActiveUsers();

    console.log(`🟢 socket ${socket.id} joined user ${userId}`);
    next();
  });

  io.on("connection", (socket) => {
    // ==========================
    // 💓 HEARTBEAT
    // ==========================
    socket.on("heartbeat", async () => {
      if (!socket.userId) return;
      // refresh TTL
      await pub.expire(`socket:${socket.id}`, SOCKET_TTL);
      console.log(`💓 heartbeat from user ${socket.userId}`);
    });

    // ==========================
    // 📦 ORDER EVENTS
    // ==========================
    socket.on("updateStatus", async ({ order_id }) => {
      if (order_id)
        await pub.publish("UPDATE_STATUS", JSON.stringify({ order_id }));
    });

    socket.on("addOrder", async ({ order_id }) => {
      if (order_id)
        await pub.publish("ADD_ORDER", JSON.stringify({ order_id }));
    });

    socket.on("acceptDeliveryRequest", async ({ order_id }) => {
      if (order_id)
        await pub.publish(
          "ACCEPT_DELIVERY_REQUEST",
          JSON.stringify({ order_id }),
        );
    });

    socket.on("deliveryRequest", ({ delivery_man_id, order }) => {
      io.to(Number(delivery_man_id)).emit("deliveryRequest", order);
    });

    // ==========================
    // ❌ DISCONNECT
    // ==========================
    socket.on("disconnect", async () => {
      const userId = socket.userId;
      if (!userId) return;

      // Remove this socket
      await pub.srem(`user:${userId}:sockets`, socket.id);
      await pub.del(`socket:${socket.id}`);

      const remaining = await pub.scard(`user:${userId}:sockets`);
      if (remaining === 0) {
        await pub.srem("online_users", userId);
        console.log(`🔴 User ${userId} offline`);
      } else {
        console.log(`🟡 User ${userId} still has ${remaining} sessions`);
      }

      await emitActiveUsers();
    });
  });

  // ==============================
  // 👨‍💼 ADMIN CONNECTION LOG
  // ==============================
  adminNamespace.on("connection", async (socket) => {
    console.log("👨‍💼 Admin connected");
    const data = await getActiveUsers();
    socket.emit("activeUsers", data);
  });

  // ==============================
  // 🧹 PERIODIC CLEANUP
  // ==============================
  async function cleanupDeadSockets() {
    const userIds = await pub.smembers("online_users");
    for (const userId of userIds) {
      const sockets = await pub.smembers(`user:${userId}:sockets`);
      for (const socketId of sockets) {
        const exists = await pub.exists(`socket:${socketId}`);
        if (!exists) await pub.srem(`user:${userId}:sockets`, socketId);
      }
      const remaining = await pub.scard(`user:${userId}:sockets`);
      if (remaining === 0) await pub.srem("online_users", userId);
    }
    await emitActiveUsers();
  }

  setInterval(cleanupDeadSockets, SOCKET_TTL * 1000);
};

module.exports = socket;
