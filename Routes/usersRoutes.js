const Router = require("express");
const userController = require("../Controller/usersController");

const router = Router();

router.post("/", userController.createUser);
router.get("/restaurants", userController.getRestaurants);
router.get("/users", userController.getUsers);

module.exports = router;
