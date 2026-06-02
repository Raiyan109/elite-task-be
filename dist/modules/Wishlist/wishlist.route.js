"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middlewares/auth");
const wishlist_controller_1 = require("./wishlist.controller");
const router = express_1.default.Router();
// Create, Update, delete, Get product
router
    .route("/")
    .get((0, auth_1.auth)('user'), wishlist_controller_1.getWishlist)
    .post((0, auth_1.auth)('user'), wishlist_controller_1.postWishlist);
router
    .route("/:product_id")
    .patch((0, auth_1.auth)('user'), wishlist_controller_1.removeFromWishlist);
exports.WishlistRoutes = router;
