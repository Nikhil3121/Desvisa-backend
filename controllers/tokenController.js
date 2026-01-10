import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "../models/Session.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.js";

/* ================= UTIL ================= */
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

/* =====================================================
   REFRESH TOKEN (ROTATION + HASHED STORAGE)
===================================================== */
export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    // 🔐 Verify refresh token signature
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    // 🔍 Find valid session using HASHED token
    const session = await Session.findOne({
      refreshTokenHash: hashToken(refreshToken),
      isValid: true,
    });

    if (!session) {
      return res.status(401).json({ message: "Invalid or expired session" });
    }

    // 🚫 Invalidate old session (rotation)
    session.isValid = false;
    session.revokedReason = "expired";
    await session.save();

    // 🎫 Generate new tokens
    const newRefreshToken = generateRefreshToken(decoded.id);
    const accessToken = generateAccessToken(decoded.id);

    // 🧾 Store new session
    await Session.create({
      user: decoded.id,
      refreshTokenHash: hashToken(newRefreshToken),
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      deviceType: session.deviceType,
      sessionType: session.sessionType,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(200).json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(401).json({ message: "Refresh token invalid or expired" });
  }
};
