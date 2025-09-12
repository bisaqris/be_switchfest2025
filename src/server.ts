import express from "express";
import { Express, Request, Response } from "express";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { handleCors } from "./middlewares/corsMiddleware.js";
import { checkAuth } from "./middlewares/authMiddleware.js";

const app: Express = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Server BackEnd berjalan!");
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(handleCors);
app.use("/auth", authRoutes);
app.use(checkAuth);
app.use("/users", userRoutes);

app.listen(8000, () => {
  console.log("Server berjalan di http://localhost:8000");
});
