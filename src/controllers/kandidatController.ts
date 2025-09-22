import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import cloudinary from "../config/cloudinary.js";

const bufferToDataURI = (buffer: Buffer, mimeType: string) =>
  `data:${mimeType};base64,${buffer.toString("base64")}`;
interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

export const applyForJob = async (req: RequestWithFile, res: Response) => {
  const { jobId } = req.params;
  const { coverLetter } = req.body;
  const userId = req.user.userId;

  if (!jobId) {
    return res
      .status(400)
      .json({ message: "Parameter ID lowongan dibutuhkan." });
  }
  if (!req.file) {
    return res.status(400).json({ message: "File resume wajib diunggah." });
  }

  try {
    const existingApplication = await prisma.kandidat.findUnique({
      where: { userId_jobId: { userId, jobId } },
    });

    if (existingApplication) {
      return res
        .status(400)
        .json({ message: "Anda sudah pernah melamar lowongan ini." });
    }

    const fileUri = bufferToDataURI(req.file.buffer, req.file.mimetype);
    const uploadResult = await cloudinary.uploader.upload(fileUri, {
      folder: "resumes",
    });
    const resumeUrl = uploadResult.secure_url;

    const newKandidat = await prisma.kandidat.create({
      data: {
        resumeUrl,
        coverLetter,
        status: "Applied",
        user: { connect: { id: userId } },
        job: { connect: { id: jobId } },
      },
    });

    res
      .status(201)
      .json({ message: "Lamaran berhasil dikirim", data: newKandidat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

export const getCandidatesForJob = async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const hrUserId = req.user.userId;

  if (!jobId) {
    return res
      .status(400)
      .json({ message: "Parameter ID lowongan dibutuhkan." });
  }

  try {
    const candidates = await prisma.kandidat.findMany({
      where: { jobId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.status(200).json({ data: candidates });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

export const getMyApplications = async (req: Request, res: Response) => {
  const userId = req.user.userId;
  try {
    const applications = await prisma.kandidat.findMany({
      where: { userId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: { select: { name: true } },
          },
        },
      },
    });
    res.status(200).json({ data: applications });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

export const updateCandidateStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const hrUserId = req.user.userId;

  if (!id) {
    return res
      .status(400)
      .json({ message: "Parameter ID kandidat dibutuhkan." });
  }

  try {
    const updatedKandidat = await prisma.kandidat.update({
      where: { id },
      data: { status },
    });

    res.status(200).json({
      message: "Status kandidat berhasil diubah",
      data: updatedKandidat,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

export const withdrawApplication = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user.userId;

  if (!id) {
    return res
      .status(400)
      .json({ message: "Parameter ID kandidat dibutuhkan." });
  }

  try {
    const kandidat = await prisma.kandidat.findUnique({ where: { id } });
    if (!kandidat || kandidat.userId !== userId) {
      return res.status(403).json({ message: "Akses ditolak." });
    }

    await prisma.kandidat.delete({ where: { id } });

    res.status(200).json({ message: "Lamaran berhasil ditarik." });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};
