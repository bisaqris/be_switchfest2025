import { Router } from "express";
import {
  getKursuses,
  getKursus,
  createKursus,
  updateKursus,
  deleteKursus,
} from "../controllers/kursusController.js";

const router = Router();

// Ambil semua kursus
router.get("/", getKursuses);

// Ambil kursus berdasarkan ID
router.get("/:id", getKursus);

// Buat kursus baru
router.post("/", createKursus);

// Update kursus berdasarkan ID
router.patch("/:id", updateKursus);

// Hapus kursus berdasarkan ID
router.delete("/:id", deleteKursus);

export default router;