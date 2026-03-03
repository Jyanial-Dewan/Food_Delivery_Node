const prisma = require("../DB/db.config");
const { Prisma } = require("@prisma/client");

exports.createOrderItem = async (req, res) => {
  const { order_id, food_id, quantity, subtotal } = req.body;
  try {
    if (!order_id || !food_id || !quantity || !subtotal) {
      return res.status(422).json({
        message: "Order id, food id, quantity and subtotal are required",
      });
    }

    const isOrder = await prisma.orders.findFirst({
      where: {
        order_id: Number(order_id),
      },
    });

    if (!isOrder) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    const isFood = await prisma.food_items.findFirst({
      where: {
        food_id: Number(food_id),
      },
    });

    if (!isFood) {
      return res.status(404).json({
        message: "Food not found.",
      });
    }

    const result = await prisma.order_items.create({
      data: {
        order_id: Number(order_id),
        food_id: Number(food_id),
        quantity: Number(quantity),
        subtotal: new Prisma.Decimal(subtotal),
      },
    });

    if (result) {
      return res
        .status(201)
        .json({ result, message: "Your order has been received." });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
