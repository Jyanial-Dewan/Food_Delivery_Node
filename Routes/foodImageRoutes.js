const express = require("express");
const { uploadFoodImages } = require("../Controller/foodImageController");

const router = express.Router();

router.post("/:user_id/:food_id", uploadFoodImages, (req, res) => {
  res.json({
    message: "Food images uploaded successfully",
    files: req.files.map((file) => ({
      filename: file.filename,
      path: file.path.replace(/\\/g, "/"),
      size: file.size,
    })),
  });
});

module.exports = router;
