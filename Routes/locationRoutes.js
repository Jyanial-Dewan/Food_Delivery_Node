const Router = require("express");
const locationController = require("../Controller/locationController");

const router = Router();

router.post("/", locationController.upsertLocation);

module.exports = router;
