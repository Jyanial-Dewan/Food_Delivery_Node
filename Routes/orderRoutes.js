const Router = require("express");
const orderController = require("../Controller/orderController");

const router = Router();

router.post("/", orderController.createOrder);
router.get("/", orderController.getOrders);
router.put("/", orderController.updateOrderStatus);

module.exports = router;
