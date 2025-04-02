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

const getPostById = async (req, res) => {
    try {
        const { post_id } = req.params;
        const post = await pool.query(`SELECT 
                posts.text AS post_text,
                users.username AS author,
                COUNT(likes.id) AS like_count
                FROM posts
                JOIN users ON posts.user_id = users.id
                LEFT JOIN likes ON posts.id = likes.post_id
                WHERE posts.id = $1 -- Bu yerda kerakli post ID-ni kiriting
                GROUP BY posts.id, users.username;`, [post_id]);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Server error" });

    }
}

// Yangi post yaratish (user_id req.params orqali olinadi)
const createPost = async (req, res) => {
    try {
        const { text, image, user_id  } = req.body;

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
        const posts = await pool.query(`SELECT 
    p.id,
    u.username,
    '1h' AS time,
    u.profile_image AS "profileImg",
    p.image AS "postImg",
    COUNT(DISTINCT l.id) AS "likeCount",
    p.text AS "caption",
    COUNT(DISTINCT c.id) AS "commentCount",
    -- Har bir user uchun, ushbu postga like bosganmi yoki yo'qmi?
    json_agg(
        DISTINCT jsonb_build_object(
            'user_id', lu.id, 
            'username', lu.username,
            'isLiked', CASE 
                WHEN l.id IS NOT NULL THEN true 
                ELSE false 
            END
        )
    ) AS "usersWhoLiked"
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN likes l ON p.id = l.post_id
    LEFT JOIN users lu ON l.user_id = lu.id -- Like bosgan userlarni olish uchun
    LEFT JOIN comments c ON p.id = c.post_id
    GROUP BY p.id, u.username, u.profile_image, p.image, p.text;



`);

        res.json(posts.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Postni o'chirish (user_id va post_id req.params orqali olinadi)
const deletePost = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { post_id } = req.body;

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

module.exports = { getMyPosts, createPost, getAllPosts, deletePost, getPostById };
