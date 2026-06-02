"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.deleteCoupon = exports.updateCoupon = exports.checkCoupon = exports.findAllDashboardCoupons = exports.findAllCoupons = exports.createCoupon = void 0;
const http_status_1 = __importDefault(require("http-status"));
const CouponService = __importStar(require("./coupon.service"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const coupon_model_1 = require("./coupon.model");
const order_model_1 = require("../Order/order.model");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const couponNotApplied_model_1 = require("../CouponNotApplied/couponNotApplied.model");
const mongoose_1 = __importDefault(require("mongoose"));
const product_model_1 = __importDefault(require("../Product/product.model"));
const hotDeal_model_1 = require("../HotDeals/hotDeal.model");
const createCoupon = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield CouponService.createCouponService(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: "Coupon created successfully",
        data: result,
    });
});
exports.createCoupon = createCoupon;
const findAllCoupons = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield CouponService.getAllCouponsService();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Coupons fetched successfully",
        data: result,
    });
});
exports.findAllCoupons = findAllCoupons;
exports.findAllDashboardCoupons = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield CouponService.findAllDashboardCouponServices(query);
    // Check if the database collection is empty or no matching data is found
    // if (!result || result.length === 0) {
    //     return sendResponse(res, {
    //         success: false,
    //         statusCode: httpStatus.NOT_FOUND,
    //         message: 'No data found.',
    //         data: [],
    //     });
    // }
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Dashboard coupons retrieved successfully',
        data: result,
    });
}));
const parseDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day); // JS month is 0-based
};
// export const checkCoupon: RequestHandler = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ): Promise<void> => {
//     const userId = req.user?._id;
//     const { coupon_code, orderTotal, product_ids } = req.body;
//     console.log('body from checkCoupon >>>>>>>>>', req.body);
//     const checkBody = {
//         coupon_code,
//         orderTotal,
//         userId
//     };
//     const coupon = await CouponModel.findOne({ coupon_code });
//     if (!coupon) {
//         return sendResponse(res, {
//             success: false,
//             statusCode: httpStatus.NOT_FOUND,
//             message: "Invalid coupon",
//         });
//     }
//     // Check validity
//     const now = new Date();
//     const startDate = parseDate(coupon.coupon_start_date);
//     const endDate = parseDate(coupon.coupon_end_date);
//     console.log('coupon >>>>>>>>>', coupon);
//     console.log('startDate >>>>>>>>>', startDate);
//     console.log('endDate >>>>>>>>>', endDate);
//     console.log('now >>>>>>>>>', now);
//     if (
//         coupon.coupon_status !== "active" ||
//         startDate > now ||
//         endDate < now
//     ) {
//         return sendResponse(res, {
//             success: false,
//             statusCode: httpStatus.NOT_FOUND,
//             message: "Coupon is not valid anymore.",
//         });
//     }
//     // Check min order condition
//     if (orderTotal < coupon.coupon_min_order) {
//         return sendResponse(res, {
//             success: false,
//             statusCode: httpStatus.NOT_FOUND,
//             message: `Order must be at least ৳${coupon.coupon_min_order} to use this coupon.`,
//         });
//     }
//     // Check if user already used this coupon
//     const usedBefore = await OrderModel.exists({
//         order_user_id: userId,
//         "order_details.coupon": coupon._id,
//     });
//     if (usedBefore) {
//         return sendResponse(res, {
//             success: false,
//             statusCode: httpStatus.NOT_FOUND,
//             message: "You have already used this coupon."
//         });
//     }
//     // Fetch all CouponNotApplied documents and populate product details
//     const couponNotAppliedList = await CouponNotAppliedModel.find().populate(
//         "coupon_not_applied_products.product_id"
//     );
//     // Collect all disallowed products across all documents
//     const disallowedMap = new Map<string, string>(); // Map<productId, productName>
//     couponNotAppliedList.forEach((doc) => {
//         doc.coupon_not_applied_products.forEach((item: any) => {
//             if (item.product_id?._id && item.product_id?.product_name) {
//                 const id = item.product_id._id.toString();
//                 const name = item.product_id.product_name;
//                 disallowedMap.set(id, name);
//             }
//         });
//     });
//     // Check incoming product_ids for conflicts with disallowed products
//     const conflictingNames: string[] = [];
//     if (Array.isArray(product_ids)) {
//         product_ids.forEach((id: string) => {
//             const pid = id.toString();
//             if (disallowedMap.has(pid)) {
//                 conflictingNames.push(disallowedMap.get(pid)!);
//             }
//         });
//     }
//     if (conflictingNames.length > 0) {
//         return sendResponse(res, {
//             success: false,
//             statusCode: httpStatus.NOT_FOUND,
//             message: `Can not use coupon for these products: ${conflictingNames.join(", ")}`,
//         });
//     }
//     const result = {
//         couponId: coupon._id,
//         discount: coupon.coupon_discount_amount,
//     }
//     sendResponse(res, {
//         success: true,
//         statusCode: httpStatus.CREATED,
//         message: "Coupon checked successfully",
//         data: result,
//     });
// };
// alternative (more efficient than previous one) 
const checkCoupon = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const { coupon_code, product_ids, cart } = req.body;
        // 1. Find coupon
        const coupon = yield coupon_model_1.CouponModel.findOne({ coupon_code });
        if (!coupon) {
            return (0, sendResponse_1.default)(res, {
                success: false,
                statusCode: http_status_1.default.NOT_FOUND,
                message: "Invalid coupon",
            });
        }
        // 2. Validate coupon status & dates
        const now = new Date();
        const startDate = parseDate(coupon.coupon_start_date);
        const endDate = parseDate(coupon.coupon_end_date);
        if (coupon.coupon_status !== "active" || startDate > now || endDate < now) {
            return (0, sendResponse_1.default)(res, {
                success: false,
                statusCode: http_status_1.default.NOT_FOUND,
                message: "Coupon is not valid anymore.",
            });
        }
        const objectIds = product_ids.map((id) => new mongoose_1.default.Types.ObjectId(id));
        // 3. Fetch products
        const products = yield product_model_1.default.find({ _id: { $in: objectIds } })
            .select("product_price product_discount_price product_name")
            .lean();
        if (!products.length) {
            return (0, sendResponse_1.default)(res, {
                success: false,
                statusCode: http_status_1.default.BAD_REQUEST,
                message: "No valid products found for this coupon",
            });
        }
        // 4. Fetch disallowed products for coupon
        const disallowedDocs = yield couponNotApplied_model_1.CouponNotAppliedModel.find({
            "coupon_not_applied_products.product_id": { $in: objectIds },
        }).select("coupon_not_applied_products.product_id").lean();
        const disallowedIds = new Set();
        disallowedDocs.forEach((doc) => doc.coupon_not_applied_products.forEach((p) => disallowedIds.add(p.product_id.toString())));
        // 5. Fetch hot deal products
        const nowISO = now.toISOString();
        const hotDeals = yield hotDeal_model_1.HotDealModel.find({
            "hotDeal_products.product_id": { $in: objectIds },
            hotDeal_status: "active",
            hotDeal_start_date: { $lte: nowISO },
            hotDeal_end_date: { $gte: nowISO },
        }).select("hotDeal_products").lean();
        // Map productId => hotDeal discount
        const hotDealMap = new Map();
        hotDeals.forEach((deal) => {
            deal.hotDeal_products.forEach((hp) => {
                hotDealMap.set(hp.product_id.toString(), hp.discount_amount);
            });
        });
        // Build a map: productId => cart item
        const cartMap = new Map();
        cart === null || cart === void 0 ? void 0 : cart.forEach((c) => {
            cartMap.set(c._id, c);
        });
        // 6. Calculate eligible & disallowed products and eligible total
        let eligibleTotal = 0;
        const eligibleProducts = [];
        const disallowedProducts = [];
        products.forEach((p) => {
            var _a, _b, _c;
            const pid = p._id.toString();
            let price = (_b = (_a = p.product_discount_price) !== null && _a !== void 0 ? _a : p.product_price) !== null && _b !== void 0 ? _b : 0;
            // Apply hot deal discount if exists
            if (hotDealMap.has(pid)) {
                price -= hotDealMap.get(pid);
            }
            // Find cart item for this product
            // const cartItem = cart.find((c: any) => c._id === pid && c.type === "product");
            const cartItem = cartMap.get(pid);
            const quantity = (_c = cartItem === null || cartItem === void 0 ? void 0 : cartItem.quantity) !== null && _c !== void 0 ? _c : 1; // default to 1 if not found
            if (disallowedIds.has(pid)) {
                disallowedProducts.push(Object.assign(Object.assign({}, p), { quantity }));
            }
            else {
                eligibleProducts.push(Object.assign(Object.assign({}, p), { quantity }));
                eligibleTotal += price * quantity; // ✅ multiply by quantity
            }
        });
        // console.log('eligibleTotal:', eligibleTotal);
        if (eligibleTotal < coupon.coupon_min_order) {
            const disallowedNames = disallowedProducts.map((p) => p.product_name).join(", ");
            return (0, sendResponse_1.default)(res, {
                success: false,
                statusCode: http_status_1.default.BAD_REQUEST,
                message: `Order must be at least ৳${coupon.coupon_min_order} in eligible products to use this coupon.` + (disallowedNames ? ` These products will not be considered for coupon: ${disallowedNames}` : ""),
            });
        }
        // 7. Check if user already used coupon
        const usedBefore = yield order_model_1.OrderModel.exists({
            order_user_id: userId,
            "order_details.coupon": coupon.coupon_code,
        });
        if (usedBefore) {
            return (0, sendResponse_1.default)(res, {
                success: false,
                statusCode: http_status_1.default.FORBIDDEN,
                message: "You have already used this coupon.",
            });
        }
        // 8. Return result
        const result = {
            couponId: coupon._id,
            discount: coupon.coupon_discount_amount,
            eligibleTotal,
            eligibleProducts,
            disallowedProducts,
        };
        return (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_1.default.OK,
            message: "Coupon checked successfully",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.checkCoupon = checkCoupon;
const updateCoupon = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.params;
    const result = yield CouponService.updateCouponService(_id, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Coupon updated successfully",
        data: result,
    });
});
exports.updateCoupon = updateCoupon;
const deleteCoupon = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.params;
    const result = yield CouponService.deleteCouponService(_id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Coupon deleted successfully",
        data: result,
    });
});
exports.deleteCoupon = deleteCoupon;
