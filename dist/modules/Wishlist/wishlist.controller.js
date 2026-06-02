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
exports.removeFromWishlist = exports.updateWishlist = exports.getWishlist = exports.postWishlist = void 0;
const http_status_1 = __importDefault(require("http-status"));
const wishlist_service_1 = require("./wishlist.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
// POST
const postWishlist = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const wishlistBody = Object.assign(Object.assign({}, req.body), { user_id: userId });
    const result = yield wishlist_service_1.WishlistServices.postWishlistService(wishlistBody);
    return (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: 'Product added to wishlist',
        data: result,
    });
});
exports.postWishlist = postWishlist;
// GET
const getWishlist = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const result = yield wishlist_service_1.WishlistServices.getWishlistService(userId);
    return (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Wishlist fetched successfully',
        data: result,
    });
});
exports.getWishlist = getWishlist;
// UPDATE
const updateWishlist = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const updatedData = req.body;
    const result = yield wishlist_service_1.WishlistServices.updateWishlistService(userId, updatedData);
    return (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Wishlist updated successfully',
        data: result,
    });
});
exports.updateWishlist = updateWishlist;
// Remove
const removeFromWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const productId = req.params.product_id;
    console.log(req.params, 'req.params from removeFromWishlist');
    console.log(productId, 'productId from removeFromWishlist');
    const result = yield wishlist_service_1.WishlistServices.removeFromWishlistService(userId, productId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Product removed from wishlist',
        data: result,
    });
});
exports.removeFromWishlist = removeFromWishlist;
