import express from "express";
import {
  getBooks,
  getBook,
  addBook,
  updateBook,
  deleteBook
} from "../controllers/bookController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// sab dekh sakte hain — login ki zarurat nahi
router.get("/", getBooks);
router.get("/:id", getBook);

// sirf logged-in users
router.post("/", protect, addBook);
router.put("/:id", protect, updateBook);

// sirf admin
router.delete("/:id", protect, adminOnly, deleteBook);

export default router;