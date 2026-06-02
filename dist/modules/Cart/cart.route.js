"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middlewares/auth");
const cart_controller_1 = require("./cart.controller");
const router = express_1.default.Router();
// Create, Update, Get Address
router
    .route("/")
    .get((0, auth_1.auth)('user'), cart_controller_1.CartController.getCart)
    .post(/*auth('user'),*/ cart_controller_1.CartController.postCart);
router.patch("/increment/:productId", (0, auth_1.auth)('user'), cart_controller_1.CartController.incrementQuantity);
router.patch("/decrement/:productId", (0, auth_1.auth)('user'), cart_controller_1.CartController.decrementQuantity);
router.delete("/remove/:productId", (0, auth_1.auth)('user'), cart_controller_1.CartController.removeCartItem);
exports.CartRoutes = router;
