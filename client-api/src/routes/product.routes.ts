import { Router } from 'express';
import {
  getProducts,
  getProductMeta,
  createProduct,
  compareProductGroupPrices,
  getProductGroups,
  debugProductGroups,
} from "../controllers/product.controller";

const router = Router();

router.get("/meta", getProductMeta);
router.get("/debug/groups", debugProductGroups);
router.get("/groups", getProductGroups);
router.get("/groups/:groupId/compare", compareProductGroupPrices);
//router.get("/compare/:productKey", compareProductPrices);
router.get("/", getProducts);
router.post("/", createProduct);

export default router;

