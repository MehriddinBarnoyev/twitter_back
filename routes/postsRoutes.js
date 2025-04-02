const express = require("express");
const { getMyPosts, createPost, getAllPosts, deletePost, getPostById } = require("../controllers/postsController");

const router = express.Router();

router.get("/my-posts/:user_id", getMyPosts); // Foydalanuvchi postlari
router.post("/create", createPost); // Yangi post yaratish
router.get("/all", getAllPosts); // Barcha postlar
router.delete("/delete/:user_id", deletePost); // Postni o‘chirish
router.get("/:post_id", getPostById); // Bitta postni olish

module.exports = router;