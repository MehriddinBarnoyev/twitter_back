const pool = require('../db');
const { get } = require('../routes/commentsRoutes');

const createComment = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { post_id, text } = req.body

        const comment = await pool.query("INSERT INTO comments (user_id, post_id, text) VALUES ($1, $2, $3) RETURNING *", [user_id, post_id, text]);

        res.status(201).json(comment.rows[0]);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Server error" });

    }
}

const getComments = async (req, res) => {
    try {
        const { post_id } = req.params;
        const comments = await pool.query("SELECT * FROM comments WHERE post_id = $1", [post_id]);
        res.json(comments.rows);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Server error" });
    }
}


module.exports = { createComment, getComments };