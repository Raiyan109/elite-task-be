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
exports.ReviewController = void 0;
const review_service_1 = require("./review.service");
const review_model_1 = require("./review.model");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const product_model_1 = __importDefault(require("../Product/product.model"));
const combo_model_1 = require("../Combo/combo.model");
const createReview = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const requestData = req.body;
        const review = requestData === null || requestData === void 0 ? void 0 : requestData.review_link;
        const findReviewNameExist = yield review_model_1.ReviewModel.exists({ review });
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const { review_product_id, review_combo_id } = requestData;
        const product = yield product_model_1.default.findOne({ _id: review_product_id });
        const combo = yield combo_model_1.ComboModel.findOne({ _id: review_combo_id });
        console.log(product);
        console.log(combo);
        const reviewData = Object.assign(Object.assign({}, requestData), { review_user_id: userId });
        const result = yield review_service_1.ReviewService.createReviewServices(reviewData);
        if (result) {
            return (0, sendResponse_1.default)(res, {
                success: true,
                statusCode: http_status_1.default.OK,
                message: "Review Added Successfully !",
                data: result
            });
        }
        else {
            throw new AppError_1.default(400, "Review Added Failed !");
        }
    }
    catch (error) {
        next(error);
    }
}));
const findReviews = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    console.log('Query parameters received:', query);
    const result = yield review_service_1.ReviewService.findReviewsServices(query);
    // Check if the database collection is empty or no matching data is found
    if (!result || result.length === 0) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.NOT_FOUND,
            message: 'No data found.',
            data: [],
        });
    }
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Reviews retrieved successfully',
        data: result,
    });
}));
const findAllDashboardReviews = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield review_service_1.ReviewService.findAllDashboardReviewServices(query);
    // Check if the database collection is empty or no matching data is found
    if (!result || result.length === 0) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.NOT_FOUND,
            message: 'No data found.',
            data: [],
        });
    }
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Dashboard reviews retrieved successfully',
        data: result,
    });
}));
// Review by product id
const findReviewsByProductId = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { review_product_id } = req.params;
    const result = yield review_service_1.ReviewService.findReviewsByProductIdServices(review_product_id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Review by product id retrieved successfully',
        data: result,
    });
}));
const updateReview = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.files && "review_image" in req.files && req.body) {
            const requestData = req.body;
            // const findReviewNameExist = await ReviewModel.exists({ review_title: requestData?.review_title });
            // if (findReviewNameExist) {
            //   if (req.files?.review_image?.[0]?.path) {
            //     try {
            //       fs.unlinkSync(req.files.review_image[0].path);
            //     } catch (error) {
            //       console.error("Error deleting file:", error);
            //     }
            //   }
            //   throw new AppError(httpStatus.BAD_REQUEST, 'This review already exists!');
            // }
            // const findBrandSerialExist = await ReviewModel.exists({
            //   review_serial: requestData?.review_serial,
            // });
            // if (findBrandSerialExist) {
            //   if (req.files?.review_image?.[0]?.path) {
            //     try {
            //       fs.unlinkSync(req.files.review_image[0].path);
            //     } catch (error) {
            //       console.error("Error deleting file:", error);
            //     }
            //   }
            //   throw new AppError(httpStatus.BAD_REQUEST, 'Serial Number Previously Added!');
            // }
            // Find the review that currently has the given newSerial
            const existingReview = yield review_model_1.ReviewModel.findOne({ review_serial: requestData === null || requestData === void 0 ? void 0 : requestData.review_serial });
            //console.log("hello",existingReview);
            // Find the review that is being updated
            const reviewToUpdate = yield review_model_1.ReviewModel.findById(requestData === null || requestData === void 0 ? void 0 : requestData._id);
            //console.log(reviewToUpdate);
            if (!reviewToUpdate) {
                throw new Error("review to update not found.");
            }
            // if (existingReview) {
            //   // Swap serials if another review already has the newSerial
            //   await ReviewModel.findByIdAndUpdate(existingReview._id, { review_serial: reviewToUpdate.review_serial });
            // }
            // // Update the requested review with the new serial
            // await ReviewModel.findByIdAndUpdate(requestData?._id, { review_serial: requestData?.review_serial });
            // get the review image and upload
            let review_image;
            let review_image_key;
            if (req.files && "review_image" in req.files) {
                const reviewImage = req.files["review_image"][0];
                const review_image_upload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(reviewImage);
                review_image = review_image_upload === null || review_image_upload === void 0 ? void 0 : review_image_upload.Location;
                review_image_key = review_image_upload === null || review_image_upload === void 0 ? void 0 : review_image_upload.Key;
            }
            const data = Object.assign(Object.assign({}, requestData), { review_image, review_image_key });
            const result = yield review_service_1.ReviewService.updateReviewServices(data, requestData === null || requestData === void 0 ? void 0 : requestData._id);
            if (result) {
                if (requestData === null || requestData === void 0 ? void 0 : requestData.review_image_key) {
                    yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces(requestData === null || requestData === void 0 ? void 0 : requestData.review_image_key);
                }
                return (0, sendResponse_1.default)(res, {
                    statusCode: http_status_1.default.OK,
                    success: true,
                    message: "Review Updated Successfully !",
                });
            }
            else {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Review Update Failed !");
            }
        }
        else {
            const requestData = req.body;
            // const findReviewNameExist = await ReviewModel.exists({ review_title: requestData?.review_title });
            // if (findReviewNameExist && requestData?._id !== findReviewNameExist?._id.toString()) {
            //   throw new AppError(httpStatus.BAD_REQUEST, 'Already added!');
            // }
            // Find the review that currently has the given newSerial
            const existingReview = yield review_model_1.ReviewModel.findOne({ review_serial: requestData === null || requestData === void 0 ? void 0 : requestData.review_serial });
            // Find the review that is being updated
            const reviewToUpdate = yield review_model_1.ReviewModel.findById(requestData === null || requestData === void 0 ? void 0 : requestData._id);
            //console.log(reviewToUpdate);
            if (!reviewToUpdate) {
                throw new Error("review to update not found.");
            }
            // if (existingReview) {
            //   // Swap serials if another review already has the newSerial
            //   await ReviewModel.findByIdAndUpdate(existingReview._id, { review_serial: reviewToUpdate.review_serial });
            // }
            // // Update the requested review with the new serial
            // await ReviewModel.findByIdAndUpdate(requestData?._id, { review_serial: requestData?.review_serial });
            const result = yield review_service_1.ReviewService.updateReviewServices(requestData, requestData === null || requestData === void 0 ? void 0 : requestData._id);
            if (result) { // ✅ Check if result is not null
                return (0, sendResponse_1.default)(res, {
                    statusCode: http_status_1.default.OK,
                    success: true,
                    message: "Review Updated Successfully !",
                });
            }
            else {
                throw new AppError_1.default(400, "Review Updated Failed !");
            }
        }
    }
    catch (error) {
        next(error);
    }
}));
const deleteReviewInfo = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { _id } = req.params;
        const result = yield review_service_1.ReviewService.deleteReviewServices(_id);
        if (result) {
            if ((_a = req.body) === null || _a === void 0 ? void 0 : _a.review_image_key) {
                yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces((_b = req.body) === null || _b === void 0 ? void 0 : _b.review_image_key);
            }
            return (0, sendResponse_1.default)(res, {
                statusCode: http_status_1.default.OK,
                success: true,
                message: "Review deleted successfully !",
            });
        }
        else {
            throw new AppError_1.default(400, "Review delete failed !");
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.ReviewController = {
    createReview,
    findReviews,
    findAllDashboardReviews,
    findReviewsByProductId,
    updateReview,
    deleteReviewInfo
};
