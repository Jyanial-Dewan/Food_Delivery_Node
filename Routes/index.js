const Router = require("express");
const usersRoute = require("./usersRoutes");
const authRoute = require("./authRoutes");

const routes = Router();

routes.use("/api/users", usersRoute);
routes.use("/api/auth", authRoute);

module.exports = routes;
