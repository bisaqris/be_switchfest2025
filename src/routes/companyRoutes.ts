import express from "express";
import { Router } from "express";
import { checkAuth } from "../middlewares/authMiddleware.js";
import rateLimit from "express-rate-limit";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { checkRole } from "../middlewares/checkRole.js";
import uploadWithLogging from "../middlewares/uploadMiddleware.js";
import {
  createCompany,
  deleteCompany,
  getCompanies,
  getCompany,
  updateCompany,
} from "../controllers/companyController.js";

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,
  message: "Too many request, please try again later",
  keyGenerator: function (req) {
    const authHeader = req.headers.authorization;
    let key = "anonymous";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      if (token) {
        try {
          const decodedToken = jwt.verify(
            token,
            process.env.JWT_SECRET as Secret
          ) as JwtPayload;

          if (decodedToken.userId) {
            key = decodedToken.userId;
          }
        } catch (error) {
          console.error("Invalid token for rate limiting");
        }
      }
    }

    return key;
  },
});

const router: Router = express.Router();

router.get("/", getCompanies);
router.get("/:id", getCompany);
router.post(
  "/",
  limiter,
  checkAuth,
  checkRole(["admin", "role"]),
  uploadWithLogging("logoUrl"),
  createCompany
);
router.patch(
  "/:id",
  checkAuth,
  checkRole(["admin", "role"]),
  uploadWithLogging("logoUrl"),
  updateCompany
);
router.delete("/:id", checkAuth, checkRole(["admin", "role"]), deleteCompany);

export default router;
