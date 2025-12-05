// routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const auth = require("../middleware/auth");    // protected route middleware

// Helper function to get JWT secret
const getSecret = () => process.env.JWT_SECRET || "secret";

// =============================
// REGISTER USER
// POST /api/auth/register
// =============================
router.post(
  "/register",
  [
    body("name", "Name is required").notEmpty(),
    body("email", "Valid email required").isEmail(),
    body("password", "Password must be 6 characters").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ errors: [{ msg: "User already exists" }] });
      }

      user = new User({ name, email, password });

      // Hash password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // Create JWT
      const payload = { user: { id: user.id } };
      const token = jwt.sign(payload, getSecret(), { expiresIn: "1h" });

      res.status(201).json({ token });
    } catch (err) {
      console.error("Register Error:", err.message);
      res.status(500).send("Server error");
    }
  }
);

// =============================
// LOGIN USER
// POST /api/auth/login
// =============================
router.post(
  "/login",
  [
    body("email", "Valid email required").isEmail(),
    body("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user)
        return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });

      const payload = { user: { id: user.id } };
      const token = jwt.sign(payload, getSecret(), { expiresIn: "7d" });

      res.json({ token });
    } catch (err) {
      console.error("Login Error:", err.message);
      res.status(500).send("Server error");
    }
  }
);

// =============================
// PROTECTED ROUTE - ME
// GET /api/auth/me
// =============================
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error("Me Route Error:", err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
