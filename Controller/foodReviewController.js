const prisma = require("../DB/db.config");

exports.createFoodReview = async (req, res) => {
  const { user_id, food_id, rating, review } = req.body;
  try {
    if (!rating || !food_id || !user_id) {
      return res.status(422).json({
        message: "Food Id, user id and rating are required",
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

    const result = await prisma.food_item_reviews.create({
      data: {
        food_id: Number(food_id),
        user_id: Number(user_id),
        rating,
        review,
      },
    });

    if (result) {
      return res.status(201).json({ result, message: "Food review added." });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getFoodReviews = async (req, res) => {
  const { food_id, page, limit } = req.query;

  try {
    const total = await prisma.food_item_reviews.count({
      where: {
        food_id: Number(food_id),
      },
    });

    const result = await prisma.food_item_reviews.findMany({
      where: {
        food_id: Number(food_id),
      },
      orderBy: {
        created_at: "desc",
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    return res.status(200).json({
      result,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
