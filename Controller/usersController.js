const prisma = require("../DB/db.config");
const { hashPassword } = require("../Utility/util");

exports.createUser = async (req, res) => {
  try {
    const {
      username,
      user_type,
      email,
      phone,
      first_name,
      last_name,
      password,
    } = req.body;

    if (!username || !user_type) {
      return res.status(422).json({
        message: "User name, User type is Required",
      });
    }

    const userName = await prisma.users.findFirst({
      where: {
        username,
      },
    });
    if (userName) {
      return res.status(409).json({ message: "User Name already exist." });
    }

    const isEmailExist = await prisma.users.findFirst({
      where: {
        email,
      },
    });
    if (isEmailExist) {
      return res.status(409).json({ message: "Email already exist." });
    }

    const result = await prisma.users.create({
      data: {
        username,
        user_type,
        email,
        phone,
        first_name,
        last_name,
      },
    });
    if (result) {
      const newCredential = await prisma.credentials.create({
        data: {
          user_id: result.user_id,
          password: hashPassword(password),
        },
      });

      if (newCredential) return res.status(201).json(result);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getRestaurants = async (req, res) => {
  const { user_id, page, limit } = req.query;

  try {
    if (user_id) {
      const result = await prisma.user_full_profile.findUnique({
        where: {
          user_id: Number(user_id),
          user_type: "OWNER",
        },
      });

      if (!result) {
        return res.status(404).json({ message: "Restuarant not found" });
      }
      return res.status(200).json({ result });
    }

    if (page && limit) {
      const total = await prisma.user_full_profile.count({
        where: {
          user_type: "OWNER",
        },
      });

      const result = await prisma.user_full_profile.findMany({
        where: {
          user_type: "OWNER",
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
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  const { user_id, page, limit } = req.query;

  try {
    if (user_id) {
      const result = await prisma.user_full_profile.findUnique({
        where: {
          user_id: Number(user_id),
          user_type: "USER",
        },
      });

      if (!result) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json({ result });
    }

    if (page && limit) {
      const total = await prisma.user_full_profile.count({
        where: {
          user_type: "USER",
        },
      });

      const result = await prisma.user_full_profile.findMany({
        where: {
          user_type: "USER",
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
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  const { user_id } = req.query;
  const { username, user_type, email, phone, first_name, last_name } = req.body;
  console.log(req.body, user_id, "user_id");
  try {
    const user = await prisma.users.update({
      where: { user_id: Number(user_id) },
      data: {
        username,
        user_type,
        email,
        phone,
        first_name,
        last_name,
      },
    });
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};
