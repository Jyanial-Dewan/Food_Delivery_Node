const { Prisma } = require("@prisma/client");
const prisma = require("../DB/db.config");

exports.createCartItem = async (req, res) => {
  const { user_id, food_id, quantity, name, discount_price, image_url } =
    req.body;
  try {
    if (!user_id || !name || !discount_price || !food_id) {
      return res.status(422).json({
        message: "User Id, food Id, name, and price are required",
      });
    }

    const isFood = await prisma.food_items.findFirst({
      where: {
        food_id: Number(food_id),
      },
    });

    if (!isFood) {
      return res.status(404).json({
        message: "Food item not found.",
      });
    }

    const isExist = await prisma.cart.findFirst({
      where: {
        food_id: Number(food_id),
        user_id: Number(user_id),
      },
    });

    if (isExist) {
      return res.status(409).json({
        message: "The item is already exist is cart.",
      });
    }

    const result = await prisma.cart.create({
      data: {
        user_id: Number(user_id),
        food_id: Number(food_id),
        name,
        discount_price: new Prisma.Decimal(discount_price),
        quantity,
        image_url,
      },
    });

    if (result) {
      return res
        .status(201)
        .json({ result, message: "Food item added successfully to Cart." });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getCartItems = async (req, res) => {
  const { user_id } = req.query;

  const isUser = await prisma.users.findFirst({
    where: {
      user_id: Number(user_id),
    },
  });

  if (!isUser) {
    return res.status(404).json({
      message: "User not found.",
    });
  }

  const result = await prisma.cart.findMany({
    where: {
      user_id: Number(user_id),
    },
  });

  if (result) {
    return res.status(200).json({
      result,
    });
  }
};
