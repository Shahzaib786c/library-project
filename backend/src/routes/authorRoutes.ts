import express from "express";
import {
  getAuthors,
  getAuthor,
  addAuthor,
  updateAuthor,
  deleteAuthor
} from "../controllers/authorController.js";

const router = express.Router();

router.get("/", getAuthors);
router.get("/:id", getAuthor);
router.post("/", addAuthor);
router.put("/:id", updateAuthor);
router.delete("/:id", deleteAuthor);

export default router;