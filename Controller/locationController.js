const prisma = require("../DB/db.config");

exports.upsertLocation = async (req, res) => {
  try {
    const { user_id, latitude, longitude } = req.body;

    if (!user_id) {
      return res.status(422).json({
        message: "User Id is Required",
      });
    }

    const isExist = await prisma.users.findFirst({
      where: {
        user_id: Number(user_id),
      },
    });

    if (!isExist) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const result = await prisma.location.upsert({
      where: {
        user_id: Number(user_id),
      },
      update: {
        latitude,
        longitude,
        connection_time: new Date(),
      },
      create: {
        user_id: Number(user_id),
        latitude,
        longitude,
        connection_time: new Date(),
      },
    });
    if (result) {
      return res
        .status(201)
        .json({ result, message: "Location updated successfully." });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
