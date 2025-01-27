import express from "express";
import { authenticateJwt } from "../middleware/authMiddleware";
import {
  addToCart,
  clearEntireCart,
  getCart,
  removeFromCart,
  updateCartItemQuantity,
} from "../controllers/cartController";

const router = express.Router();

router.get("/fetch-cart", authenticateJwt, getCart);
router.post("/add-to-cart", authenticateJwt, addToCart);
router.delete("/remove/:id", authenticateJwt, removeFromCart);
router.put("/update/:id", authenticateJwt, updateCartItemQuantity);
router.post("/clear-cart", authenticateJwt, clearEntireCart);

export default router;
