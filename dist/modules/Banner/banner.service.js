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
exports.BannerService = exports.deleteBannerServices = exports.findAllDashboardBannerServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const banner_model_1 = require("./banner.model");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
// Create Banners
const createBannerServices = (banner) => __awaiter(void 0, void 0, void 0, function* () {
    // const isBannerExists = await BannerModel.findOne({ name: banner.banner_title_english })
    // if (isBannerExists) {
    //   throw new AppError(httpStatus.CONFLICT, 'This banner is already exists!');
    // }
    const result = yield banner_model_1.BannerModel.create(banner);
    return result;
});
// Find Banners
const findBannersServices = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    const banner_position = queryParams.banner_position;
    // Build initial query with category filter if provided
    const initialQuery = {
        banner_status: {
            $in: ['active']
        }
    };
    if (banner_position) {
        initialQuery.banner_position = banner_position;
    }
    const modelQuery = banner_model_1.BannerModel.find(initialQuery).sort({ banner_serial: 1 }); // Initial Mongoose query
    const query = new QueryBuilder_1.default(modelQuery, queryParams)
        .search(['banner_title_english']) // Provide searchable fields
        // .filter()
        .sort()
        .paginate();
    // .fields();
    const result = yield query.modelQuery; // Execute the query
    // const result = await query.modelQuery.sort({ sequence: 1 }); // Execute the query
    return result;
});
// find all dashboard Banners
const findAllDashboardBannerServices = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    const modelQuery = banner_model_1.BannerModel.find().sort({ banner_serial: 1 });
    const query = new QueryBuilder_1.default(modelQuery, queryParams)
        .search(['banner_title_english']) // Provide searchable fields
        // .filter()
        .sort()
        .paginate();
    // .fields();
    const result = yield query.modelQuery; // Execute the query
    return result;
});
exports.findAllDashboardBannerServices = findAllDashboardBannerServices;
// Update Banners
const updateBannerServices = (banner, _id) => __awaiter(void 0, void 0, void 0, function* () {
    const updateBannerInfo = yield banner_model_1.BannerModel.findOne({ _id: _id });
    if (!updateBannerInfo) {
        return {};
    }
    const Brand = yield banner_model_1.BannerModel.findByIdAndUpdate({ _id: _id }, { $set: banner }, // ✅ This ensures only provided fields are updated
    { new: true, runValidators: true, context: "query" });
    return Brand;
});
// Delete a Banner
const deleteBannerServices = (_id) => __awaiter(void 0, void 0, void 0, function* () {
    const updateBannerInfo = yield banner_model_1.BannerModel.findOne({ _id: _id });
    if (!updateBannerInfo) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Banner does not exist!');
    }
    const Banner = yield banner_model_1.BannerModel.findByIdAndDelete({ _id: _id });
    return Banner;
});
exports.deleteBannerServices = deleteBannerServices;
exports.BannerService = {
    createBannerServices,
    findBannersServices,
    updateBannerServices,
    findAllDashboardBannerServices: exports.findAllDashboardBannerServices,
    deleteBannerServices: exports.deleteBannerServices
};
