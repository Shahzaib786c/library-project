import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";      

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export async function protect(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true, status: true }
    });

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    if (user.status === "BLOCKED") {
      return res.status(403).json({ message: "Your account has been blocked" });
    }

    (req as any).userId = user.id;
    (req as any).userRole = user.role;  

    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
}

export function adminOnly(req: Request, res: Response, next: NextFunction) {
  if ((req as any).userRole !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}