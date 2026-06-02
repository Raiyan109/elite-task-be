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
exports.HotDealServices = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const checkAvailability_1 = require("../../utils/checkAvailability");
const hotDeal_model_1 = require("./hotDeal.model");
const http_status_1 = __importDefault(require("http-status"));
const createHotDealServices = (hotDeal) => __awaiter(void 0, void 0, void 0, function* () {
    const isHotDealExists = yield hotDeal_model_1.HotDealModel.findOne({ name: hotDeal.hotDeal_title });
    if (isHotDealExists) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'This hotDeal is already exists!');
    }
    const result = yield hotDeal_model_1.HotDealModel.create(hotDeal);
    return result;
});
// const findHotDealServices = async () => {
//     const currentDate = new Date();
//     const result = await HotDealModel.find({ hotDeal_status: 'active', hotDeal_end_date: { $gte: currentDate } }).populate('hotDeal_products.product_id')
//     return result[0]
// }
const findHotDealServices = () => __awaiter(void 0, void 0, void 0, function* () {
    const currentDate = new Date();
    const hotDeal = yield hotDeal_model_1.HotDealModel
        .find({ hotDeal_status: 'active', hotDeal_end_date: { $gte: currentDate } })
        //.populate('hotDeal_products.product_id')
        .populate({
        path: 'hotDeal_products.product_id',
        match: { product_status: { $in: ['active', 'temporary-in-active'] } }, // ✅ only active products
    })
        .lean();
    const response = hotDeal.map(deal => {
        const hotDeal_products = deal.hotDeal_products.filter((p) => p.product_id && typeof p.product_id === "object" && "product_name" in p.product_id).map(product => {
            var _a;
            const prod = product.product_id;
            if (prod && typeof prod === 'object' && 'product_name' in prod) {
                const product_id = Object.assign(Object.assign({}, product.product_id), { availability: (0, checkAvailability_1.checkProductAvailability)(prod) });
                return {
                    product_id,
                    discount_amount: (_a = product.discount_amount) !== null && _a !== void 0 ? _a : 0,
                };
            }
        });
        return {
            hotDeal_title: deal.hotDeal_title,
            hotDeal_description: deal.hotDeal_description,
            hotDeal_slug: deal.hotDeal_slug,
            hotDeal_start_date: deal.hotDeal_start_date,
            hotDeal_end_date: deal.hotDeal_end_date,
            hotDeal_status: deal.hotDeal_status,
            hotDeal_image: deal.hotDeal_image,
            hotDeal_image_key: deal.hotDeal_image_key,
            hotDeal_products
        };
    });
    return response[0];
});
const findDashboardHotDealServices = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield hotDeal_model_1.HotDealModel.find({}).populate({
        path: 'hotDeal_products.product_id',
        select: 'product_name thumbnail_image product_price product_discount_price product_quantity'
    });
    return result;
});
// get single products
const findSingleHotDealServices = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const hotDeal = yield hotDeal_model_1.HotDealModel.findOne({
        hotDeal_slug: id,
        hotDeal_status: { $in: ['active'] }
    }).populate('hotDeal_products.product_id')
        .select("-__v")
        .lean(); // Use .lean() to return a plain JavaScript object
    if (!hotDeal) {
        throw new AppError_1.default(404, "HotDeal Not Found !");
    }
    return Object.assign({}, hotDeal);
});
// get hotDeals by IDs (cart)
const findHotDealsByIdsServices = (ids) => __awaiter(void 0, void 0, void 0, function* () {
    const hotDeals = yield hotDeal_model_1.HotDealModel.find({ _id: { $in: ids } }).populate('hotDeal_products.product_id');
    return hotDeals;
});
const updateHotDealServices = (updateData) => __awaiter(void 0, void 0, void 0, function* () {
    // Since there's only one hot deal, we'll find and update it directly
    const existingHotDeal = yield hotDeal_model_1.HotDealModel.findOne();
    if (!existingHotDeal) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Hot deal not found');
    }
    // Check if title is being updated and if it already exists
    if (updateData.hotDeal_title && updateData.hotDeal_title !== existingHotDeal.hotDeal_title) {
        const isTitleExists = yield hotDeal_model_1.HotDealModel.findOne({
            hotDeal_title: updateData.hotDeal_title
        });
        if (isTitleExists) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, 'This hot deal title already exists!');
        }
    }
    // Update fields
    const updatedHotDeal = yield hotDeal_model_1.HotDealModel.findOneAndUpdate({}, // Empty filter since we're updating the only hot deal
    { $set: updateData }, { new: true, runValidators: true });
    return updatedHotDeal;
});
exports.HotDealServices = {
    createHotDealServices,
    findHotDealServices,
    findDashboardHotDealServices,
    findSingleHotDealServices,
    findHotDealsByIdsServices,
    updateHotDealServices
};
