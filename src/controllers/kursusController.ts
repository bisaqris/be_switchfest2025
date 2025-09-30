import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import cloudinary from "../config/cloudinary.js";

const bufferToDataURI = (buffer: Buffer, mimeType: string) =>
  `data:${mimeType};base64,${buffer.toString("base64")}`;

export const getKursusList = async (req: Request, res: Response) => {
  try {
    const kursusList = await prisma.kursus.findMany({
      include: {
        category: { select: { name: true } },
        _count: { select: { enrollments: true } },
      },
    });
    res.status(200).json({ total: kursusList.length, data: kursusList });
  } catch (e) {
    res.status(500).json({ message: "Gagal mengambil data kursus", error: e });
  }
};

export const getKursus = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Parameter ID kursus dibutuhkan" });
  }
  try {
    const kursus = await prisma.kursus.findUnique({
      where: { id },
      include: {
        category: { select: { name: true } },
      },
    });
    if (!kursus) {
      return res
        .status(404)
        .json({ message: `Kursus dengan ID ${id} tidak ditemukan.` });
    }
    res.status(200).json({ data: kursus });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

export const createKursus = async (req: Request, res: Response) => {
  const {
    title,
    description,
    instructor,
    duration,
    lessonCount,
    rating,
    categoryId,
  } = req.body;

  if (
    !title ||
    !description ||
    !instructor ||
    !duration ||
    !lessonCount ||
    !rating ||
    !categoryId
  ) {
    return res.status(400).json({ message: "Semua field wajib diisi." });
  }

  let thumbnailUrl: string | null = null;
  if (req.file) {
    try {
      const fileUri = bufferToDataURI(req.file.buffer, req.file.mimetype);
      const uploadResult = await cloudinary.uploader.upload(fileUri, {
        folder: "kursus_thumbnails",
      });
      thumbnailUrl = uploadResult.secure_url;
    } catch (uploadError) {
      return res.status(500).json({ message: "Gagal mengunggah gambar." });
    }
  }

  try {
    const newKursus = await prisma.kursus.create({
      data: {
        title,
        description,
        instructor,
        duration: parseInt(duration),
        lessonCount: parseInt(lessonCount),
        rating: parseFloat(rating),
        thumbnail: thumbnailUrl,
        categoryId,
      },
    });
    res
      .status(201)
      .json({ message: "Kursus berhasil dibuat", data: newKursus });
  } catch (e) {
    res.status(500).json({ message: "Gagal membuat kursus", error: e });
  }
};

export const updateKursus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    title,
    description,
    instructor,
    duration,
    lessonCount,
    rating,
    categoryId,
  } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Parameter ID kursus dibutuhkan" });
  }

  const updateData: any = {};
  if (title) updateData.title = title;
  if (description) updateData.description = description;
  if (instructor) updateData.instructor = instructor;
  if (duration) updateData.duration = parseInt(duration);
  if (lessonCount) updateData.lessonCount = parseInt(lessonCount);
  if (rating) updateData.rating = parseFloat(rating);
  if (categoryId) updateData.categoryId = categoryId;

  try {
    const updatedKursus = await prisma.kursus.update({
      where: { id },
      data: updateData,
    });
    res
      .status(200)
      .json({ message: "Kursus berhasil diperbarui", data: updatedKursus });
  } catch (e) {
    res
      .status(404)
      .json({ message: `Kursus dengan ID ${id} tidak ditemukan.` });
  }
};

export const deleteKursus = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Parameter ID kursus dibutuhkan" });
  }
  try {
    await prisma.kursus.delete({ where: { id } });
    res.status(200).json({ message: "Kursus berhasil dihapus" });
  } catch (e) {
    res
      .status(404)
      .json({ message: `Kursus dengan ID ${id} tidak ditemukan.` });
  }
};

export const getEnrolledKursusDetail = async (req: Request, res: Response) => {
  const { kursusId } = req.params;
  const userId = req.user.userId;

  if (!kursusId) {
    return res.status(400).json({ message: "Kursus ID dibutuhkan" });
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_kursusId: { userId, kursusId } },
  });
  if (!enrollment) {
    return res
      .status(403)
      .json({ message: "Akses ditolak. Anda belum terdaftar." });
  }

  if (!kursusId) {
    return res.status(400).json({ message: "Parameter ID kursus dibutuhkan" });
  }

  const kursus = await prisma.kursus.findUnique({
    where: { id: kursusId },
    include: {
      topics: {
        include: {
          quiz: { include: { questions: { include: { answers: true } } } },
        },
      },
    },
  });
  res.json({ data: kursus });
};

export const enrollKursus = async (req: Request, res: Response) => {
  const { kursusId } = req.params;
  const userId = req.user.userId;

  if (!kursusId) {
    return res.status(400).json({ message: "Kursus ID dibutuhkan" });
  }

  try {
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { userId_kursusId: { userId, kursusId } },
    });
    if (existingEnrollment) {
      return res
        .status(400)
        .json({ message: "Anda sudah terdaftar di kursus ini." });
    }
    const enrollment = await prisma.enrollment.create({
      data: { userId, kursusId },
    });
    res
      .status(201)
      .json({ message: "Berhasil mendaftar kursus", data: enrollment });
  } catch (error) {
    res.status(500).json({ message: "Gagal mendaftar kursus" });
  }
};
