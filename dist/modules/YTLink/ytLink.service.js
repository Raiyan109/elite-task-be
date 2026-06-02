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
exports.YTLinkService = exports.deleteYTLinkServices = exports.findAllDashboardYTLinkServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ytLink_model_1 = require("./ytLink.model");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
// Create YTLinks
const createYTLinkServices = (ytLink) => __awaiter(void 0, void 0, void 0, function* () {
    const isYTLinkExists = yield ytLink_model_1.YTLinkModel.findOne({ name: ytLink.ytLink_link });
    if (isYTLinkExists) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'This ytLink is already exists!');
    }
    const result = yield ytLink_model_1.YTLinkModel.create(ytLink);
    return result;
});
// Find YTLinks
const findYTLinksServices = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    const modelQuery = ytLink_model_1.YTLinkModel.find({ ytLink_status: "active" }).sort({ ytLink_serial: 1 }); // Initial Mongoose query
    const query = new QueryBuilder_1.default(modelQuery, queryParams)
        .search(['ytLink_link']) // Provide searchable fields
        // .filter()
        .sort()
        .paginate();
    // .fields();
    const result = yield query.modelQuery; // Execute the query
    // const result = await query.modelQuery.sort({ sequence: 1 }); // Execute the query
    return result;
});
// find all dashboard YTLinks
const findAllDashboardYTLinkServices = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    const modelQuery = ytLink_model_1.YTLinkModel.find().sort({ ytLink_serial: 1 });
    const query = new QueryBuilder_1.default(modelQuery, queryParams)
        .search(['ytLink_link', 'ytLink_status']) // Provide searchable fields
        // .filter()
        .sort()
        .paginate();
    // .fields();
    const totalCount = yield ytLink_model_1.YTLinkModel.countDocuments(query.modelQuery.getFilter());
    const result = yield query.modelQuery; // Execute the query
    return { result, totalCount };
});
exports.findAllDashboardYTLinkServices = findAllDashboardYTLinkServices;
// Update YTLinks
const updateYTLinkServices = (ytLink, _id) => __awaiter(void 0, void 0, void 0, function* () {
    const updateYTLinkInfo = yield ytLink_model_1.YTLinkModel.findOne({ _id: _id });
    if (!updateYTLinkInfo) {
        return {};
    }
    const Brand = yield ytLink_model_1.YTLinkModel.findByIdAndUpdate({ _id: _id }, { $set: ytLink }, // ✅ This ensures only provided fields are updated
    { new: true, runValidators: true, context: "query" });
    return Brand;
});
// Delete a YTLink
const deleteYTLinkServices = (_id) => __awaiter(void 0, void 0, void 0, function* () {
    const updateYTLinkInfo = yield ytLink_model_1.YTLinkModel.findOne({ _id: _id });
    if (!updateYTLinkInfo) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'YTLink does not exist!');
    }
    const YTLink = yield ytLink_model_1.YTLinkModel.findByIdAndDelete({ _id: _id });
    return YTLink;
});
exports.deleteYTLinkServices = deleteYTLinkServices;
exports.YTLinkService = {
    createYTLinkServices,
    findYTLinksServices,
    updateYTLinkServices,
    findAllDashboardYTLinkServices: exports.findAllDashboardYTLinkServices,
    deleteYTLinkServices: exports.deleteYTLinkServices
};
