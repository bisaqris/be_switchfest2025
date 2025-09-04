import express from 'express';
import userRoutes from "./routes/userRoutes.js";
const app = express();
app.use(express.json());
app.use("/users", userRoutes);
app.get("/", (req, res) => {
    res.send("Server TypeScript berjalan!");
});
app.listen(3000, () => {
    console.log("Server berjalan di http://localhost:3000");
});
//# sourceMappingURL=server.js.map