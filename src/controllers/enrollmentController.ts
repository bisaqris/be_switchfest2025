import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export const createEnrollment = async (req: Request, res: Response) => {
  const { kursusId } = req.params;
  const userId = req.user.userId;

  if (!kursusId) {
    return res.status(400).json({ message: "ID Kursus dibutuhkan." });
  }

  try {
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_kursusId: { userId, kursusId },
      },
    });

    if (existingEnrollment) {
      return res
        .status(400)
        .json({ message: "Anda sudah terdaftar di kursus ini." });
    }

    const newEnrollment = await prisma.enrollment.create({
      data: {
        userId,
        kursusId,
      },
      include: {
        kursus: { select: { title: true } },
      },
    });
    res
      .status(201)
      .json({ message: "Berhasil mendaftar kursus", data: newEnrollment });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mendaftar kursus. Pastikan kursus ada." });
  }
};

export const getMyEnrollments = async (req: Request, res: Response) => {
  const userId = req.user.userId;
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        kursus: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            category: { select: { name: true } },
          },
        },
      },
    });
    res.status(200).json({ data: enrollments });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data pendaftaran." });
  }
};

export const getEnrollmentsForKursus = async (req: Request, res: Response) => {
  const { kursusId } = req.params;
  if (!kursusId) {
    return res.status(400).json({ message: "ID Kursus dibutuhkan." });
  }
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { kursusId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    res.status(200).json({ data: enrollments });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data pendaftar." });
  }
};

export const deleteEnrollment = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Parameter ID pendaftaran dibutuhkan" });
  }
  try {
    await prisma.enrollment.delete({ where: { id } });
    res.status(200).json({ message: "Pendaftaran berhasil dihapus." });
  } catch (error) {
    res.status(404).json({ message: "Data pendaftaran tidak ditemukan." });
  }
};
