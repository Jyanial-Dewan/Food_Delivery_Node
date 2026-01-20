const prisma = require("../DB/db.config");

exports.uploadProfileImage = async (req, res) => {
  const { user_id } = req.params;
  try {
    const isExist = await prisma.users.findFirst({
      where: {
        user_id: Number(user_id),
      },
    });

    if (!isExist) {
      return res.status(409).json({
        message: "User not found.",
      });
    }

    const result = await prisma.profile_images.upsert({
      where: {
        user_id: Number(user_id),
      },
      update: {
        original: req.file.path.replace(/\\/g, "/"),
        thumbnail: req.file.thumbnailPath,
      },
      create: {
        user_id: Number(user_id),
        original: req.file.path.replace(/\\/g, "/"),
        thumbnail: req.file.thumbnailPath,
        created_at: new Date(),
      },
    });

    if (result) {
      return res
        .status(201)
        .json({ result, message: "Profile image uploaded successfully." });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
