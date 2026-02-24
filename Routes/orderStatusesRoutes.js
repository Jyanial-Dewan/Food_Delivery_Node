const Router = require("express");
const orderStatusesController = require("../Controller/orderStatusesController");

const router = Router();

router.post("/", orderStatusesController.upsertOrderStatuses);
router.get("/", orderStatusesController.getOrderStatuses);

module.exports = router;
