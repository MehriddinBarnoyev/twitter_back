const pool = require("../db");

const likePost = async (req, res) => {
    try {
        const { post_id, user_id } = req.body;

        const post = await pool.query("SELECT * FROM posts WHERE id = $1", [post_id]);

        if (post.rows.length === 0) {
            return res.status(404).json({ message: "Post not found" });
        }

        const like = await pool.query("INSERT INTO likes (user_id, post_id) VALUES ($1, $2) RETURNING *", [user_id, post_id]);

        res.status(201).json(like.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

const unLikePost = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { post_id } = req.body;

        const post = await pool.query("SELECT * FROM posts WHERE id = $1", [post_id]);

        if (post.rows.length === 0) {
            return res.status(404).json({ message: "Post not found" });
        }

        const like = await pool.query("DELETE FROM likes WHERE user_id = $1 AND post_id = $2 RETURNING *", [user_id, post_id]);

        res.status(201).json(like.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

module.exports = { likePost, unLikePost };