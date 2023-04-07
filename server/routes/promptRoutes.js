const express = require("express");
const router = express.Router();

const { getSubtopics, explainTopic, evaluateResponse } = require("../controllers/promptController");
const rateLimit = require("../middlewares/rateLimit");
const validate = require("../middlewares/validate");


router.post("/topics", rateLimit, getSubtopics);
router.post("/explain", rateLimit, explainTopic);
router.post("/evaluate", rateLimit, evaluateResponse);

module.exports = router;