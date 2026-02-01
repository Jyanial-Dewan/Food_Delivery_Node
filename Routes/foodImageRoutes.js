const express = require("express");
const foodImagesController = require("../Controller/foodImageController");
const { uploadFoodImages } = require("../Middleware/fileUpload");

const router = express.Router();

router.post(
  "/:user_id/:food_id",
  uploadFoodImages.array("food_images", 3),
  foodImagesController.uploadFoodImages,
);

module.exports = router;
