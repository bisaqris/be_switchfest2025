import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import cloudinary from "../config/cloudinary.js";

export const getCommunities = async (req: Request, res: Response) => {
  const communities = await prisma.community.findMany();

  return res
    .status(200)
    .json({ status: 200, total: communities.length, data: communities });
};

export const getCommunity = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json({ message: "Parameter ID community dibutuhkan" });
  }

  const community = await prisma.community.findUnique({
    where: {
      id,
    },
  });

  if (!community) {
    return res
      .status(404)
      .json({ message: `community dengan ID ${id} tidak ditemukan.` });
  }

  res.status(200).json({ status: 200, data: community });
};

interface MulterFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

const bufferToDataURI = (buffer: Buffer, mimeType: string) => {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
};

export const createCommunity = async (req: Request, res: Response) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ message: "Nama dan deskripsi wajib diisi." });
  }

  const community = await prisma.community.findUnique({
    where: {
      name,
    },
  });

  if (community) {
    return res.status(400).json({ message: "Nama sudah digunakan" });
  }

  let coverImageUrl: string | null = null;

  console.log("BELUM ADA FILENYA");
  if (req.file) {
    console.log("ADA FILENYA");
    try {
      const fileUri = bufferToDataURI(req.file.buffer, req.file.mimetype);
      const uploadResult = await cloudinary.uploader.upload(fileUri, {
        folder: "community_covers",
      });
      coverImageUrl = uploadResult.secure_url;
    } catch (uploadError) {
      console.error("Gagal mengunggah gambar:", uploadError);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah gambar." });
    }
  }

  try {
    const newCommunity = await prisma.community.create({
      data: {
        name,
        description,
        coverImageUrl,
      },
    });

    res.status(201).json({
      message: "Komunitas berhasil dibuat",
      data: newCommunity,
    });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan saat membuat komunitas" });
  }
};

export const updateCommunity = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!id) {
    return res
      .status(400)
      .json({ message: "Parameter ID komunitas dibutuhkan." });
  }

  try {
    const existingCommunity = await prisma.community.findUnique({
      where: { id },
    });
    if (!existingCommunity) {
      return res.status(404).json({ message: "Komunitas tidak ditemukan." });
    }

    const updateData: { [key: string]: any } = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;

    if (req.file) {
      if (existingCommunity.coverImageUrl) {
        const publicId = existingCommunity.coverImageUrl
          .split("/")
          .pop()
          ?.split(".")[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`community_covers/${publicId}`);
        }
      }

      const fileUri = bufferToDataURI(req.file.buffer, req.file.mimetype);
      const uploadResult = await cloudinary.uploader.upload(fileUri, {
        folder: "community_covers",
      });
      updateData.coverImageUrl = uploadResult.secure_url;
    }

    const updatedCommunity = await prisma.community.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      message: "Komunitas berhasil diperbarui",
      data: updatedCommunity,
    });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan saat memperbarui komunitas" });
  }
};

export const deletecommunity = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Parameter ID dibutuhkan" });
  }

  try {
    const community = await prisma.community.findUnique({ where: { id } });
    if (!community) {
      return res
        .status(404)
        .json({ message: `Komunitas dengan id ${id} tidak ditemukan` });
    }

    if (community.coverImageUrl) {
      const publicId = community.coverImageUrl.split("/").pop()?.split(".")[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`community_covers/${publicId}`);
      }
    }

    const deletedCommunity = await prisma.community.delete({ where: { id } });
    res.status(200).json({
      status: 200,
      message: "Berhasil Menghapus community",
      data: deletedCommunity,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};
