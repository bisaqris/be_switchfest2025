import { prisma } from "../config/prisma.js";
import argon2 from "argon2";
export const getUsers = async (req, res) => {
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
export const getUser = async (req, res) => {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
        where: {
            id: Number(id),
        },
    });
    res.status(200).json({ status: 200, data: user });
};
export const createUser = async (req, res) => {
    const { email, name, password } = req.body;
    const fields = { email, name, password };
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
    }
    catch (e) {
        console.log(e);
        res.status(500).json({
            status: 500,
            message: "Terjadi Kesalahan saat Create User",
            error: e,
        });
    }
};
//# sourceMappingURL=userControllers.js.map