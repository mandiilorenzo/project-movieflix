import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

import { Request, Response } from "express";

export const registerUser = async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;

    try {
        const userExists = await prisma.users.findUnique({ where: { email } });
        if (userExists) res.status(400).json({ message: "Email já cadastrado" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.users.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || "USER", 
            },
        });

        res.status(201).json({ message: "Usuário criado com sucesso", user });
    } catch (error) {
        res.status(500).json({ message: "Erro ao cadastrar usuário", error });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.users.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Senha incorreta" });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || "default_secret", // use .env para isso
            { expiresIn: "1h" }
        );

        res.status(200).json({ message: "Login bem-sucedido", token });
    } catch (error) {
        res.status(500).json({ message: "Erro ao fazer login", error });
    }
};
