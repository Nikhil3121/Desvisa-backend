import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    /* ================= USER ================= */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* ================= TOKENS ================= */
    refreshTokenHash: {
      type: String, // 🔐 store HASH, not raw token
      required: true,
      index: true,
    },

    /* ================= DEVICE & LOCATION ================= */
    ipAddress: String,

    userAgent: String,

    deviceType: {
      type: String,
      enum: ["web", "mobile", "tablet"],
      default: "web",
    },

    sessionType: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    geoLocation: {
      country: String,
      city: String,
    },

    /* ================= SESSION STATUS ================= */
    isValid: {
      type: Boolean,
      default: true,
    },

    revokedReason: {
      type: String,
      enum: [
        "logout",
        "logout_all",
        "admin_block",
        "password_change",
        "expired",
      ],
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    /* ================= SECURITY ================= */
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

/* ================= AUTO DELETE EXPIRED SESSIONS ================= */
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = mongoose.model("Session", sessionSchema);
export default Session;
