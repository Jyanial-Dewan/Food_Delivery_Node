const prisma = require("../DB/db.config");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  ACCESS_TOKEN_EXPIRED_TIME,
  JWT_SECRET_ACCESS_TOKEN,
  JWT_SECRET_REFRESH_TOKEN,
  REFRESH_TOKEN_EXPIRED_TIME,
} = require("../Variables/variables");
const { comparePassword } = require("../Utility/util");

const generateAccessTokenAndRefreshToken = (props) => {
  const accessToken = jwt.sign(props, JWT_SECRET_ACCESS_TOKEN, {
    expiresIn: ACCESS_TOKEN_EXPIRED_TIME,
  });
  const refreshToken = jwt.sign(props, JWT_SECRET_REFRESH_TOKEN, {
    expiresIn: REFRESH_TOKEN_EXPIRED_TIME,
  });
  return { accessToken, refreshToken };
};

exports.login = async (req, res) => {
  const { user, password } = req.body;
  if (!user || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }
  try {
    const userRecord = await prisma.users.findFirst({
      where: {
        username: user,
      },
    });

    if (!userRecord) {
      res.status(404).json({ message: "User not found." });
    } else {
      const userCredential = await prisma.credentials.findUnique({
        where: {
          user_id: userRecord.user_id,
        },
      });
      const passwordResult = await comparePassword(
        password,
        userCredential.password
      );
      if (!passwordResult) {
        return res.status(401).json({ message: "Invalid password." });
      }

      // const encryptedPassword = hashPassword(password);
      if (userCredential && passwordResult) {
        // if (userCredential && userCredential.password === encryptedPassword) {
        const { accessToken, refreshToken } =
          generateAccessTokenAndRefreshToken({
            isLoggedIn: true,
            user_id: userCredential.user_id,
            issuedAt: new Date(),
          });

        return res
          .status(200)
          .cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: true,
          })
          .cookie("access_token", accessToken, {
            httpOnly: true,
            secure: false,
          })
          .json({
            isLoggedIn: true,
            user_id: userCredential.user_id,
            access_token: accessToken,
            refresh_token: refreshToken,
            issuedAt: new Date(),
          });
      } else {
        return res.status(401).json({ message: "Invalid credential" });
      }
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
