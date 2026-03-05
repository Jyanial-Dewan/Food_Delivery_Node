const Router = require("express");
const orderController = require("../Controller/orderController");

const router = Router();

router.post("/", orderController.createOrder);
router.get("/", orderController.getOrders);
router.put("/", orderController.updateOrderStatus);
router.put("/accept_delivery_request", orderController.acceptDeliveryRequest);

module.exports = router;
