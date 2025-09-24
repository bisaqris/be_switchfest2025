import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import cloudinary from "../config/cloudinary.js";

export const getCompanies = async (req: Request, res: Response) => {
  const companies = await prisma.company.findMany({
    include: {
      _count: {
        select: { hrUsers: true, jobPostings: true },
      },
    },
  });

  return res
    .status(200)
    .json({ status: 200, total: companies.length, data: companies });
};

export const getCompany = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Parameter ID Company dibutuhkan" });
  }

  const Company = await prisma.company.findUnique({
    where: {
      id,
    },
  });

  if (!Company) {
    return res
      .status(404)
      .json({ message: `Company dengan ID ${id} tidak ditemukan.` });
  }

  res.status(200).json({ status: 200, data: Company });
};

const bufferToDataURI = (buffer: Buffer, mimeType: string) => {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
};

export const createCompany = async (req: Request, res: Response) => {
  const { name, description, website, location } = req.body;

  if (!name || !description || !location) {
    return res
      .status(400)
      .json({ message: "Nama, description, location wajib diisi." });
  }

  const company = await prisma.company.findUnique({
    where: {
      name,
    },
  });

  if (company) {
    return res.status(400).json({ message: "Nama sudah digunakan" });
  }

  let logoUrl: string | null = null;

  console.log("BELUM ADA FILENYA");
  if (req.file) {
    console.log("ADA FILENYA");
    try {
      const fileUri = bufferToDataURI(req.file.buffer, req.file.mimetype);
      const uploadResult = await cloudinary.uploader.upload(fileUri, {
        folder: "company_logos",
      });
      logoUrl = uploadResult.secure_url;
    } catch (uploadError) {
      console.error("Gagal mengunggah gambar:", uploadError);
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengunggah gambar." });
    }
  }

  try {
    const newCompany = await prisma.company.create({
      data: {
        name,
        description,
        website,
        location,
        logoUrl,
      },
    });

    res.status(201).json({
      message: "Komunitas berhasil dibuat",
      data: newCompany,
    });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan saat membuat komunitas" });
  }
};

export const updateCompany = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, website, location } = req.body;

  if (!id) {
    return res
      .status(400)
      .json({ message: "Parameter ID komunitas dibutuhkan." });
  }

  try {
    const existingCompany = await prisma.company.findUnique({
      where: { id },
    });
    if (!existingCompany) {
      return res.status(404).json({ message: "Komunitas tidak ditemukan." });
    }

    const updateData: { [key: string]: any } = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;

    if (req.file) {
      if (existingCompany.logoUrl) {
        const publicId = existingCompany.logoUrl
          .split("/")
          .pop()
          ?.split(".")[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`company_logos/${publicId}`);
        }
      }

      const fileUri = bufferToDataURI(req.file.buffer, req.file.mimetype);
      const uploadResult = await cloudinary.uploader.upload(fileUri, {
        folder: "company_logos",
      });
      updateData.logoUrl = uploadResult.secure_url;
    }

    const updatedCompany = await prisma.company.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      message: "Komunitas berhasil diperbarui",
      data: updatedCompany,
    });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan saat memperbarui komunitas" });
  }
};

export const deleteCompany = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Parameter ID dibutuhkan" });
  }

  const Company = await prisma.company.findUnique({
    where: {
      id,
    },
  });

  if (!Company) {
    return res
      .status(400)
      .json({ message: `Company dengan id ${id} tidak ditemukan` });
  }

  const deletedCompany = await prisma.company.delete({
    where: {
      id,
    },
  });

  res.status(200).json({
    status: 200,
    message: "Berhasil Menghapus Company",
    data: deletedCompany,
  });
};
