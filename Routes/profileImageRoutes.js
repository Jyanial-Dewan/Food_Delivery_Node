const express = require("express");
const profileImageController = require("../Controller/profileImageController");
const {
  uploadProfileImage,
  generateThumbnail,
} = require("../Middleware/fileUpload");

const router = express.Router();

router.post(
  "/:user_id",
  uploadProfileImage,
  generateThumbnail,
  profileImageController.uploadProfileImage,
);

module.exports = router;
