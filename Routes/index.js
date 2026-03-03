const Router = require("express");
const authRoute = require("./authRoutes");
const usersRoute = require("./usersRoutes");
const locationRoute = require("./locationRoutes");
const profileImageRoute = require("./profileImageRoutes");
const foodItemRoutes = require("./foodItemRoutes");
const foodImageRoute = require("./foodImageRoutes");
const foodReviewRoutes = require("./foodReviewRoutes");
const cartItemRoutes = require("./CartRoutes");
const orderStatusesRoutes = require("./orderStatusesRoutes");
const orderRoutes = require("./orderRoutes");
const orderItemsRoutes = require("./orderItemsRoutes");

const routes = Router();

routes.use("/api/auth", authRoute);
routes.use("/api/users", usersRoute);
routes.use("/api/location", locationRoute);
routes.use("/api/profile_image", profileImageRoute);
routes.use("/api/food_items", foodItemRoutes);
routes.use("/api/food_images", foodImageRoute);
routes.use("/api/food_item_reviews", foodReviewRoutes);
routes.use("/api/cart_items", cartItemRoutes);
routes.use("/api/order_statuses", orderStatusesRoutes);
routes.use("/api/orders", orderRoutes);
routes.use("/api/order_items", orderItemsRoutes);

module.exports = routes;
