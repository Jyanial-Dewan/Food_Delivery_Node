const path = require("path");
const multer = require("multer");
const fs = require("fs");
const sharp = require("sharp");

const PROFILE_UPLOAD_FOLDER = "./uploads/profile_image";

const deleteExistingImages = async (folderPath) => {
  if (!fs.existsSync(folderPath)) return;

  const files = await fs.promises.readdir(folderPath);
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const stat = await fs.promises.lstat(filePath);
    if (stat.isFile()) {
      await fs.promises.unlink(filePath);
    }
  }
};

const profileImageStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const { user_id } = req.params;
      const userFolder = path.join(PROFILE_UPLOAD_FOLDER, user_id.toString());

      await deleteExistingImages(userFolder);

      if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder, { recursive: true });
      }

      cb(null, userFolder);
    } catch (err) {
      cb(err);
    }
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile${ext}`);
  },
});

const uploadProfileImage = multer({
  storage: profileImageStorage,
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Unsupported file type"));
  },
}).single("profile_image");

const generateThumbnail = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const thumbnailPath = path.join(
      path.dirname(req.file.path),
      "thumbnail.jpg",
    );

    let quality = 80;
    let buffer = await sharp(req.file.path)
      .resize({ withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer();

    while (buffer.length > 10 * 1024 && quality > 10) {
      quality -= 5;
      buffer = await sharp(req.file.path).jpeg({ quality }).toBuffer();
    }

    await sharp(buffer).toFile(thumbnailPath);

    req.file.thumbnailPath = thumbnailPath.replace(/\\/g, "/");
    next();
  } catch (err) {
    next(err);
  }
};

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
});

module.exports = { uploadProfileImage, generateThumbnail, uploadFoodImages };
