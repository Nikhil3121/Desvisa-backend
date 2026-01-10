import express from "express";
import protect from "../middleware/isauthenticate.js";
import firebaseAuth from "../controllers/authcontroller.js";



const router = express.Router();

router.post("/firebase" , firebaseAuth);


export default router;
