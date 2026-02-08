const Router = require("express");
const foodItemController = require("../Controller/foodItemController");

const router = Router();

router.get("/", foodItemController.getFoodItems);
router.post("/", foodItemController.createFoodItem);

module.exports = router;
