const prisma = require("../DB/db.config");

exports.getStatusHistory = async (req, res) => {
  const { order_id } = req.query;
  try {
    const result = await prisma.order_status_history.findMany({
      where: {
        order_id: Number(order_id),
      },
      orderBy: {
        changed_at: "asc",
      },
    });

    if (result) {
      return res.status(200).json({
        result,
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
