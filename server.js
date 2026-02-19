const express = require("express");
const http = require("http");
// const socketIo = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const multer = require("multer");

require("dotenv").config();
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// const io = socketIo(server, {
//   path: "/socket.io/",
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });
const options = {
  origin: JSON.parse(process.env.ALLOWED_ORIGINS),
  credentials: true,
};

app.use(cookieParser());
app.use(express.json());
app.use(cors(options));

app.use(require("./Routes/index"));
app.use("/health", (req, res) => {
  res.send("ok");
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
  next();
});

// Import and initialize socket.io handlers
// require("./Services/socket")(io);

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
