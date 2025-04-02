const pool = require("../db");
const multer = require("multer");
const path = require("path");

// Faylni saqlash uchun sozlash
const storage = multer.diskStorage({
    destination: "./uploads/", // "uploads" papkasi oldindan yaratilgan bo‘lishi kerak
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Fayl nomini unikal qilish
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB cheklov
    fileFilter: (req, file, cb) => {
        // Barcha rasm turlarini qabul qilish uchun MIME tiplarini kengaytiramiz
        const filetypes = /jpeg|jpg|png|gif|bmp|webp|tiff/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error("Faqat rasm fayllari qo‘llab-quvvatlanadi (JPEG, PNG, GIF, BMP, WEBP, TIFF va boshqalar)"));
        }
    }
}).single("image");

// Foydalanuvchining barcha postlarini olish
const getMyPosts = async (req, res) => {
    try {
        const { user_id } = req.params;
        const posts = await pool.query("SELECT * FROM posts WHERE user_id = $1", [user_id]);
        res.json(posts.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Serverda xatolik" });
    }
};

// Bitta postni ID bo‘yicha olish
const getPostById = async (req, res) => {
    try {
        const { post_id } = req.params;
        const post = await pool.query(
            `SELECT 
                posts.text AS post_text,
                users.username AS author,
                COUNT(likes.id) AS like_count
            FROM posts
            JOIN users ON posts.user_id = users.id
            LEFT JOIN likes ON posts.id = likes.post_id
            WHERE posts.id = $1
            GROUP BY posts.id, users.username`,
            [post_id]
        );
        if (post.rows.length === 0) {
            return res.status(404).json({ message: "Post topilmadi" });
        }
        res.json(post.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Serverda xatolik" });
    }
};

// Yangi post yaratish
const createPost = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        try {
            const { text, user_id } = req.body;
            const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
            const newPost = await pool.query(
                "INSERT INTO posts (user_id, text, image) VALUES ($1, $2, $3) RETURNING *",
                [user_id, text, imagePath]
            );
            res.status(201).json(newPost.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Serverda xatolik", error: err.message });
        }
    });
};

// Barcha postlarni olish
const getAllPosts = async (req, res) => {
    try {
        const posts = await pool.query(`
            SELECT 
                p.id,
                u.username,
                '1h' AS time,
                u.profile_image AS "profileImg",
                p.image AS "postImg",
                COUNT(DISTINCT l.id) AS "likeCount",
                p.text AS "caption",
                COUNT(DISTINCT c.id) AS "commentCount",
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
            LEFT JOIN users lu ON l.user_id = lu.id
            LEFT JOIN comments c ON p.id = c.post_id
            GROUP BY p.id, u.username, u.profile_image, p.image, p.text
        `);
        res.json(posts.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Serverda xatolik" });
    }
};

// Postni o‘chirish
const deletePost = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { post_id } = req.body;
        const post = await pool.query(
            "SELECT * FROM posts WHERE id = $1 AND user_id = $2",
            [post_id, user_id]
        );
        if (post.rows.length === 0) {
            return res.status(404).json({ message: "Post topilmadi yoki ruxsat yo‘q" });
        }
        await pool.query("DELETE FROM posts WHERE id = $1", [post_id]);
        res.json({ message: "Post o‘chirildi" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Serverda xatolik" });
    }
};

module.exports = { getMyPosts, createPost, getAllPosts, deletePost, getPostById };