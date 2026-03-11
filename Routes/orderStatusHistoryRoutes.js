const Router = require("express");
const orderStatusHistoryController = require("../Controller/orderStatusHistoryController");

const router = Router();

router.get("/", orderStatusHistoryController.getStatusHistory);

module.exports = router;
