import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import argon2 from "argon2";

export const getUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
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
  const { email, name, password } = req.body;

  const fields: { [key: string]: string } = { email, name, password };

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
  const { email } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Parameter Id dibutuhkan" });
  }

  const emailExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (emailExists) {
    return res.status(400).json({ message: "Email sudah digunakan" });
  }

  const updateData: { [key: string]: any } = {};

  const fieldsMap = ["email", "name"];

  for (let key of fieldsMap) {
    if (req.body[key] !== undefined) {
      updateData[key] = req.body[key] || null;
    }
  }

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    return res
      .status(404)
      .json({ message: `User dengan id ${id} tidak ditemukan.` });
  }

  if (email) {
    const userExists = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (userExists && userExists.email !== email) {
      return res.status(400).json({ message: "Email already exists" });
    }
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ message: "Tidak ada data yang dikirim" });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: updateData,
    });
    res.status(200).json({ status: 200, data: updatedUser });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Gagal update user", error: e });
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
