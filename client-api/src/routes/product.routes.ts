import { Router } from 'express';
import { getProducts, 
    compareProductPrices, 
    getProductMeta,
    createProduct
} from '../controllers/product.controller';

const router = Router();

// GET /products
router.get('/', getProducts);
    
// GET /products/compare/:productKey
router.get('/compare/:productKey', compareProductPrices);

// GET /products/meta
router.get('/meta', getProductMeta);

// POST /products
router.post("/", createProduct);

export default router;

