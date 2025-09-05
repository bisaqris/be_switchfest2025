import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export const register = async (req: Request, res: Response) => {
  const { email, name, password } = req.body;

  const fields: { [key: string]: string } = { email, name, password };

  for (let field in fields) {
    if (!fields[field]) {
      return res.status(400).json({ message: `${field} is required` });
    }
  }

  const emailExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (emailExists) {
    res.status(400).json({ message: "Email sudah digunakkan" });
  }

  try {
    const hashedPassword = await argon2.hash(password);
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error("JWT_SECRET tidak diatur di file.env");
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat konfigurasi server." });
    }

    const token = jwt.sign({ userId: newUser.id }, jwtSecret, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "Registerasi Berhasil!",
      data: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
      token: token,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      status: 500,
      message: "Terjadi Kesalahan saat Registerasi",
      error: e,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const fields: { [key: string]: string } = { email, password };

    for (let field in fields) {
      if (!fields[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await argon2.verify(user.password, password))) {
      return res.status(400).json({ message: "Email atau password salah" });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET tidak diatur di file .env");
    }

    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: "1h" });

    res.status(200).json({
      message: "Login Berhasil",
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      status: 500,
      message: "Terjadi Kesalahan saat Registerasi",
      error: e,
    });
  }
};
