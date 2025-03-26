const express = require("express");
const { login, register, getAllUser } = require("../controllers/authController");

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/all", getAllUser);


module.exports = router;
