import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import cloudinary from "../config/cloudinary.js";

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        courses: {
          include: {
            _count: {
              select: { enrollments: true },
            },
          },
        },
      },
    });

    const aggregatedCategories = categories.map((category) => {
      let totalEnrolledUsers = 0;
      let totalLessonCount = 0;
      let totalRating = 0;
      const courseCount = category.courses.length;

      for (const course of category.courses) {
        totalEnrolledUsers += course._count.enrollments;
        totalLessonCount += course.lessonCount;
        totalRating += course.rating;
      }

      const averageRating = courseCount > 0 ? totalRating / courseCount : 0;

      return {
        id: category.id,
        name: category.name,
        totalEnrolledUsers,
        totalLessonCount,
        averageRating: parseFloat(averageRating.toFixed(1)),
        courseCount,
      };
    });

    res.status(200).json({ data: aggregatedCategories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

export const getCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ message: "Parameter ID kategori dibutuhkan" });
  }
  try {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return res.status(404).json({ message: "Kategori tidak ditemukan." });
    }
    res.status(200).json({ data: category });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

const bufferToDataURI = (buffer: Buffer, mimeType: string) =>
  `data:${mimeType};base64,${buffer.toString("base64")}`;

export const createCategory = async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Nama kategori wajib diisi." });
  }

  let thumbnailUrl: string | null = null;
  if (req.file) {
    try {
      const fileUri = bufferToDataURI(req.file.buffer, req.file.mimetype);
      const uploadResult = await cloudinary.uploader.upload(fileUri, {
        folder: "category_thumbnails",
      });
      thumbnailUrl = uploadResult.secure_url;
    } catch (uploadError) {
      return res.status(500).json({ message: "Gagal mengunggah gambar." });
    }
  }

  try {
    const newCategory = await prisma.category.create({
      data: {
        name,
        thumbnail: thumbnailUrl,
      },
    });
    res
      .status(201)
      .json({ message: "Kategori berhasil dibuat", data: newCategory });
  } catch (error) {
    res.status(400).json({ message: "Nama kategori sudah ada." });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!id) {
    return res
      .status(400)
      .json({ message: "Parameter ID kategori dibutuhkan" });
  }
  if (!name) {
    return res.status(400).json({ message: "Nama kategori wajib diisi." });
  }

  try {
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name },
    });
    res
      .status(200)
      .json({ message: "Kategori berhasil diperbarui", data: updatedCategory });
  } catch (error) {
    res
      .status(404)
      .json({ message: "Kategori tidak ditemukan atau nama sudah digunakan." });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ message: "Parameter ID kategori dibutuhkan" });
  }
  try {
    await prisma.category.delete({ where: { id } });
    res.status(200).json({ message: "Kategori berhasil dihapus." });
  } catch (error) {
    res.status(400).json({
      message:
        "Gagal menghapus kategori. Pastikan tidak ada kursus yang menggunakan kategori ini.",
    });
  }
};
