const prisma = require("../DB/db.config");

exports.upsertOrderStatuses = async (req, res) => {
  const { vendor_id, status_names, columns_per_row } = req.body;
  try {
    if (!vendor_id || !status_names) {
      return res.status(422).json({
        message: "Vendor Id and status names are required",
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

    const result = await prisma.order_statuses.upsert({
      where: {
        vendor_id: Number(vendor_id),
      },
      update: {
        status_names,
        columns_per_row: Number(columns_per_row) || 1,
      },
      create: {
        vendor_id: Number(vendor_id),
        status_names,
        columns_per_row: Number(columns_per_row) || 1,
      },
    });

    if (result) {
      return res.status(201).json({ result, message: "Status list updated." });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getOrderStatuses = async (req, res) => {
  const { vendor_id } = req.query;

  try {
    const isListed = await prisma.order_statuses.findFirst({
      where: {
        vendor_id: Number(vendor_id),
      },
    });

    if (!isListed) {
      return res.status(404).json({
        message: "The vendor has not added status list yet.",
      });
    }

    const result = await prisma.order_statuses.findUnique({
      where: {
        vendor_id: Number(vendor_id),
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
