import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export const createQuestion = async (req: Request, res: Response) => {
  const { quizId } = req.params;
  const { text, answers } = req.body;

  if (!quizId) {
    return res.status(400).json({ message: "Parameter ID kuis dibutuhkan." });
  }
  if (
    !text ||
    !answers ||
    !Array.isArray(answers) ||
    answers.length < 2 ||
    !answers.some((a) => a.isCorrect)
  ) {
    return res
      .status(400)
      .json({
        message:
          "Teks pertanyaan dan minimal 2 jawaban (salah satunya benar) wajib diisi.",
      });
  }

  try {
    const newQuestion = await prisma.question.create({
      data: {
        text,
        quiz: {
          connect: {
            id: quizId,
          },
        },
        answers: {
          create: answers.map((a: { text: string; isCorrect: boolean }) => ({
            text: a.text,
            isCorrect: a.isCorrect,
          })),
        },
      },
      include: { answers: true },
    });
    res
      .status(201)
      .json({ message: "Pertanyaan berhasil ditambahkan", data: newQuestion });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal menambahkan pertanyaan. Pastikan kuis ada." });
  }
};

export const updateQuestion = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { text, answers } = req.body;

  if (!id) {
    return res
      .status(400)
      .json({ message: "Parameter ID pertanyaan dibutuhkan" });
  }

  try {
    const updatedQuestion = await prisma.$transaction(async (tx) => {
      const question = await tx.question.update({
        where: { id },
        data: { text },
      });

      if (answers && Array.isArray(answers)) {
        for (const answer of answers) {
          await tx.answer.update({
            where: { id: answer.id },
            data: { text: answer.text, isCorrect: answer.isCorrect },
          });
        }
      }
      return question;
    });

    res.status(200).json({
      message: "Pertanyaan berhasil diperbarui",
      data: updatedQuestion,
    });
  } catch (error) {
    res
      .status(404)
      .json({ message: "Pertanyaan tidak ditemukan atau gagal diperbarui." });
  }
};

export const deleteQuestion = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ message: "Parameter ID pertanyaan dibutuhkan" });
  }
  try {
    await prisma.question.delete({ where: { id } });
    res.status(200).json({ message: "Pertanyaan berhasil dihapus." });
  } catch (error) {
    res.status(404).json({ message: "Pertanyaan tidak ditemukan." });
  }
};
