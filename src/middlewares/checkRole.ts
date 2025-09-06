import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

export const checkRole = (roles: String[]) => {
  return function (req: Request, res: Response, next: Function) {
    const user = req.user as JwtPayload;

    if (user && roles.includes(user.role)) {
      next();
    } else {
      res
        .status(403)
        .json({ message: "Yahaha gak punya akses yaaa~~, kasiann!" });
    }
  };
};
