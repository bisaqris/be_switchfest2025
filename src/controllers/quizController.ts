import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export const createQuiz = async (req: Request, res: Response) => {
  const { topicId } = req.params;
  const { title, questions } = req.body;

  if (!topicId) {
    return res.status(400).json({ message: "Parameter ID topik dibutuhkan." });
  }
  if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ message: "Judul dan setidaknya satu pertanyaan wajib diisi." });
  }

  try {
    const newQuiz = await prisma.quiz.create({
      data: {
        title,
        topic: {
          connect: {
            id: topicId,
          },
        },
        questions: {
          create: questions.map((q: any) => ({
            text: q.text,
            answers: {
              create: q.answers.map((a: any) => ({
                text: a.text,
                isCorrect: a.isCorrect,
              })),
            },
          })),
        },
      },
      include: { questions: { include: { answers: true } } },
    });
    res.status(201).json({ message: "Kuis berhasil dibuat", data: newQuiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal membuat kuis. Pastikan topik ada." });
  }
};

export const getQuizForUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Parameter ID kuis dibutuhkan" });
  }
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            answers: {
              select: { id: true, text: true },
            },
          },
        },
      },
    });
    if (!quiz) {
      return res.status(404).json({ message: "Kuis tidak ditemukan." });
    }
    res.status(200).json({ data: quiz });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data kuis." });
  }
};

export const submitQuiz = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const { answers } = req.body;

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ message: "Format jawaban tidak valid." });
  }

  if (!id) {
    return res.status(400).json({ message: "Parameter ID kuis dibutuhkan" });
  }

  try {
    const questions = await prisma.question.findMany({
      where: { quizId: id },
      include: { answers: true },
    });

    let correctAnswersCount = 0;
    for (const question of questions) {
      const correctAnswer = question.answers.find((a) => a.isCorrect);
      const userAnswer = answers.find((a) => a.questionId === question.id);

      if (
        correctAnswer &&
        userAnswer &&
        correctAnswer.id === userAnswer.answerId
      ) {
        correctAnswersCount++;
      }
    }

    const score = (correctAnswersCount / questions.length) * 100;
    const isPassed = score >= 80;

    if (isPassed) {
      const quiz = await prisma.quiz.findUnique({
        where: { id },
        include: { topic: true },
      });
      const kursusId = quiz!.topic.kursusId;

      await prisma.certificate.create({
        data: { userId, kursusId },
      });

      return res
        .status(200)
        .json({
          message: `Selamat, Anda lulus dengan skor ${score.toFixed(0)}!`,
          passed: true,
        });
    } else {
      return res
        .status(200)
        .json({
          message: `Skor Anda ${score.toFixed(
            0
          )}. Anda belum lulus, coba lagi!`,
          passed: false,
        });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan saat memproses kuis." });
  }
};

export const deleteQuiz = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Parameter ID kuis dibutuhkan" });
  }
  try {
    await prisma.quiz.delete({ where: { id } });
    res.status(200).json({ message: "Kuis berhasil dihapus." });
  } catch (error) {
    res.status(404).json({ message: "Kuis tidak ditemukan." });
  }
};
