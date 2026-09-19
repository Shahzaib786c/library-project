import { Request, Response } from "express";
import prisma from "../prisma.js";

// GET /api/authors
export async function getAuthors(req: Request, res: Response) {
  const authors = await prisma.author.findMany();
  res.status(200).json(authors);
}

// GET /api/authors/:id  — author ke saath uski saari books
export async function getAuthor(req: Request, res: Response) {
  const author = await prisma.author.findUnique({
    where: { id: Number(req.params.id) },
    include: { books: true }
  });

  if (!author) {
    return res.status(404).json({ message: "Author not found" });
  }

  res.status(200).json(author);
}

// POST /api/authors
export async function addAuthor(req: Request, res: Response) {
  const { name, country } = req.body;

  if (!name || !country) {
    return res.status(400).json({ message: "Name and country are required" });
  }

  const author = await prisma.author.create({
    data: { name, country }
  });

  res.status(201).json(author);
}

// PUT /api/authors/:id
export async function updateAuthor(req: Request, res: Response) {
  try {
    const author = await prisma.author.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });
    res.status(200).json(author);
  } catch (error) {
    res.status(404).json({ message: "Author not found" });
  }
}

// DELETE /api/authors/:id
export async function deleteAuthor(req: Request, res: Response) {
  try {
    await prisma.author.delete({
      where: { id: Number(req.params.id) }
    });
    res.status(200).json({ message: "Author deleted" });
  } catch (error) {
    res.status(404).json({ message: "Author not found" });
  }
}