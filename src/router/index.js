import express from "express";
import CategoryController from "../controller/category.controller.js";
import UserController from "../controller/user.controller.js";
import { auth } from "../middleware/auth.middleware.js";
const router = express.Router();
// -------- user --------
router.get("/user/selectAll",auth,UserController.selectAll)
router.get("/user/selectOne/:uuid",auth,UserController.selectOne)
router.post("/user/login",UserController.login);
router.post("/user/register",UserController.register);
router.put("/user/update/:uuid",auth,UserController.updateUser);
router.put("/user/forgot",UserController.forgotPassword);
router.put("/user/updatePassword/:uuid",auth,UserController.updatePassword);
router.put("/user/refreshToken",auth,UserController.refreshToken);
router.put("/user/updateProfile/:uuid",auth,UserController.updateProfile);
router.delete("/user/delete/:uuid",auth,UserController.deleteUser);
// -------- category --------
router.get("/category/selectAll",auth,CategoryController.selectAll);
router.get("/cateogry/selectOne/:cUuid",auth,CategoryController.selectOne);
router.post("/category/insert",auth,CategoryController.insert);
router.put("/category/update/:cUuid",auth,CategoryController.updateCategory);
router.delete("/category/delete/:cUuid",auth,CategoryController.deleteCategory);

export default router;