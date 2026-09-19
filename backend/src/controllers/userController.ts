import { Request, Response } from "express";
import prisma from "../prisma.js";

export async function getUsers(req: Request, res: Response) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true
    },
    orderBy: { createdAt: "desc" }
  });

  res.status(200).json(users);
}

export async function updateStatus(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { status } = req.body;

  if (status !== "ACTIVE" && status !== "BLOCKED") {
    return res.status(400).json({ message: "Status must be ACTIVE or BLOCKED" });
  }

  if (id === (req as any).userId) {
    return res.status(400).json({ message: "You cannot block yourself" });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, name: true, email: true, role: true, status: true }
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: "User not found" });
  }
}

export async function updateRole(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { role } = req.body;

  if (role !== "USER" && role !== "ADMIN") {
    return res.status(400).json({ message: "Role must be USER or ADMIN" });
  }

  if (id === (req as any).userId) {
    return res.status(400).json({ message: "You cannot change your own role" });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true, status: true }
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: "User not found" });
  }
}