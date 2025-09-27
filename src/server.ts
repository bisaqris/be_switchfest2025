import express from "express";
import { Express, Request, Response } from "express";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import lowonganRoutes from "./routes/lowonganRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import kandidatRoutes from "./routes/kandidatRoutes.js";
import { handleCors } from "./middlewares/corsMiddleware.js";
import { checkAuth } from "./middlewares/authMiddleware.js";
import kursusRoutes from "./routes/kursusRoutes.js";

const app: Express = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Server BackEnd berjalan!");
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(handleCors);
app.use("/auth", authRoutes);
app.use("/users", checkAuth, userRoutes);
app.use("/lowongan", checkAuth, lowonganRoutes);
app.use("/community", checkAuth, communityRoutes);
app.use("/company", checkAuth, companyRoutes);
app.use("/kandidat", checkAuth, kandidatRoutes);
app.use("/kursus", checkAuth, kursusRoutes);

app.listen(8000, () => {
  console.log("Server berjalan di http://localhost:8000");
});
