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
exports.CouponNotAppliedController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const couponNotApplied_service_1 = require("./couponNotApplied.service");
const mongoose_1 = __importStar(require("mongoose"));
const couponNotApplied_model_1 = require("./couponNotApplied.model");
const createCouponNotApplied = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requestData = req.body;
        // Parse coupon_not_applied_products (it's sent as stringified JSON)
        // let parsedCouponNotAppliedProducts;
        // try {
        //     parsedCouponNotAppliedProducts = JSON.parse(requestData.coupon_not_applied_products);
        // } catch (err) {
        //     throw new AppError(httpStatus.BAD_REQUEST, "Invalid coupon_not_applied_products format. Must be a valid JSON array.");
        // }
        // Inline check for existing products
        const productIds = requestData.coupon_not_applied_products.map((p) => mongoose_1.default.Types.ObjectId.createFromHexString(p.product_id));
        const existingEntries = yield couponNotApplied_model_1.CouponNotAppliedModel.find({
            "coupon_not_applied_products.product_id": { $in: productIds }
        });
        if (existingEntries.length > 0) {
            const existingIds = [];
            existingEntries.forEach((entry) => {
                entry.coupon_not_applied_products.forEach((p) => {
                    if (productIds.some((id) => id.equals(p.product_id))) {
                        existingIds.push(p.product_id.toString());
                    }
                });
            });
            throw new AppError_1.default(http_status_1.default.CONFLICT, `Products already exist: ${[...new Set(existingIds)].join(", ")}`);
        }
        // Construct coupon not applied data object
        const couponNotAppliedData = Object.assign(Object.assign({}, requestData), { coupon_not_applied_products: requestData.coupon_not_applied_products });
        const result = yield couponNotApplied_service_1.CouponNotAppliedServices.createCouponNotAppliedServices(couponNotAppliedData);
        if (result) {
            return (0, sendResponse_1.default)(res, {
                success: true,
                statusCode: http_status_1.default.OK,
                message: "Coupon not applied list Added Successfully!",
                data: result,
            });
        }
        else {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Coupon not applied list creation failed.");
        }
    }
    catch (error) {
        next(error);
    }
}));
// const findAllCombo = catchAsync(async (req, res, next: NextFunction) => {
//     const query = req.query; // Get all query parameters
//     // Step 1: Fetch products using the service
//     const combos = await CouponNotAppliedServices.findCouponNotAppliedServices();
//     //console.log(products.length);
//     // Step 2: Check if no data is found
//     if (!combos || combos.length === 0) {
//         return sendResponse(res, {
//             success: true,
//             statusCode: httpStatus.NO_CONTENT,
//             message: 'No data found.',
//             data: [],
//         });
//     }
//     // Step 3: Send the response
//     sendResponse(res, {
//         success: true,
//         statusCode: httpStatus.OK,
//         message: 'Combos retrieved successfully',
//         // totalData: totalCount,  // Include the total count here
//         data: combos,
//     });
// });
const findDashboardCouponNotApplied = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10, searchTerm = '' } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;
    // Step 1: Fetch products using the service
    const couponNotApplied = yield couponNotApplied_service_1.CouponNotAppliedServices.findDashboardCouponNotAppliedServices(limitNumber, skip, searchTerm);
    // Step 2: Check if no data is found
    // if (!couponNotApplied || couponNotApplied.length === 0) {
    //     return sendResponse(res, {
    //         success: true,
    //         statusCode: httpStatus.NO_CONTENT,
    //         message: 'No data found.',
    //         data: [],
    //     });
    // }
    // Step 3: Send the response
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Dashboard Coupon Not Applied data list retrieved successfully',
        // totalData: totalCount,  // Include the total count here
        data: couponNotApplied,
    });
}));
// get single product
// const findSingleCombo = catchAsync(async (req, res, next: NextFunction) => {
//     const { id } = req.params; // Get all query parameters
//     // Step 1: Fetch product using the service
//     const combo = await CouponNotAppliedServices.findSingleCouponNotAppliedServices(id);
//     // Step 2: Check if no data is found
//     if (!combo) {
//         return sendResponse(res, {
//             success: true,
//             statusCode: httpStatus.NO_CONTENT,
//             message: 'No data found.',
//             data: [],
//         });
//     }
//     // Step 4: Send the response
//     sendResponse(res, {
//         success: true,
//         statusCode: httpStatus.OK,
//         message: 'Single combo retrieved successfully',
//         data: combo,
//     });
// });
// get combos by IDs
// const findCombosByIds = catchAsync(async (req, res, next: NextFunction) => {
//     const { ids } = req.body; // Get all query parameters
//     // Step 1: Fetch product using the service
//     const combo = await CouponNotAppliedServices.findCombosByIdsServices(ids);
//     // Step 2: Check if no data is found
//     if (!combo) {
//         return sendResponse(res, {
//             success: false,
//             statusCode: httpStatus.NOT_FOUND,
//             message: 'No data found.',
//             data: [],
//         });
//     }
//     // Step 4: Send the response
//     sendResponse(res, {
//         success: true,
//         statusCode: httpStatus.OK,
//         message: 'Combos by IDs retrieved successfully',
//         data: combo,
//     });
// });
const updateCouponNotApplied = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const couponNotAppliedId = req.params.id;
        const requestData = req.body;
        // Handle coupon_not_applied_products parsing
        // if (requestData.coupon_not_applied_products && typeof requestData.coupon_not_applied_products === "string") {
        //     try {
        //         requestData.coupon_not_applied_products = JSON.parse(requestData.coupon_not_applied_products);
        //     } catch (err) {
        //         throw new AppError(httpStatus.BAD_REQUEST, "Invalid coupon_not_applied_products format. Must be a valid JSON array.");
        //     }
        // }
        // Inline check for existing products
        const productIds = requestData.coupon_not_applied_products
            .filter((p) => mongoose_1.Types.ObjectId.isValid(p.product_id))
            .map((p) => mongoose_1.Types.ObjectId.createFromHexString(p.product_id));
        const existingEntries = yield couponNotApplied_model_1.CouponNotAppliedModel.find({
            "coupon_not_applied_products.product_id": { $in: productIds }
        });
        if (existingEntries.length > 0) {
            const existingIds = [];
            existingEntries.forEach((entry) => {
                entry.coupon_not_applied_products.forEach((p) => {
                    if (productIds.some((id) => id.equals(p.product_id))) {
                        existingIds.push(p.product_id.toString());
                    }
                });
            });
            throw new AppError_1.default(http_status_1.default.CONFLICT, `Products already exist: ${[...new Set(existingIds)].join(", ")}`);
        }
        // Construct coupon not applied data object
        const couponNotAppliedData = Object.assign(Object.assign({}, requestData), { coupon_not_applied_products: requestData.coupon_not_applied_products });
        const result = yield couponNotApplied_service_1.CouponNotAppliedServices.updateCouponNotAppliedServices(couponNotAppliedData);
        return (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_1.default.OK,
            message: "Info updated successfully!",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}));
const deleteCouponNotApplied = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const couponNotAppliedId = req.params.id;
        const result = yield couponNotApplied_service_1.CouponNotAppliedServices.deleteCouponNotAppliedServices(couponNotAppliedId);
        return (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_1.default.OK,
            message: "Coupon not applied list data deleted successfully!",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.CouponNotAppliedController = {
    createCouponNotApplied,
    //findAllCombo,
    findDashboardCouponNotApplied,
    //findSingleCombo,
    // findCombosByIds,
    updateCouponNotApplied,
    deleteCouponNotApplied,
};
