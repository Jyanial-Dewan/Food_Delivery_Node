const Router = require("express");
const incidentController = require("../Controller/incidentController");

const router = Router();

router.post("/", incidentController.createIncident);

module.exports = router;
