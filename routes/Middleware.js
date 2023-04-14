const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, "WeArePlutogo");
    User.findById(decoded.userId)
      .then((user) => {
        if (!user) {
          return res.status(401).json({ error: "Unauthorized" });
        }
        req.user = user;
        next();
      })
      .catch((error) => {
        console.error("Error finding user:", error);
        res.status(500).json({ error: "Failed to find user" });
      });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = authMiddleware;
