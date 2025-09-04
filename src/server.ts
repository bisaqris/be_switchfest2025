import express from 'express' 
import { Express, Request, Response } from "express";
import userRoutes from "./routes/userRoutes.js";

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/users", userRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Server TypeScript berjalan!");
});

app.listen(3000, () => {
  console.log("Server berjalan di http://localhost:3000");
});
