const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const postsRoutes = require("./routes/postsRoutes");
const likeRoutes = require("./routes/likeRoutes");
const commnetsRoutes = require("./routes/commentsRoutes");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/post", postsRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commnetsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
