import express, { Router } from "express";
import {
  createCommunity,
  deletecommunity,
  getCommunities,
  updateCommunity,
} from "../controllers/communityController.js";
import { getCommunity } from "../controllers/userControllers.js";
import rateLimit from "express-rate-limit";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { checkAuth } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";
import uploadWithLogging from "../middlewares/uploadMiddleware.js";

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

router.get("/", getCommunities);
router.get("/:id", getCommunity);
router.post(
  "/",
  limiter,
  checkAuth,
  checkRole(["admin"]),
  uploadWithLogging("coverImageUrl"),
  createCommunity
);
router.patch(
  "/:id",
  checkAuth,
  uploadWithLogging("coverImageUrl"),
  updateCommunity
);
router.delete("/:id", checkAuth, checkRole(["admin"]), deletecommunity);

export default router;
