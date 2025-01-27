import express from "express";
import { authenticateJwt, isSuperAdmin } from "../middleware/authMiddleware";
import {
  createCoupon,
  deleteCoupon,
  fetchAllCoupons,
} from "../controllers/couponController";

const router = express.Router();

router.use(authenticateJwt);

router.get("/fetch-all-coupons", fetchAllCoupons);
router.post("/create-coupon", isSuperAdmin, createCoupon);
router.delete("/:id", isSuperAdmin, deleteCoupon);

export default router;
