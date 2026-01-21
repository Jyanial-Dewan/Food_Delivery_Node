const { Prisma } = require("@prisma/client");
const prisma = require("../DB/db.config");

exports.createFoodItem = async (req, res) => {
  const {
    user_id,
    name,
    description,
    price,
    discount_price,
    category,
    is_veg,
    is_available,
    calories,
  } = req.body;
  try {
    if (!user_id || !name || !price) {
      return res.status(422).json({
        message: "User Id, name, and price are required",
      });
    }

    const isRestuarant = await prisma.users.findFirst({
      where: {
        user_id: Number(user_id),
        user_type: "OWNER",
      },
    });

    if (!isRestuarant) {
      return res.status(404).json({
        message: "Restuarant not found.",
      });
    }

    const result = await prisma.food_items.create({
      data: {
        user_id: Number(user_id),
        name,
        description,
        price: new Prisma.Decimal(price),
        discount_price: new Prisma.Decimal(discount_price),
        category,
        is_veg,
        is_available,
        calories: Number(calories),
      },
    });

    if (result) {
      return res
        .status(201)
        .json({ result, message: "Food item added successfully." });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
