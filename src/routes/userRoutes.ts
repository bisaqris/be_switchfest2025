import express from 'express'
import { Router } from "express";
import { createUser, getUser, getUsers } from "../controllers/userControllers.js";

const router: Router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUser);
router.post("/", createUser);

export default router;
