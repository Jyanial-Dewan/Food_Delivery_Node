const Router = require("express");
const authRoute = require("./authRoutes");
const usersRoute = require("./usersRoutes");
const locationRoute = require("./locationRoutes");
const profileImageRoute = require("./profileImageRoutes");
const foodItemRoutes = require("./foodItemRoutes");
const foodImageRoute = require("./foodImageRoutes");

const routes = Router();

routes.use("/api/auth", authRoute);
routes.use("/api/users", usersRoute);
routes.use("/api/location", locationRoute);
routes.use("/api/profile_image", profileImageRoute);
routes.use("/api/food_items", foodItemRoutes);
routes.use("/api/food_images", foodImageRoute);

module.exports = routes;
