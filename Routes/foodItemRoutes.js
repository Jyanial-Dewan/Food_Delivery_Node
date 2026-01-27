const Router = require("express");
const foodItemController = require("../Controller/foodItemController");

const router = Router();

router.post("/", foodItemController.createFoodItem);

module.exports = router;
