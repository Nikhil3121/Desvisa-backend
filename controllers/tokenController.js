import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "../models/Session.js";
import User from "../models/userModel.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.js";

/* ================= UTIL ================= */
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

/* =====================================================
   🔁 REFRESH TOKEN (ROTATION + HASHED STORAGE)
===================================================== */
export const refreshToken = async (req, res) => {
  const { refreshToken: incomingRefreshToken } = req.body;

  if (!incomingRefreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    /* 🔐 Verify refresh token signature */
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    /* 🔍 Find valid session */
    const session = await Session.findOne({
      refreshTokenHash: hashToken(incomingRefreshToken),
      isValid: true,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return res
        .status(401)
        .json({ message: "Invalid, expired, or reused refresh token" });
    }

    /* 👤 Verify user still exists */
    const user = await User.findById(decoded.id);
    if (!user || user.isBlocked || user.isDeleted) {
      session.isValid = false;
      session.revokedReason = "user_invalid";
      await session.save();

      return res.status(403).json({ message: "User not allowed" });
    }

    /* 🚫 Invalidate old session (rotation) */
    session.isValid = false;
    session.revokedReason = "rotated";
    await session.save();

    /* 🎫 Generate new tokens */
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    /* 🧾 Store new session */
    await Session.create({
      user: user._id,
      refreshTokenHash: hashToken(newRefreshToken),
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      deviceType: session.deviceType,
      sessionType: session.sessionType,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(401).json({
      message: "Refresh token invalid or expired",
    });
  }
};
