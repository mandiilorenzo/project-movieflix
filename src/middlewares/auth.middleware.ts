import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // formato: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: "Token não fornecido" });
    }

    jwt.verify(token, process.env.JWT_SECRET || "default_secret", (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token inválido" });
        }

        (req as any).user = user;
        next();
    });
};
