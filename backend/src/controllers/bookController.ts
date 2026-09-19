import { Request, Response } from "express";
import prisma from "../prisma.js";

export async function getBooks(req: Request, res: Response) {
  const books = await prisma.book.findMany({
    include: { author: true }
  });
  res.status(200).json(books);
}

export async function getBook(req: Request, res: Response) {
  const book = await prisma.book.findUnique({
    where: { id: Number(req.params.id) },
    include: { author: true }
  });

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  res.status(200).json(book);
}

export async function addBook(req: Request, res: Response) {
  const { title, year, authorId } = req.body;

  if (!title || !year || !authorId) {
    return res.status(400).json({ message: "Title, year and authorId are required" });
  }

  try {
    const book = await prisma.book.create({
      data: {
        title,
        year: Number(year),
        authorId: Number(authorId)
      }
    });
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ message: "Author does not exist" });
  }
}

export async function updateBook(req: Request, res: Response) {
  try {
    const book = await prisma.book.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });
    res.status(200).json(book);
  } catch (error) {
    res.status(404).json({ message: "Book not found" });
  }
}

export async function deleteBook(req: Request, res: Response) {
  try {
    await prisma.book.delete({
      where: { id: Number(req.params.id) }
    });
    res.status(200).json({ message: "Book deleted" });
  } catch (error) {
    res.status(404).json({ message: "Book not found" });
  }
}