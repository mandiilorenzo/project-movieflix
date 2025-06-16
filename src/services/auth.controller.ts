import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

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
