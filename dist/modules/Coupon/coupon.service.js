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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCouponService = exports.updateCouponService = exports.findAllDashboardCouponServices = exports.getAllCouponsService = exports.createCouponService = void 0;
const coupon_interface_1 = require("./coupon.interface");
const coupon_model_1 = require("./coupon.model");
const createCouponService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield coupon_model_1.CouponModel.create(payload);
    return result;
});
exports.createCouponService = createCouponService;
const getAllCouponsService = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield coupon_model_1.CouponModel.find();
    return result;
});
exports.getAllCouponsService = getAllCouponsService;
// find all dashboard Reviews
const findAllDashboardCouponServices = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerm } = queryParams;
    const page = Number(queryParams.page) || 1;
    const limit = Number(queryParams.limit) || 20;
    const skip = (page - 1) * limit;
    const andCondition = [];
    // if (searchTerm) {
    //     andCondition.push({
    //         $regex: searchTerm,
    //         $options: "i",
    //     });
    // }
    // if (searchTerm) {
    //     andCondition.push({
    //         $or: couponSearchableField.map((field) => ({
    //             [field]: {
    //                 $regex: searchTerm,
    //                 $options: "i",
    //             },
    //         })),
    //     });
    // }
    if (searchTerm) {
        const orConditions = [];
        coupon_interface_1.couponSearchableField.forEach(({ field, type }) => {
            if (type === "string") {
                orConditions.push({
                    [field]: { $regex: searchTerm, $options: "i" },
                });
            }
            else if (type === "number" && !isNaN(Number(searchTerm))) {
                orConditions.push({
                    [field]: Number(searchTerm),
                });
            }
        });
        if (orConditions.length) {
            andCondition.push({ $or: orConditions });
        }
    }
    const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};
    const result = yield coupon_model_1.CouponModel.find(whereCondition)
        .skip(skip)
        .limit(limit)
        .select("-__v");
    return result;
});
exports.findAllDashboardCouponServices = findAllDashboardCouponServices;
const updateCouponService = (_id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield coupon_model_1.CouponModel.findByIdAndUpdate(_id, payload, { new: true });
    return result;
});
exports.updateCouponService = updateCouponService;
const deleteCouponService = (_id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield coupon_model_1.CouponModel.findByIdAndDelete(_id);
    return result;
});
exports.deleteCouponService = deleteCouponService;
