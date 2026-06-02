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
exports.ReviewService = exports.deleteReviewServices = exports.findAllDashboardReviewServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const review_model_1 = require("./review.model");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
// Create Reviews
const createReviewServices = (review) => __awaiter(void 0, void 0, void 0, function* () {
    // const isReviewExists = await ReviewModel.findOne({ name: review.review_link })
    // if (isReviewExists) {
    //   throw new AppError(httpStatus.CONFLICT, 'This review is already exists!');
    // }
    // (Logic will go here) User can review any product only if he ordered and purchased it
    const result = yield review_model_1.ReviewModel.create(review);
    return result;
});
// Find Reviews
const findReviewsServices = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    const initialQuary = {
        review_status: "active",
    };
    if (queryParams === null || queryParams === void 0 ? void 0 : queryParams.review_product_id) {
        initialQuary.review_product_id = queryParams.review_product_id;
    }
    const modelQuery = review_model_1.ReviewModel.find(initialQuary).sort({ review_serial: 1 }); // Initial Mongoose query
    const query = new QueryBuilder_1.default(modelQuery, queryParams)
        .search(['review_link']) // Provide searchable fields
        // .filter()
        .sort()
        .paginate();
    // .fields();
    const result = yield query.modelQuery; // Execute the query
    // const result = await query.modelQuery.sort({ sequence: 1 }); // Execute the query
    return result;
});
// find all dashboard Reviews
const findAllDashboardReviewServices = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    // const modelQuery = ReviewModel.find().sort({ review_serial: 1 })
    //   .populate('review_user_id review_product_id')
    // const query = new QueryBuilder(modelQuery, queryParams)
    //   .search(['review_user_id.user_phone', 'review_product_id.product_name']) // Provide searchable fields
    //   // .filter()
    //   .sort()
    //   .paginate()
    // // .fields();
    // const result = await query.modelQuery; // Execute the query
    // return result;
    const { searchTerm } = queryParams;
    const page = Number(queryParams.page) || 1;
    const limit = Number(queryParams.limit) || 20;
    const skip = (page - 1) * limit;
    const pipeline = [
        {
            $lookup: {
                from: 'users',
                localField: 'review_user_id',
                foreignField: '_id',
                as: 'review_user_id'
            }
        },
        {
            $unwind: '$review_user_id'
        },
        {
            $lookup: {
                from: 'products',
                localField: 'review_product_id',
                foreignField: '_id',
                as: 'review_product_id'
            }
        },
        {
            $unwind: '$review_product_id'
        },
        {
            $sort: { review_serial: 1 }
        }
    ];
    if (searchTerm) {
        pipeline.push({
            $match: {
                $or: [
                    { 'review_user_id.user_phone': { $regex: searchTerm, $options: 'i' } },
                    { 'review_product_id.product_name': { $regex: searchTerm, $options: 'i' } },
                    { review_link: { $regex: searchTerm, $options: 'i' } }
                ]
            }
        });
    }
    // Add pagination
    pipeline.push({ $skip: skip }, { $limit: limit });
    const result = yield review_model_1.ReviewModel.aggregate(pipeline);
    return result;
});
exports.findAllDashboardReviewServices = findAllDashboardReviewServices;
// find reviews by product id
const findReviewsByProductIdServices = (review_product_id) => __awaiter(void 0, void 0, void 0, function* () {
    const reviews = yield review_model_1.ReviewModel.find({ review_product_id }).populate('review_user_id').lean();
    const totalReviews = reviews.length;
    const ratingCounts = [0, 0, 0, 0, 0]; // index 0 => 1 star, index 4 => 5 star
    let totalRating = 0;
    for (const review of reviews) {
        const rating = review.review_rating;
        totalRating += rating;
        if (rating >= 1 && rating <= 5) {
            ratingCounts[rating - 1]++;
        }
    }
    const averageRating = totalReviews ? (totalRating / totalReviews).toFixed(1) : '0.0';
    return {
        averageRating: parseFloat(averageRating),
        totalReviews,
        ratingBreakdown: ratingCounts, // [1★, 2★, 3★, 4★, 5★]
        reviews,
    };
});
// Update Reviews
const updateReviewServices = (review, _id) => __awaiter(void 0, void 0, void 0, function* () {
    const updateReviewInfo = yield review_model_1.ReviewModel.findOne({ _id: _id });
    if (!updateReviewInfo) {
        return {};
    }
    const Brand = yield review_model_1.ReviewModel.findByIdAndUpdate({ _id: _id }, { $set: review }, // ✅ This ensures only provided fields are updated
    { new: true, runValidators: true, context: "query" });
    return Brand;
});
// Delete a Review
const deleteReviewServices = (_id) => __awaiter(void 0, void 0, void 0, function* () {
    const updateReviewInfo = yield review_model_1.ReviewModel.findOne({ _id: _id });
    if (!updateReviewInfo) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Review does not exist!');
    }
    const Review = yield review_model_1.ReviewModel.findByIdAndDelete({ _id: _id });
    return Review;
});
exports.deleteReviewServices = deleteReviewServices;
exports.ReviewService = {
    createReviewServices,
    findReviewsServices,
    findReviewsByProductIdServices,
    updateReviewServices,
    findAllDashboardReviewServices: exports.findAllDashboardReviewServices,
    deleteReviewServices: exports.deleteReviewServices
};
