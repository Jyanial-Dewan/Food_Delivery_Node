const prisma = require("../DB/db.config");

exports.uploadProfileImage = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message: "Profile image is required",
      });
    }

    const user = await prisma.users.findUnique({
      where: { user_id: Number(user_id) },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const result = await prisma.profile_images.upsert({
      where: { user_id: Number(user_id) },
      update: {
        original: req.file.path.replace(/\\/g, "/"),
        thumbnail: req.file.thumbnailPath || null,
      },
      create: {
        user_id: Number(user_id),
        original: req.file.path.replace(/\\/g, "/"),
        thumbnail: req.file.thumbnailPath || null,
      },
    });

    return res.status(201).json({
      result,
      message: "Profile image uploaded successfully.",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
