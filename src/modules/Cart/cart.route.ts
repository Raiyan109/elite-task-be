import express from "express";

import { auth } from "../../middlewares/auth";
import { CartController } from "./cart.controller";

const router = express.Router();

// Create, Update, Get Address
router
    .route("/")
    .get(auth('user'), CartController.getCart)
    .post(/*auth('user'),*/ CartController.postCart)

router.patch("/increment/:productId", auth('user'), CartController.incrementQuantity);
router.patch("/decrement/:productId", auth('user'), CartController.decrementQuantity);
router.delete("/remove/:productId", auth('user'), CartController.removeCartItem);

export const CartRoutes = router;