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
    console.log(userName);
    if (userName) {
      return res.status(409).json({ message: "User Name already exist." });
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
