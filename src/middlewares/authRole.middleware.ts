import { Request, Response, NextFunction, RequestHandler } from "express";
import { JwtPayload } from "jsonwebtoken";

export const authorizeRole = (requiredRole: string): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = (req as Request & { user?: JwtPayload }).user;

        if (!user || user.role !== requiredRole) {
            res.status(403).json({ message: "Acesso negado: permissão insuficiente." });
            return;
        }

        next();
    };
};
