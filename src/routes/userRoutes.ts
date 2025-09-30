import express from "express";
import { Router } from "express";
import {
  createUser,
  deleteUser,
  getUser,
  getUserApplications,
  getUserEnrollments,
  getUsers,
  updateUser,
} from "../controllers/userControllers.js";
import rateLimit from "express-rate-limit";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { checkRole } from "../middlewares/checkRole.js";

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

router.get("/", checkRole(["admin"]), getUsers);
router.get("/:id", checkRole(["admin"]), getUser);
router.post("/", limiter, checkRole(["admin"]), createUser);
router.patch("/:id", limiter, checkRole(["admin"]), updateUser);
router.delete("/:id", checkRole(["admin"]), deleteUser);

router.get("/:id/applications", checkRole(["admin"]), getUserApplications);
router.get("/:id/enrollments", checkRole(["admin"]), getUserEnrollments);


export default router;
