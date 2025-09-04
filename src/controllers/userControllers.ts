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
