const prisma = require("../DB/db.config");

exports.createIncident = async (req, res) => {
  const {
    short_description,
    description,
    impact,
    urgency,
    priority,
    state,
    category,
    u_reference_id,
  } = req.body;
  try {
    if (!short_description || !description || !impact) {
      console.log(`Triggerd the event, u_reference id: ${u_reference_id}`);
      return res.status(422).json({
        message:
          "Short description, description, impact and reference id are required",
      });
    }

    // const isExist = await prisma.cart.findFirst({
    //   where: {
    //     food_id: Number(food_id),
    //     user_id: Number(user_id),
    //   },
    // });

    // if (isExist) {
    //   return res.status(409).json({
    //     message: "The item is already exist is cart.",
    //   });
    // }

    const result = await prisma.service_now_incidents.create({
      data: {
        short_description,
        description,
        impact,
        urgency,
        priority,
        state,
        category,
        u_reference_id,
      },
    });

    if (result) {
      return res.status(201).json({ result, message: "Incident created." });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
