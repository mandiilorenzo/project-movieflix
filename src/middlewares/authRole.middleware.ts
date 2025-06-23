import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";

export const authorizeRole = (requiredRole: "ADMIN" | "USER") => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as Request & { user?: JwtPayload }).user;

        if (!user || user.role !== requiredRole) {
            return res.status(403).json({ message: "Acesso negado: permissão insuficiente." });
        }

        next();
    };
};
