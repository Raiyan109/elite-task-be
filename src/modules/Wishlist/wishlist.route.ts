import express from "express";
import { auth } from "../../middlewares/auth";
import { getWishlist, postWishlist, removeFromWishlist, updateWishlist } from "./wishlist.controller";

const router = express.Router();

// Create, Update, delete, Get product
router
    .route("/")
    .get(auth('user'), getWishlist)
    .post(auth('user'), postWishlist)

router
    .route("/:product_id")
    .patch(auth('user'), removeFromWishlist)

export const WishlistRoutes = router;