"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const cart_service_1 = require("./cart.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const postCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // const userId = req.user?._id;
    const cartData = Object.assign({}, req.body);
    console.log(cartData, 'cartData from cart controller');
    const result = yield cart_service_1.CartServices.postCartService(cartData);
    return (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Cart created successfully",
        data: result,
    });
});
const incrementQuantity = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const { productId } = req.params;
    console.log('productId >>>>>>>>>', productId);
    const result = yield cart_service_1.CartServices.incrementProductQuantityService(userId, productId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Product quantity increased",
        data: result,
    });
});
const decrementQuantity = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const { productId } = req.params;
    const result = yield cart_service_1.CartServices.decrementProductQuantityService(userId, productId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Product quantity updated",
        data: result,
    });
});
const removeCartItem = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const { productId } = req.params;
    const result = yield cart_service_1.CartServices.removeCartItemService(userId, productId);
    return (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: result ? "Item removed from cart" : "Item removed, cart deleted (was last item)",
        data: result,
    });
});
const getCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    console.log(userId, "user from cart controller");
    const result = yield cart_service_1.CartServices.getCartService(userId);
    return (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Cart fetched successfully",
        data: result,
    });
});
exports.CartController = {
    postCart,
    incrementQuantity,
    decrementQuantity,
    removeCartItem,
    getCart,
};
