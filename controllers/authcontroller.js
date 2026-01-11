import crypto from "crypto";
import admin from "../config/firebaseadmin.js";
import User from "../models/userModel.js";
import Session from "../models/sessionmodel.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

/* ================= UTIL ================= */
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

/* =====================================================
   FIREBASE AUTH (EMAIL / PHONE / GOOGLE)
===================================================== */
 const firebaseAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Firebase token required" });
    }

    // 🔐 Verify Firebase ID token
    const decoded = await admin.auth().verifyIdToken(idToken);

    const {
      uid,
      email,
      email_verified,
      phone_number,
      name,
      firebase,
    } = decoded;

    // 🔍 Find user
    let user = await User.findOne({ firebaseUid: uid });

    // 🚫 Blocked user
    if (user?.isBlocked) {
      return res.status(403).json({ message: "Account is blocked" });
    }

    // 🆕 Create new user
    if (!user) {
      user = await User.create({
        name: name || "User",
        email: email || undefined,
        phone: phone_number || undefined,
        firebaseUid: uid,
        authProvider: "firebase",
        role: "user",
        isEmailVerified: !!email_verified,
        isPhoneVerified: !!phone_number,
        lastLogin: new Date(),
      });
    } else {
      user.lastLogin = new Date();
      await user.save();
    }

    // 🎫 Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // 🧾 Store session
    await Session.create({
      user: user._id,
      refreshTokenHash: hashToken(refreshToken),
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      deviceType: "web",
      sessionType: "user",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        provider: user.authProvider,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid Firebase token" });
  }
};


export default firebaseAuth
