const Router = require("express");
const cartController = require("../Controller/cartController");

const router = Router();

router.post("/", cartController.createCartItem);
router.get("/", cartController.getCartItems);

module.exports = router;
