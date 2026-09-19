import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

// POST /api/auth/register
export async function register(req: Request, res: Response) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    try {
        // password ko hash karo — plain text kabhi save nahi hota
        const hashed = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { name, email, password: hashed }
        });

        // response mein password wapas mat bhejo
        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        // @unique ki wajah se MySQL duplicate email reject karta hai
        res.status(400).json({ message: "Email already registered" });
    }
}

// POST /api/auth/login
export async function login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // email ghalat ho ya password — paigham ek hi rakho
    if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status === "BLOCKED") {
        return res.status(403).json({ message: "Your account has been blocked" });
    }

    // token banao
    const token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.status(200).json({
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
}

// GET /api/auth/me  — token se apni info
export async function getMe(req: Request, res: Response) {
    const userId = (req as any).userId;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true, status: true }
    });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
}