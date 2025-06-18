import { Router } from "express";
import {  registerUser, loginUser } from "../services/auth.controller";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
