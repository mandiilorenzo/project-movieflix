import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
    id: number;
    email: string;
}

export const authenticateToken = ( req: Request, res: Response, next: NextFunction ): void => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        res.status(401).json({ message: "Token não fornecido" });
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (error, user) => {
        if (error) {
            res.status(403).json({ message: "Token inválido" });
            return;
        }

        (req as Request & { user?: JwtPayload }).user = user as JwtPayload;
        next();
    });
};
