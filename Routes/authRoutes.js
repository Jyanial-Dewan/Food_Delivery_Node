const Router = require("express");
const authController = require("../Authentication/auth");

const router = Router();

router.post("/login", authController.login);

module.exports = router;
