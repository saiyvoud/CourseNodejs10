import express from "express";
import UserController from "../controller/user.controller.js";
const router = express.Router();
// -------- user --------
router.post("/user/login",UserController.login);
router.post("/user/register",UserController.register);

export default router;