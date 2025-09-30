import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export const getTopicsForKursus = async (req: Request, res: Response) => {
  const { kursusId } = req.params;
  if (!kursusId) {
    return res.status(400).json({ message: "Kursus ID dibutuhkan" });
  }
  try {
    const topics = await prisma.topic.findMany({
      where: { kursusId },
      orderBy: { createdAt: "asc" },
    });
    res.status(200).json({ data: topics });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data topik." });
  }
};

export const getTopic = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "ID dibutuhkan" });
  }
  try {
    const topic = await prisma.topic.findUnique({ where: { id } });
    if (!topic) {
      return res.status(404).json({ message: "Topik tidak ditemukan." });
    }
    res.status(200).json({ data: topic });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

export const createTopic = async (req: Request, res: Response) => {
  const { kursusId } = req.params;
  const { title, content, videoUrl } = req.body;

  if (!kursusId) {
    return res.status(400).json({ message: "Parameter ID kursus dibutuhkan." });
  }
  if (!title || !content) {
    return res.status(400).json({ message: "Judul dan konten wajib diisi." });
  }

  try {
    const newTopic = await prisma.topic.create({
      data: {
        title,
        content,
        videoUrl,
        kursus: {
          connect: {
            id: kursusId,
          },
        },
      },
    });
    res.status(201).json({ message: "Topik berhasil dibuat", data: newTopic });
  } catch (error) {
    // Error ini bisa terjadi jika kursusId tidak valid
    res.status(500).json({ message: "Gagal membuat topik. Pastikan kursus ada." });
  }
};

export const updateTopic = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content, videoUrl } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Parameter ID kursus dibutuhkan" });
  }
  try {
    const updatedTopic = await prisma.topic.update({
      where: { id },
      data: { title, content, videoUrl },
    });
    res
      .status(200)
      .json({ message: "Topik berhasil diperbarui", data: updatedTopic });
  } catch (error) {
    res.status(404).json({ message: "Topik tidak ditemukan." });
  }
};

export const deleteTopic = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Parameter ID kursus dibutuhkan" });
  }
  try {
    await prisma.topic.delete({ where: { id } });
    res.status(200).json({ message: "Topik berhasil dihapus." });
  } catch (error) {
    res.status(404).json({ message: "Topik tidak ditemukan." });
  }
};
