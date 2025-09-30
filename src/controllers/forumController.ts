import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export const getAllThreads = async (req: Request, res: Response) => {
  try {
    const threads = await prisma.forumThread.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { name: true, id: true } },
        _count: { select: { posts: true } },
      },
    });
    res.status(200).json({ data: threads });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data thread." });
  }
};

export const getThreadDetails = async (req: Request, res: Response) => {
  const { threadId } = req.params;
  if(!threadId) {
    return res.status(400).json({ message: "Parameter ID thread dibutuhkan" });
  }
  try {
    const thread = await prisma.forumThread.findUnique({
      where: { id: threadId },
      include: {
        author: { select: { name: true, id: true } },
        posts: {
          include: {
            author: { select: { name: true, id: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!thread) {
      return res.status(404).json({ message: "Thread tidak ditemukan." });
    }
    res.status(200).json({ data: thread });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil detail thread." });
  }
};

export const createThread = async (req: Request, res: Response) => {
  const { title, content } = req.body;
  const authorId = req.user.userId;

  if (!title || !content) {
    return res.status(400).json({ message: "Judul dan konten wajib diisi." });
  }

  try {
    const newThread = await prisma.forumThread.create({
      data: { title, content, authorId },
    });
    res.status(201).json({ message: "Thread berhasil dibuat", data: newThread });
  } catch (error) {
    res.status(500).json({ message: "Gagal membuat thread." });
  }
};

export const createPost = async (req: Request, res: Response) => {
  const { threadId } = req.params;
  const { content } = req.body;
  const authorId = req.user.userId;

  if (!threadId) {
    return res.status(400).json({ message: "Parameter ID thread dibutuhkan." });
  }
  if (!content) {
    return res.status(400).json({ message: "Konten balasan tidak boleh kosong." });
  }

  try {
    const newPost = await prisma.forumPost.create({
      data: {
        content,
        author: {
          connect: { id: authorId },
        },
        thread: {
          connect: { id: threadId },
        },
      },
    });
    res.status(201).json({ message: "Balasan berhasil dikirim", data: newPost });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengirim balasan. Pastikan thread ada." });
  }
};