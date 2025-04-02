const express = require('express');

const { likePost, unLikePost } = require("../controllers/likesController");

const router = express.Router();

router.post("/like", likePost);
router.post("/unlike/:user_id", unLikePost);

module.exports = router;