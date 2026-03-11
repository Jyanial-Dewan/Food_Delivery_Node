const Router = require("express");
const sendUpdatedStatusController = require("./pushNotificationController");

const router = Router();

router.post("/register_token", sendUpdatedStatusController.registerToken);
router.post("/unregister_token", sendUpdatedStatusController.unregisterToken);
router.post(
  "/send_status_update",
  sendUpdatedStatusController.sendUpdatedStatus,
);

module.exports = router;
