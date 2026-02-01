const prisma = require("../DB/db.config");

exports.uploadFoodImages = async (req, res) => {
  const { food_id } = req.params;

  if (!req.files) {
    return res.status(400).json({
      message: "Food images is required",
    });
  }
  const food = await prisma.food_items.findUnique({
    where: { food_id: Number(food_id) },
  });

  if (!food) {
    return res.status(404).json({
      message: "Food item not found.",
    });
  }

  const result = await Promise.all(
    req.files.map((file) =>
      prisma.food_item_images.create({
        data: {
          food_id: Number(food_id),
          image_url: file.path.replace(/\\/g, "/"),
        },
      }),
    ),
  );

  res.json({
    message: "Food images uploaded successfully",
    result,
  });
};
