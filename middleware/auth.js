// middleware/auth.js
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const tokenHeader = req.header("Authorization");

  if (!tokenHeader) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  const token = tokenHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ msg: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    res.status(401).json({ msg: "Token invalid" });
  }
};
