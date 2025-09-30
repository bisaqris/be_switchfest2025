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
      companyId: true,
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
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      companyId: true,
      company: true,
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

  if (!email || !name || !password) {
    return res
      .status(400)
      .json({ message: `Email, nama, dan password wajib diisi.` });
  }

  try {
    const userExist = await prisma.user.findUnique({ where: { email } });
    if (userExist) {
      return res.status(400).json({ message: "Email sudah terdaftar." });
    }

    const hashedPassword = await argon2.hash(password);

    const dataToCreate: any = {
      email,
      name,
      password: hashedPassword,
      role,
    };

    if (companyId) {
      dataToCreate.companyId = companyId;
    }

    const newUser = await prisma.user.create({ data: dataToCreate });

    res.status(201).json({
      status: 201,
      message: "Pengguna berhasil dibuat",
      data: newUser,
    });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan saat membuat pengguna" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password, role, companyId } = req.body;

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
  if (!id) {
    return res.status(400).json({ message: "Parameter ID user dibutuhkan" });
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
    return res.status(400).json({ message: "Parameter ID user dibutuhkan" });
  }

  try {
    const deletedUser = await prisma.user.delete({ where: { id } });
    res
      .status(200)
      .json({ message: "Pengguna berhasil dihapus", data: deletedUser });
  } catch (e) {
    console.error(e);
    res.status(404).json({ message: `User dengan ID ${id} tidak ditemukan.` });
  }
};

export const getUserApplications = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Parameter ID user dibutuhkan" });
  }
  try {
    const applications = await prisma.kandidat.findMany({
      where: { userId: id },
      include: {
        job: { select: { title: true, company: { select: { name: true } } } },
      },
    });
    res.status(200).json({ data: applications });
  } catch (e) {
    res.status(500).json({ message: "Gagal mengambil data lamaran" });
  }
};

export const getUserEnrollments = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "ID dibutuhkan" });
  }
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: id },
      include: { kursus: { select: { title: true } } },
    });
    res.status(200).json({ data: enrollments });
  } catch (e) {
    res.status(500).json({ message: "Gagal mengambil data kursus" });
  }
};
