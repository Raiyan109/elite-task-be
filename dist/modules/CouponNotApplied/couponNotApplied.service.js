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
exports.CouponNotAppliedServices = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const couponNotApplied_model_1 = require("./couponNotApplied.model");
const createCouponNotAppliedServices = (couponNotApplied) => __awaiter(void 0, void 0, void 0, function* () {
    // const isCouponNotAppliedExists = await CouponNotAppliedModel.findOne({ name: couponNotApplied?._id })
    // if (isCouponNotAppliedExists) {
    //     throw new AppError(httpStatus.CONFLICT, 'Already added!');
    // }
    const result = yield couponNotApplied_model_1.CouponNotAppliedModel.create(couponNotApplied);
    return result;
});
// const findCouponNotAppliedServices = async () => {
//     const result = await CouponNotAppliedModel.find({})//.populate('coupon_not_applied_products.product_id')
//     return result
// }
// const findDashboardCouponNotAppliedServices = async (limit: number, skip: number, searchTerm: string) => {
//     const andCondition: any = [];
//     // if (searchTerm) {
//     //     andCondition.push({
//     //         $or: couponNotAppliedSearchableField.map((field) => ({
//     //             [field]: {
//     //                 $regex: searchTerm,
//     //                 $options: "i",
//     //             },
//     //         })),
//     //     });
//     // }
//     const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};
//     const result = await CouponNotAppliedModel.find(whereCondition)
//         .populate({
//             path: 'coupon_not_applied_products.product_id',
//             select: 'product_name thumbnail_image product_price product_discount_price product_quantity'
//         })
//         .skip(skip)
//         .limit(limit)
//     return result
// }
// alternative (recommended for searching inside populated fields)
const findDashboardCouponNotAppliedServices = (limit, skip, searchTerm) => __awaiter(void 0, void 0, void 0, function* () {
    const pipeline = [
        {
            $lookup: {
                from: "products", // collection name of ProductModel
                localField: "coupon_not_applied_products.product_id",
                foreignField: "_id",
                as: "products",
            },
        },
        {
            $unwind: {
                path: "$products",
                preserveNullAndEmptyArrays: true,
            },
        },
    ];
    if (searchTerm) {
        pipeline.push({
            $match: {
                "products.product_name": {
                    $regex: searchTerm,
                    $options: "i",
                },
            },
        });
    }
    pipeline.push({ $skip: skip }, { $limit: limit }, {
        $project: {
            coupon_not_applied_products: 1,
            coupon_not_applied_publisher_id: 1,
            coupon_not_applied_updated_by: 1,
            "products.product_name": 1,
            "products.thumbnail_image": 1,
            "products.product_price": 1,
            "products.product_discount_price": 1,
            "products.product_quantity": 1,
        },
    });
    const result = yield couponNotApplied_model_1.CouponNotAppliedModel.aggregate(pipeline);
    return result;
});
// get single products
// const findSingleCouponNotAppliedServices = async (id: string) => {
//     const combo = await CouponNotAppliedModel.findOne({
//         combo_slug: id,
//         combo_status: { $in: ['active'] }
//     }).populate('coupon_not_applied_products.product_id')
//         .select("-__v")
//         .lean(); // Use .lean() to return a plain JavaScript object
//     if (!combo) {
//         throw new AppError(404, "Combo Not Found !");
//     }
//     return { ...combo };
// }
// get combos by IDs (cart)
// const findCombosByIdsServices = async (ids: Array<string>) => {
//     const combos = await CouponNotAppliedModel.find({ _id: { $in: ids } }).populate('coupon_not_applied_products.product_id')
//     return combos
// }
const updateCouponNotAppliedServices = (updateData) => __awaiter(void 0, void 0, void 0, function* () {
    // Since there's only one coupon not applied collection data, we'll find and update it directly
    const isCouponNotAppliedExists = yield couponNotApplied_model_1.CouponNotAppliedModel.findOne();
    if (!isCouponNotAppliedExists) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Not found!");
    }
    const result = yield couponNotApplied_model_1.CouponNotAppliedModel.findOneAndUpdate({}, // Empty filter since we're updating the only coupon not applied
    updateData, {
        new: true,
        runValidators: true,
    });
    return result;
});
const deleteCouponNotAppliedServices = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isCouponNotAppliedExists = yield couponNotApplied_model_1.CouponNotAppliedModel.findById(id);
    if (!isCouponNotAppliedExists) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Not found!");
    }
    const result = yield couponNotApplied_model_1.CouponNotAppliedModel.findByIdAndDelete(id);
    return result;
});
exports.CouponNotAppliedServices = {
    createCouponNotAppliedServices,
    //findCouponNotAppliedServices,
    findDashboardCouponNotAppliedServices,
    //findSingleCouponNotAppliedServices,
    //findCouponNotAppliedsByIdsServices,
    updateCouponNotAppliedServices,
    deleteCouponNotAppliedServices,
};
