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

// GET /products
router.get('/', getProducts);

// GET /products/compare-group/:groupId
router.get('/compare-group/:groupId', compareProductGroupPrices);

// GET /products/groups
router.get("/groups", getProductGroups);

// GET /products/meta
router.get('/meta', getProductMeta);

// POST /products
router.post("/", createProduct);

router.get("/debug/groups", debugProductGroups);

export default router;

