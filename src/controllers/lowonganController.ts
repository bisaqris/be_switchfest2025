import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export const getLowongans = async (req: Request, res: Response) => {
  const lowongan = await prisma.lowongan.findMany({
    include: {
      company: {
        select: {
          name: true,
        },
      },
      _count: {
        select: { candidates: true },
      },
    },
  });

  return res
    .status(200)
    .json({ status: 200, total: lowongan.length, data: lowongan });
};

export const getLowongan = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json({ message: "Parameter ID lowongan dibutuhkan" });
  }

  const lowongan = await prisma.lowongan.findUnique({
    where: {
      id,
    },
  });

  if (!lowongan) {
    return res
      .status(404)
      .json({ message: `lowongan dengan ID ${id} tidak ditemukan.` });
  }

  res.status(200).json({ status: 200, data: lowongan });
};

export const createlowongan = async (req: Request, res: Response) => {
  const { title, description, location, jobType, salaryRange } = req.body;

  const loggedInUserId = req.user.userId;

  const fields: { [key: string]: string } = {
    title,
    description,
    location,
    jobType,
  };

  for (let field in fields) {
    if (!fields[field]) {
      return res.status(400).json({ message: `${field} is required` });
    }
  }

  try {
    const hrUser = await prisma.user.findUnique({
      where: { id: loggedInUserId },
    });

    if (!hrUser || hrUser.role !== "hr" || !hrUser.companyId) {
      return res.status(403).json({
        message:
          "Akses ditolak: Anda bukan HR atau tidak terhubung dengan perusahaan.",
      });
    }

    const createlowongan = await prisma.lowongan.create({
      data: {
        title,
        description,
        location,
        jobType,
        salaryRange,
        company: {
          connect: {
            id: hrUser.companyId,
          },
        },
      },
    });

    res.status(200).json({
      status: 200,
      message: "Create lowongan Successfully",
      data: createlowongan,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      status: 500,
      message: "Terjadi Kesalahan saat Create lowongan",
      error: e,
    });
  }
};

export const updateLowongan = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, location, jobType, salaryRange } = req.body;
  const loggedInUserId = req.user.userId;

  if (!id) {
    return res
      .status(400)
      .json({ message: "Parameter ID lowongan dibutuhkan" });
  }

  try {
    const existingLowongan = await prisma.lowongan.findUnique({
      where: { id },
    });

    if (!existingLowongan) {
      return res
        .status(404)
        .json({ message: `Lowongan dengan ID ${id} tidak ditemukan.` });
    }

    const hrUser = await prisma.user.findUnique({
      where: { id: loggedInUserId },
    });

    if (hrUser?.companyId !== existingLowongan.companyId) {
      return res.status(403).json({
        message: "Akses ditolak: Anda tidak berhak mengedit lowongan ini.",
      });
    }

    const updateData: { [key: string]: any } = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (location) updateData.location = location;
    if (jobType) updateData.jobType = jobType;
    if (salaryRange) updateData.salaryRange = salaryRange;

    const updatedLowongan = await prisma.lowongan.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({ status: 200, data: updatedLowongan });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Gagal meng-update lowongan", error: e });
  }
};

export const deletelowongan = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Parameter ID dibutuhkan" });
  }

  const lowongan = await prisma.lowongan.findUnique({
    where: {
      id,
    },
  });

  if (!lowongan) {
    return res
      .status(400)
      .json({ message: `Lowongan dengan id ${id} tidak ditemukan` });
  }

  const deletedlowongan = await prisma.lowongan.delete({
    where: {
      id,
    },
  });

  res.status(200).json({
    status: 200,
    message: "Berhasil Menghapus lowongan",
    data: deletedlowongan,
  });
};
