import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

// Ambil semua kursus
export const getKursuses = async (req: Request, res: Response) => {
  try {
    const kursus = await prisma.kursus.findMany();
    res.status(200).json({ status: 200, total: kursus.length, data: kursus });
  } catch (e) {
    res.status(500).json({ status: 500, message: "Gagal mengambil kursus", error: e });
  }
};

// Ambil kursus berdasarkan ID
export const getKursus = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Parameter ID kursus dibutuhkan" });
  }

  try {
    const kursus = await prisma.kursus.findUnique({
      where: { id },
    });

    if (!kursus) {
      return res.status(404).json({ message: `Kursus dengan ID ${id} tidak ditemukan.` });
    }

    res.status(200).json({ status: 200, data: kursus });
  } catch (e) {
    res.status(500).json({ status: 500, message: "Terjadi kesalahan pada server", error: e });
  }
};

// Buat kursus baru
export const createKursus = async (req: Request, res: Response) => {
  const { title, description, instructor, duration } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Judul kursus wajib diisi" });
  }

  try {
    const kursus = await prisma.kursus.create({
      data: { title, description, instructor, duration: Number(duration) },
    });

    res.status(200).json({ status: 200, message: "Kursus berhasil dibuat", data: kursus });
  } catch (e) {
    console.error("Error creating kursus:", e);
    res.status(500).json({ status: 500, message: "Gagal membuat kursus", error: e });
  }
};

// Update kursus
export const updateKursus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, instructor, duration } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Parameter ID dibutuhkan" });
  }

  try {
    const kursus = await prisma.kursus.findUnique({ where: { id } });

    if (!kursus) {
      return res.status(404).json({ message: `Kursus dengan ID ${id} tidak ditemukan.` });
    }

    const updatedKursus = await prisma.kursus.update({
      where: { id },
      data: { title, description, instructor, duration },
    });

    res.status(200).json({ status: 200, message: "Kursus berhasil diperbarui", data: updatedKursus });
  } catch (e) {
    res.status(500).json({ status: 500, message: "Gagal update kursus", error: e });
  }
};

// Hapus kursus
export const deleteKursus = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Parameter ID dibutuhkan" });
  }

  try {
    const kursus = await prisma.kursus.findUnique({ where: { id } });

    if (!kursus) {
      return res.status(404).json({ message: `Kursus dengan ID ${id} tidak ditemukan.` });
    }

    const deletedKursus = await prisma.kursus.delete({
      where: { id },
    });

    res.status(200).json({ status: 200, message: "Kursus berhasil dihapus", data: deletedKursus });
  } catch (e) {
    res.status(500).json({ status: 500, message: "Gagal menghapus kursus", error: e });
  }
};
