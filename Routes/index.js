const Router = require("express");
const authRoute = require("./authRoutes");
const usersRoute = require("./usersRoutes");
const locationRoute = require("./locationRoutes");

const routes = Router();

routes.use("/api/auth", authRoute);
routes.use("/api/users", usersRoute);
routes.use("/api/location", locationRoute);

module.exports = routes;
