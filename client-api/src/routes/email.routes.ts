import { Router } from "express";
import { sendShoppingList } from "../controllers/email.controller";

const router = Router();

router.post("/", sendShoppingList);

export default router;