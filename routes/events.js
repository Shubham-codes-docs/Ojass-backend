const express = require("express");
const IS_AUTH = require("../middlewares/auth");
const events = require("../controllers/events");

const router = express.Router();

router.post("/add-events", IS_AUTH, events.addEvents);
router.post("/add-winners", IS_AUTH, events.addWinnersToEvents);
router.post("/update", events.addMin);
router.delete("/delete", events.deleteAllEvents);

module.exports = router;
