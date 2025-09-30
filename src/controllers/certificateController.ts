import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export const getMyCertificates = async (req: Request, res: Response) => {
    const userId = req.user.userId;
    try {
        const certificates = await prisma.certificate.findMany({
            where: { userId },
            include: {
                kursus: {
                    select: {
                        id: true,
                        title: true,
                        thumbnail: true,
                    }
                }
            },
            orderBy: {
                issuedAt: 'desc'
            }
        });
        res.status(200).json({ data: certificates });
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data sertifikat." });
    }
};

export const getCertificateDetails = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "Parameter ID sertifikat dibutuhkan" });
    }
    try {
        const certificate = await prisma.certificate.findUnique({
            where: { id },
            include: {
                user: { select: { name: true } },
                kursus: { select: { title: true, instructor: true } }
            }
        });

        if (!certificate) {
            return res.status(404).json({ message: "Sertifikat tidak ditemukan." });
        }
        res.status(200).json({ data: certificate });
    } catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};