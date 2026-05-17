const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    try {
      const user = req.user;

      if (!user) {
        console.error("❌ No user returned from Google auth");
        return res.status(500).json({ message: "No user data from Google" });
      }

      if (!process.env.JWT_SECRET) {
        console.error("❌ JWT_SECRET not configured");
        return res.status(500).json({ message: "Server configuration error" });
      }

      const token = jwt.sign(
        {
          user_id: user.user_id,
          email:   user.email,
          name:    user.name,
          role:    user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      const clientURL = process.env.CLIENT_URL || "http://localhost:5173";
      console.log(`✅ Login successful for ${user.email}, redirecting to ${clientURL}/auth/callback`);
      res.redirect(`${clientURL}/auth/callback?token=${token}`);
    } catch (err) {
      console.error("❌ Auth callback error:", err.message);
      res.status(500).json({ message: "Authentication failed", error: err.message });
    }
  }
);

router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      user_id: decoded.user_id,
      email:   decoded.email,
      name:    decoded.name,
      role:    decoded.role
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

router.post("/logout", (req, res) => {
  try {
    // Token is already cleared on the frontend
    // This endpoint just confirms the logout on the backend
    console.log("✅ User logged out");
    res.json({ message: "Logout successful" });
  } catch (err) {
    console.error("❌ Logout error:", err.message);
    res.status(500).json({ message: "Logout failed", error: err.message });
  }
});

module.exports = router;