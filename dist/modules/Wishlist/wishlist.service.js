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
exports.WishlistServices = void 0;
const wishlist_model_1 = require("./wishlist.model");
const checkAvailability_1 = require("../../utils/checkAvailability");
const product_model_1 = __importDefault(require("../Product/product.model"));
const combo_model_1 = require("../Combo/combo.model");
// CREATE Wishlist
const postWishlistService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingWishlist = yield wishlist_model_1.WishlistModel.findOne({ user_id: payload.user_id });
    if (existingWishlist) {
        // const alreadyExists = existingWishlist.product_id.includes(payload.product_id as any);
        const alreadyExists = existingWishlist.product_id.some((pid) => {
            const id = typeof pid === 'object' && 'toString' in pid ? pid.toString() : String(pid);
            return id === payload.product_id.toString();
        });
        if (alreadyExists) {
            throw new Error('Product already in wishlist');
        }
        existingWishlist.product_id.push(payload.product_id);
        yield existingWishlist.save();
        return existingWishlist;
    }
    else {
        const newWishlist = yield wishlist_model_1.WishlistModel.create({
            user_id: payload.user_id,
            product_id: [payload.product_id],
        });
        return newWishlist;
    }
});
// GET Wishlist (by user ID)
const getWishlistService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // 1. Fetch the wishlist document
    const wishlist = yield wishlist_model_1.WishlistModel.findOne({ user_id: userId }).lean();
    if (!wishlist || !((_a = wishlist.product_id) === null || _a === void 0 ? void 0 : _a.length))
        return { product_id: [] };
    const ids = wishlist.product_id;
    // 2. Fetch all products and combos in parallel
    const [products, combos] = yield Promise.all([
        product_model_1.default.find({ _id: { $in: ids } })
            .select("_id product_name product_slug category_id thumbnail_image product_price product_discount_price product_quantity discount_show availability type product_status product_inactivity_start product_inactivity_end")
            .populate("category_id", "_id category_name")
            .lean(),
        combo_model_1.ComboModel.find({ _id: { $in: ids } })
            .select("_id combo_title combo_slug combo_status combo_image combo_products")
            .populate({
            path: "combo_products.product_id",
            select: "_id product_name product_slug product_price product_discount_price thumbnail_image availability product_status",
        })
            .lean(),
    ]);
    // 3. Convert to lookup maps
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));
    const comboMap = new Map(combos.map((c) => [c._id.toString(), c]));
    // 4. Enrich the wishlist: keep original order
    const enriched = ids
        .map((id) => {
        const key = id.toString();
        if (productMap.has(key)) {
            const product = productMap.get(key);
            return Object.assign(Object.assign({}, product), { item_type: "product", availability: (0, checkAvailability_1.checkProductAvailability)(product) });
        }
        if (comboMap.has(key)) {
            const combo = comboMap.get(key);
            return Object.assign(Object.assign({}, combo), { item_type: "combo", availability: { isAvailable: true } });
        }
        return null; // ID not found
    })
        .filter(Boolean);
    return Object.assign(Object.assign({}, wishlist), { product_id: enriched });
});
// UPDATE Wishlist (replace product list for a user)
const updateWishlistService = (userId, updatedData) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield wishlist_model_1.WishlistModel.findOneAndUpdate({ user_id: userId }, { $set: updatedData }, { new: true });
    return result;
});
// Remove Wishlist 
const removeFromWishlistService = (userId, productId) => __awaiter(void 0, void 0, void 0, function* () {
    const wishlist = yield wishlist_model_1.WishlistModel.findOne({ user_id: userId });
    if (!wishlist)
        throw new Error('Wishlist not found');
    wishlist.product_id = wishlist.product_id.filter((id) => id.toString() !== productId);
    yield wishlist.save();
    return wishlist;
});
exports.WishlistServices = {
    postWishlistService,
    getWishlistService,
    updateWishlistService,
    removeFromWishlistService,
};
