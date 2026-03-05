const prisma = require("../DB/db.config");
// const { Prisma } = require("@prisma/client");

exports.createOrder = async (req, res) => {
  const {
    customer_id,
    vendor_id,
    payment_method,
    delivery_address,
    notes,
    status_code,
  } = req.body;
  try {
    if (!vendor_id || !customer_id || !status_code) {
      return res.status(422).json({
        message: "Vendor Id, customer Id and status code are required",
      });
    }

    const isVendor = await prisma.users.findFirst({
      where: {
        user_id: Number(vendor_id),
        user_type: "OWNER",
      },
    });

    if (!isVendor) {
      return res.status(404).json({
        message: "Vendor is not valid.",
      });
    }

    const isCustomer = await prisma.users.findFirst({
      where: {
        user_id: Number(customer_id),
        user_type: "USER",
      },
    });

    if (!isCustomer) {
      return res.status(404).json({
        message: "Customer is not valid.",
      });
    }

    const result = await prisma.orders.create({
      data: {
        vendor_id: Number(vendor_id),
        customer_id: Number(customer_id),
        payment_method,
        delivery_address,
        notes,
        status_code,
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

exports.getOrders = async (req, res) => {
  const { vendor_id, delivery_man_id } = req.query;

  try {
    if (vendor_id) {
      const result = await prisma.order_summary_view.findMany({
        where: {
          vendor_id: Number(vendor_id),
        },
      });

      if (result) {
        return res.status(200).json({
          result,
        });
      }
    } else if (delivery_man_id) {
      const result = await prisma.order_summary_view.findMany({
        where: {
          delivery_man_id: Number(delivery_man_id),
        },
      });

      if (result) {
        return res.status(200).json({
          result,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { order_id } = req.query;
  const { status_code } = req.body;
  try {
    const isValid = await prisma.orders.findUnique({
      where: {
        order_id: Number(order_id),
      },
    });

    if (!isValid) {
      return res.status(404).json({
        message: "Order is not found.",
      });
    }

    const result = await prisma.orders.update({
      where: {
        order_id: Number(order_id),
      },
      data: {
        status_code,
      },
    });

    if (result) {
      return res.status(200).json({
        result,
        message: "Order updated.",
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.acceptDeliveryRequest = async (req, res) => {
  const { order_id, delivery_man_id } = req.query;
  console.log(order_id, delivery_man_id);

  try {
    const isValid = await prisma.orders.findUnique({
      where: {
        order_id: Number(order_id),
      },
    });

    if (!isValid) {
      return res.status(404).json({
        message: "Order is not found.",
      });
    }
    const isExist = await prisma.orders.findFirst({
      where: {
        order_id: Number(order_id),
        delivery_man_id: {
          not: null,
        },
      },
    });

    if (isExist) {
      return res.status(404).json({
        message: "The order has been assigned already.",
      });
    }

    const result = await prisma.orders.update({
      where: {
        order_id: Number(order_id),
      },
      data: {
        delivery_man_id: Number(delivery_man_id),
      },
    });

    if (result) {
      return res.status(200).json({
        result,
        message: "Order has been assigned to you.",
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
