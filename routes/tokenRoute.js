import express from "express";
import { refreshToken } from "../controllers/tokenController.js";

const router = express.Router();
router.post("/refresh-token", refreshToken);
export default router;
