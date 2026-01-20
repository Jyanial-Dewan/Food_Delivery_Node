const path = require("path");
const multer = require("multer");
const fs = require("fs");

const FOOD_UPLOAD_FOLDER = "./uploads/food_images";

const foodImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { user_id, food_id } = req.params;

    const foodFolder = path.join(
      FOOD_UPLOAD_FOLDER,
      user_id.toString(),
      food_id.toString(),
    );
    if (!fs.existsSync(foodFolder)) {
      fs.mkdirSync(foodFolder, { recursive: true });
    }

    // initialize index once
    if (req.foodImageIndex === undefined) {
      req.foodImageIndex = 0;
    }

    cb(null, foodFolder);
  },

  filename: (req, file, cb) => {
    const { food_id } = req.params;
    const index = req.foodImageIndex++;
    const ext = path.extname(file.originalname);

    cb(null, `${food_id}_${index}${ext}`);
  },
});

const uploadFoodImages = multer({
  storage: foodImageStorage,
  limits: { fileSize: 300000 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Unsupported file type"));
  },
}).array("food_images", 3);

module.exports = { uploadFoodImages };
