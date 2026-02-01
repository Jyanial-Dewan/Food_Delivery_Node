const Router = require("express");
const userController = require("../Controller/usersController");

const router = Router();

router.post("/", userController.createUser);
router.get("/restaurants", userController.getRestaurants);
router.get("/users", userController.getUsers);
router.put("/user", userController.updateUser);
// router.delete('/user/:id', userController.deleteUser)

module.exports = router;
