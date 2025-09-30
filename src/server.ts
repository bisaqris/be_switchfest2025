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
import categoryRoutes from "./routes/categoryRoutes.js";
import topicRoutes from './routes/topicRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js'; 
import forumRoutes from './routes/forumRoutes.js'; 

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
app.use("/category", categoryRoutes);
app.use("/quiz", checkAuth, quizRoutes);
app.use("/topics", checkAuth, topicRoutes);
app.use("/questions", questionRoutes);
app.use("/enrollment", checkAuth, enrollmentRoutes);
app.use("/certificate", checkAuth, certificateRoutes);
app.use("/forum", checkAuth, forumRoutes);

app.listen(8000, () => {
  console.log("Server berjalan di http://localhost:8000");
});
