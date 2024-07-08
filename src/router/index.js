import express from "express";
import BannerController from "../controller/banner.controller.js";
import CategoryController from "../controller/category.controller.js";
import OrderController from "../controller/order.controller.js";
import OrderDetailController from "../controller/orderDetail.controller.js";
import ProductController from "../controller/product.controller.js";
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
router.get("/category/selectOne/:cUuid",auth,CategoryController.selectOne);
router.post("/category/insert",auth,CategoryController.insert);
router.put("/category/update/:cUuid",auth,CategoryController.updateCategory);
router.delete("/category/delete/:cUuid",auth,CategoryController.deleteCategory);
// --------- product ---------
router.get("/product/selectAll",auth,ProductController.selectAll);
router.get("/product/search",auth,ProductController.searchProduct);
router.get("/product/selectOne/:pUuid",auth,ProductController.selectOne);
router.post("/product/insert",auth,ProductController.insert);
router.put("/product/update/:pUuid",auth,ProductController.updateProduct);
router.delete("/product/delete/:pUuid",auth,ProductController.deleteProduct);
// ---------- banner ---------
router.get("/banner/selectAll",auth,BannerController.selectAll);
router.get("/banner/selectOne/:bUuid",auth,BannerController.selectOne);
router.post("/banner/insert",auth,BannerController.insert);
router.put("/banner/update/:bUuid",auth,BannerController.updateBanner);
router.delete("/banner/delete/:bUuid",auth,BannerController.deleteBanner);
// ----------- order ---------
router.get("/orders/selectAll",auth,OrderController.selectAll);
router.get("/orders/selectOne/:oUuid",auth,OrderController.selectOne);
router.post("/orders/insert",auth,OrderController.insert);
router.put("/orders/update/:oUuid",auth,OrderController.updateOrderStatus);
router.delete("/orders/delete/:oUuid",auth,OrderController.deleteOrder);
// ----------- order detail -------
router.get("/order_detail/selectAll",auth,OrderDetailController.selectAll);
router.get("/order_detail/selectOne/:ordUuid",auth,OrderDetailController.selectOne);
router.get("/order_detail/selectBy/:orders_id",auth,OrderDetailController.selectBy);
router.post("/order_detail/insert",auth,OrderDetailController.insert);

export default router;