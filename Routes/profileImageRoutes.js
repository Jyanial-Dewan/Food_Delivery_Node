const Router = require("express");
const profileImageController = require("../Controller/profileImageController");
const {
  uploadProfileImage,
  generateThumbnail,
} = require("../Middleware/fileUpload");

const router = Router();

router.post(
  "/:user_id",
  (req, res, next) => {
    uploadProfileImage(req, res, function (err) {
      if (err) {
        return res.status(400).json({
          message: err.message || "Image upload failed",
        });
      }
      next();
    });
  },
  generateThumbnail,
  profileImageController.uploadProfileImage,
);

module.exports = router;
