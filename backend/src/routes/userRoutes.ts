import express from "express";
import { getUsers, updateStatus, updateRole } from "../controllers/userController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// sab routes admin-only
router.use(protect, adminOnly);

router.get("/", getUsers);
router.patch("/:id/status", updateStatus);
router.patch("/:id/role", updateRole);

export default router;