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
exports.RefundController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const refund_service_1 = require("./refund.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
// const createRefund = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         if (req.files && 'refund_images' in req.files && req.body) {
//             const userId = req.user?._id
//             const refundImage = req.files['refund_images'][0];
//             const refund_images_upload = await FileUploadHelper.uploadToSpaces(refundImage);
//             const refundData: IRefund = {
//                 refund_images: refund_images_upload?.Location,
//                 refund_images_key: refund_images_upload?.Key,
//                 user_id: userId,
//                 ...req.body,
//             } as IRefund;
//             const result = await RefundServices.createRefundService(refundData);
//             return sendResponse<IRefund>(res, {
//                 success: true,
//                 statusCode: httpStatus.OK,
//                 message: 'Refund request submitted successfully!',
//                 data: result,
//             });
//         } else {
//             throw new AppError(400, 'Image upload failed');
//         }
//     } catch (error) {
//         next(error);
//     }
// });
const createRefund = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (req.files && 'refund_images' in req.files && req.body) {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const refundImages = req.files['refund_images'];
            // Upload all images and get their URLs and keys
            const uploadPromises = refundImages.map((image) => __awaiter(void 0, void 0, void 0, function* () {
                return yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(image);
            }));
            const uploadedImages = yield Promise.all(uploadPromises);
            // Extract locations and keys
            const imageLocations = uploadedImages.map(img => img === null || img === void 0 ? void 0 : img.Location);
            const imageKeys = uploadedImages.map(img => img === null || img === void 0 ? void 0 : img.Key);
            const refundData = Object.assign({ refund_images: imageLocations, refund_images_key: imageKeys, user_id: userId }, req.body);
            const result = yield refund_service_1.RefundServices.createRefundService(refundData);
            return (0, sendResponse_1.default)(res, {
                success: true,
                statusCode: http_status_1.default.OK,
                message: 'Refund request submitted successfully!',
                data: result,
            });
        }
        else {
            throw new AppError_1.default(400, 'Image upload failed');
        }
    }
    catch (error) {
        next(error);
    }
}));
const findAllDashboardRefunds = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10, searchTerm = '' } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;
    const result = yield refund_service_1.RefundServices.findAllDashboardRefundsService(limitNumber, skip, searchTerm);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Dashboard Refunds fetched successfully!',
        data: result,
    });
}));
const findRefundById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;
    const result = yield refund_service_1.RefundServices.findRefundByIdService(userId, limitNumber, skip);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Refunds by user id fetched successfully!',
        data: result.data,
        totalData: result.total,
        pagination: {
            currentPage: result.page,
            limit: result.limit,
            totalPage: Math.ceil(result.total / result.limit),
        }
    });
}));
const findRefundByOrderId = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield refund_service_1.RefundServices.findRefundByOrderIdService(req.params.order_id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Refund by order id fetched successfully!',
        data: result,
    });
}));
const updateRefund = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield refund_service_1.RefundServices.updateRefundService(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Refund updated successfully!',
        data: result,
    });
}));
const deleteRefund = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield refund_service_1.RefundServices.deleteRefundService(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Refund deleted successfully!',
        data: result,
    });
}));
exports.RefundController = {
    createRefund,
    findAllDashboardRefunds,
    findRefundById,
    updateRefund,
    deleteRefund,
    findRefundByOrderId,
};
