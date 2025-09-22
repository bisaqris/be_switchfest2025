import express from "express";
import { Express, Request, Response } from "express";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import { handleCors } from "./middlewares/corsMiddleware.js";
import { checkAuth } from "./middlewares/authMiddleware.js";
import uploadWithLogging from "./middlewares/uploadMiddleware.js";

const app: Express = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Server BackEnd berjalan!");
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(handleCors);
app.use("/auth", authRoutes);
app.use("/users", checkAuth, userRoutes);
app.use("/community", checkAuth, communityRoutes);

app.listen(8000, () => {
  console.log("Server berjalan di http://localhost:8000");
});
