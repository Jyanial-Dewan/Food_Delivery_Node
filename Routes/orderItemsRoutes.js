const Router = require("express");
const orderItemController = require("../Controller/orderItemsController");

const router = Router();

router.post("/", orderItemController.createOrderItem);

module.exports = router;
