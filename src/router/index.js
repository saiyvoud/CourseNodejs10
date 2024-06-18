import express from "express";
import UserController from "../controller/user.controller.js";
import { auth } from "../middleware/auth.middleware.js";
const router = express.Router();
// -------- user --------
router.get("/user/selectAll",auth,UserController.selectAll)
router.post("/user/login",UserController.login);
router.post("/user/register",UserController.register);

export default router;