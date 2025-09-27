import express, { Router } from "express";
import rateLimit from "express-rate-limit";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { checkAuth } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";
import {
  createlowongan,
  deletelowongan,
  getLowongan,
  getLowongans,
  updateLowongan,
} from "../controllers/lowonganController.js";
import uploadWithLogging from "../middlewares/uploadMiddleware.js";
import { applyForJob, getCandidatesForJob } from "../controllers/kandidatController.js";

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

router.get("/", getLowongans);
router.get("/:id", getLowongan);
router.post(
  "/",
  limiter,
  checkAuth,
  checkRole(["admin", "hr"]),
  createlowongan
);
router.patch("/:id", checkAuth, checkRole(["admin", "hr"]), updateLowongan);
router.delete("/:id", checkAuth, checkRole(["admin", "hr"]), deletelowongan);

router.post(
  "/:jobId/apply",
  checkAuth,
  uploadWithLogging("resumeUrl"),
  applyForJob
);

router.get(
  "/:jobId/candidates",
  checkAuth,
  checkRole(["admin", "hr"]),
  getCandidatesForJob
);

export default router;
