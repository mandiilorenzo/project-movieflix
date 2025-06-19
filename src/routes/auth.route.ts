import { Router, Request, Response, NextFunction } from "express";
import { registerUser, loginUser } from "../services/auth.controller";

const router = Router();

router.post("/register", (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(registerUser(req, res)).catch(next);
});
router.post("/login", (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(loginUser(req, res)).catch(next);
});

export default router;
