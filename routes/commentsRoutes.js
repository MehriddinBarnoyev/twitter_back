const express = require('express');
const {createComment} = require("../controllers/commentController");

const router = express.Router();

router.post("/comment/:user_id", createComment);

module.exports = router;