import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import argon2 from "argon2";

export const getUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  return res
    .status(200)
    .json({ status: 200, total: users.length, data: users });
};

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Parameter ID user dibutuhkan" });
  }

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    return res
      .status(404)
      .json({ message: `User dengan ID ${id} tidak ditemukan.` });
  }

  res.status(200).json({ status: 200, data: user });
};

export const createUser = async (req: Request, res: Response) => {
  const { email, name, password, role, companyId } = req.body;

  const fields: { [key: string]: string } = { email, name, password, role };

  for (let field in fields) {
    if (!fields[field]) {
      return res.status(400).json({ message: `${field} is required` });
    }
  }

  const userExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (userExist) {
    return res.status(400).json({ message: "Username already exists." });
  }

  const hashedPassword = await argon2.hash(password);
  try {
    const createUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        companyId,
      },
    });

    res.status(200).json({
      status: 200,
      message: "Create User Successfully",
      data: createUser,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      status: 500,
      message: "Terjadi Kesalahan saat Create User",
      error: e,
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password, role, companyId } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Parameter ID user dibutuhkan" });
  }

  const updateData: { [key: string]: any } = {};

  if (name !== undefined) updateData.name = name;
  if (role !== undefined) updateData.role = role;
  if (companyId !== undefined) updateData.companyId = companyId;

  if (email) {
    const userWithSameEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (userWithSameEmail && userWithSameEmail.id !== id) {
      return res
        .status(400)
        .json({ message: "Email sudah digunakan oleh pengguna lain." });
    }
    updateData.email = email;
  }

  if (password) {
    updateData.password = await argon2.hash(password);
  }

  if (Object.keys(updateData).length === 0) {
    return res
      .status(400)
      .json({ message: "Tidak ada data yang valid untuk di-update." });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    res.status(200).json({ status: 200, data: updatedUser });
  } catch (e) {
    console.error(e);
    res.status(404).json({ message: `User dengan ID ${id} tidak ditemukan.` });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Parameter ID dibutuhkan" });
  }

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    return res
      .status(400)
      .json({ message: `User dengan id ${id} tidak ditemukan` });
  }

  const deletedUser = await prisma.user.delete({
    where: {
      id,
    },
  });

  res.status(200).json({
    status: 200,
    message: "Berhasil Menghapus user",
    data: deletedUser,
  });
};

export const getCompany = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "parameter ID dibutuhkan" });
  }

  try {
    const kandidat = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        company: true,
      },
    });

    if (!kandidat) {
      return res
        .status(404)
        .json({ message: "kandidat tidak ditemukan pada user" });
    }

    res.status(200).json({ status: 200, data: kandidat });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: e });
  }
};

export const getKandidat = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "parameter ID dibutuhkan" });
  }

  try {
    const kandidat = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        applications: true,
      },
    });

    if (!kandidat) {
      return res
        .status(404)
        .json({ message: "kandidat tidak ditemukan pada user" });
    }

    res.status(200).json({ status: 200, data: kandidat });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: e });
  }
};

export const getKursus = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "parameter ID dibutuhkan" });
  }

  try {
    const kursus = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        enrolledCourses: true,
      },
    });

    if (!kursus) {
      return res
        .status(404)
        .json({ status: 404, message: "kursus tidak ditemukan pada user" });
    }

    res.status(200).json({ status: 200, data: kursus });
  } catch (e) {
    res.status(500).json({
      status: 500,
      message: "Terjadi kesalahan pada server",
      error: e,
    });
  }
};

export const getCommunity = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "parameter ID dibutuhkan" });
  }

  try {
    const community = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        communities: true,
      },
    });

    if (!community) {
      return res
        .status(404)
        .json({ status: 404, message: "Community tidak ditemukan pada user" });
    }

    res.status(200).json({ status: 200, message: community });
  } catch (e) {
    res.status(500).json({
      status: 500,
      message: "Terjadi kesalahan pada server",
      error: e,
    });
  }
};
