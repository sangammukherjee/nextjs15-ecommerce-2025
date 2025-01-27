import expess from "express";
import { authenticateJwt, isSuperAdmin } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";
import {
  createProduct,
  deleteProduct,
  fetchAllProductsForAdmin,
  getProductByID,
  updateProduct,
  getProductsForClient,
} from "../controllers/productController";

const router = expess.Router();

router.post(
  "/create-new-product",
  authenticateJwt,
  isSuperAdmin,
  upload.array("images", 5),
  createProduct
);

router.get(
  "/fetch-admin-products",
  authenticateJwt,
  isSuperAdmin,
  fetchAllProductsForAdmin
);

router.get("/fetch-client-products", authenticateJwt, getProductsForClient);
router.get("/:id", authenticateJwt, getProductByID);
router.put("/:id", authenticateJwt, isSuperAdmin, updateProduct);
router.delete("/:id", authenticateJwt, isSuperAdmin, deleteProduct);

export default router;
