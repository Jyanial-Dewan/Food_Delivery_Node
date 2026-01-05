const Router = require("express");
const userController = require("../Controller/usersController");

const router = Router();

router.post("/", userController.createUser);

module.exports = router;
