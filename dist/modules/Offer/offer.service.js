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
exports.OfferServices = void 0;
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const offer_model_1 = require("./offer.model");
const http_status_1 = __importDefault(require("http-status"));
const createOfferServices = (offer) => __awaiter(void 0, void 0, void 0, function* () {
    const isOfferExists = yield offer_model_1.OfferModel.findOne({ name: offer.offer_title });
    if (isOfferExists) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'This offer is already exists!');
    }
    const result = yield offer_model_1.OfferModel.create(offer);
    return result;
});
const findAllOfferServices = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield offer_model_1.OfferModel.find({}).populate('offer_product.product_id');
    return result;
});
const findWeekdayOfferServices = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield offer_model_1.OfferModel.find({}).populate('offer_product.product_id');
    return result;
});
const findDashboardOfferServices = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    const modelQuery = offer_model_1.OfferModel.find({}).sort({ _id: 1 }).populate('offer_product.product_id');
    const query = new QueryBuilder_1.default(modelQuery, queryParams)
        .search(['offer_title', 'offer_label']) // Provide searchable fields
        // .filter()
        .sort()
        .paginate();
    // .fields();
    const totalCount = yield offer_model_1.OfferModel.countDocuments(query.modelQuery.getFilter());
    const offers = yield query.modelQuery; // Execute the query
    return { offers, totalCount };
});
// get single offer
const findSingleOfferServices = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const offer = yield offer_model_1.OfferModel.findOne({
        offer_slug: id,
        offer_status: { $in: ['active'] }
    }).populate('offer_product.product_id')
        .select("-__v")
        .lean(); // Use .lean() to return a plain JavaScript object
    if (!offer) {
        throw new AppError_1.default(404, "Offer Not Found !");
    }
    return Object.assign({}, offer);
});
// get offers by IDs (cart)
const findOffersByIdsServices = (ids) => __awaiter(void 0, void 0, void 0, function* () {
    const offers = yield offer_model_1.OfferModel.find({ _id: { $in: ids } }).populate('offer_product.product_id');
    return offers;
});
exports.OfferServices = {
    createOfferServices,
    findWeekdayOfferServices,
    findDashboardOfferServices,
    findSingleOfferServices,
    findOffersByIdsServices,
    findAllOfferServices,
};
