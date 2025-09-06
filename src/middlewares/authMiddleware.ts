import { NextFunction, Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user: any;
    }
  }
}

export const checkAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Auth Error: No Bearer token provided" });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as Secret);
    console.log("PPPPPP", decoded);
    req.user = decoded;
    next();
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: "Invalid Token" });
  }
};
