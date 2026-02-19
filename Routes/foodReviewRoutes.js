const Router = require("express");
const foodReviewController = require("../Controller/foodReviewController");

const router = Router();

router.post("/", foodReviewController.createFoodReview);
router.get("/", foodReviewController.getFoodReviews);

module.exports = router;
