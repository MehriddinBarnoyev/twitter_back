const express = require('express');
const { getMyPosts, createPost, getAllPosts, deletePost } = require('../controllers/postsController');

const router = express.Router();

router.get("/my-posts/:user_id", getMyPosts); // user_id params orqali olinadi
router.post("/create/:user_id", createPost); // user_id params orqali olinadi
router.get("/all", getAllPosts);
router.delete("/delete/:id/:user_id", deletePost);



module.exports = router;