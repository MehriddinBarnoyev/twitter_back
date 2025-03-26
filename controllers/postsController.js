const pool = require("../db");

// Foydalanuvchining barcha postlarini olish (user_id req.params orqali olinadi)
const getMyPosts = async (req, res) => {
    try {
        const { user_id } = req.params;

        const posts = await pool.query("SELECT * FROM posts WHERE user_id = $1", [user_id]);

        res.json(posts.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Yangi post yaratish (user_id req.params orqali olinadi)
const createPost = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { text, image } = req.body;

        const newPost = await pool.query(
            "INSERT INTO posts (user_id, text, image) VALUES ($1, $2, $3) RETURNING *",
            [user_id, text, image]
        );

        res.status(201).json(newPost.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Barcha postlarni olish
const getAllPosts = async (req, res) => {
    try {
        const posts = await pool.query("SELECT * FROM posts ORDER BY created_at DESC");

        res.json(posts.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Postni o'chirish (user_id va post_id req.params orqali olinadi)
const deletePost = async (req, res) => {
    try {
        const { user_id, post_id } = req.params;

        const post = await pool.query("SELECT * FROM posts WHERE id = $1 AND user_id = $2", [post_id, user_id]);

        if (post.rows.length === 0) {
            return res.status(404).json({ message: "Post not found or unauthorized" });
        }

        await pool.query("DELETE FROM posts WHERE id = $1", [post_id]);

        res.json({ message: "Post deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { getMyPosts, createPost, getAllPosts, deletePost };
