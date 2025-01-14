import express from "express";
import { authenticateJwt, isSuperAdmin } from "../middleware/authMiddleware";
import {
  createCoupon,
  deleteCoupon,
  fetchAllCoupons,
} from "../controllers/couponController";

const router = express.Router();

router.use(authenticateJwt, isSuperAdmin);

router.get("/fetch-all-coupons", fetchAllCoupons);
router.post("/create-coupon", createCoupon);
router.delete("/:id", deleteCoupon);

export default router;
