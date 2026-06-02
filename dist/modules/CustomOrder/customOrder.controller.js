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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteACustomOrderInfo = exports.updateCustomOrder = exports.findAllDashboardCustomOrder = exports.findCustomOrderByUserId = exports.findAllCustomOrder = exports.postCustomOrder = void 0;
const customOrder_interface_1 = require("./customOrder.interface");
const customOrder_service_1 = require("./customOrder.service");
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const customOrder_model_1 = require("./customOrder.model");
// Add A CustomOrder
const postCustomOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // if (req.files && "product_image" in req.files && req.body) {
        // } else {
        //     throw new AppError(400, "Image Upload Failed");
        // }
        // const userId = req.user._id
        const requestData = req.body;
        // get the customOrder image and upload
        let product_image;
        let product_image_key;
        if (req.files && "product_image" in req.files) {
            const customOrderImage = req.files["product_image"][0];
            const product_image_upload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(customOrderImage);
            product_image = product_image_upload === null || product_image_upload === void 0 ? void 0 : product_image_upload.Location;
            product_image_key = product_image_upload === null || product_image_upload === void 0 ? void 0 : product_image_upload.Key;
        }
        const data = Object.assign(Object.assign({}, requestData), { product_image, product_image_key });
        const result = yield (0, customOrder_service_1.postCustomOrderServices)(data);
        if (result) {
            return (0, sendResponse_1.default)(res, {
                statusCode: http_status_1.default.OK,
                success: true,
                message: "Custom Order Added Successfully !",
            });
        }
        else {
            throw new AppError_1.default(400, "Custom Order Added Failed !");
        }
    }
    catch (error) {
        next(error);
    }
});
exports.postCustomOrder = postCustomOrder;
// Find All CustomOrder
const findAllCustomOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.query, { searchTerm } = _a, filterData = __rest(_a, ["searchTerm"]);
        const result = yield (0, customOrder_service_1.findAllCustomOrderServices)(searchTerm);
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "Custom Order Found Successfully !",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.findAllCustomOrder = findAllCustomOrder;
// Find CustomOrder by user id
const findCustomOrderByUserId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, searchTerm } = req.query;
        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        const skip = (pageNumber - 1) * limitNumber;
        const userId = req.user._id;
        const result = yield (0, customOrder_service_1.findCustomOrderByUserIdServices)(limitNumber, skip, searchTerm, userId);
        const andCondition = [];
        if (searchTerm) {
            andCondition.push({
                $or: customOrder_interface_1.customOrderSearchableField.map((field) => ({
                    [field]: {
                        $regex: searchTerm,
                        $options: "i",
                    },
                })),
            });
        }
        andCondition.push({
            user_id: userId, // again, use the correct field name
        });
        const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};
        const total = yield customOrder_model_1.CustomOrderModel.countDocuments(whereCondition);
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "Custom Order Found Successfully !",
            data: result,
            totalData: total,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.findCustomOrderByUserId = findCustomOrderByUserId;
// Find All dashboard CustomOrder
const findAllDashboardCustomOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, searchTerm } = req.query;
        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        const skip = (pageNumber - 1) * limitNumber;
        const result = yield (0, customOrder_service_1.findAllDashboardCustomOrderServices)(limitNumber, skip, searchTerm);
        const andCondition = [];
        if (searchTerm) {
            andCondition.push({
                $or: customOrder_interface_1.customOrderSearchableField.map((field) => ({
                    [field]: {
                        $regex: searchTerm,
                        $options: "i",
                    },
                })),
            });
        }
        const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};
        const total = yield customOrder_model_1.CustomOrderModel.countDocuments(whereCondition);
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "Custom Order Found Successfully !",
            data: result,
            totalData: total,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.findAllDashboardCustomOrder = findAllDashboardCustomOrder;
// Update A CustomOrder
const updateCustomOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.files && "product_image" in req.files && req.body) {
            const requestData = req.body;
            // Find the customOrder that is being updated
            const customOrderToUpdate = yield customOrder_model_1.CustomOrderModel.findById(requestData === null || requestData === void 0 ? void 0 : requestData._id);
            //console.log(customOrderToUpdate);
            if (!customOrderToUpdate) {
                throw new Error("CustomOrder to update not found.");
            }
            // get the customOrder image and upload
            let product_image;
            let product_image_key;
            if (req.files && "product_image" in req.files) {
                const customOrderImage = req.files["product_image"][0];
                const product_image_upload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(customOrderImage);
                product_image = product_image_upload === null || product_image_upload === void 0 ? void 0 : product_image_upload.Location;
                product_image_key = product_image_upload === null || product_image_upload === void 0 ? void 0 : product_image_upload.Key;
            }
            const data = Object.assign(Object.assign({}, requestData), { product_image, product_image_key });
            const result = yield (0, customOrder_service_1.updateCustomOrderServices)(data, requestData === null || requestData === void 0 ? void 0 : requestData._id);
            if ((result === null || result === void 0 ? void 0 : result.modifiedCount) > 0) {
                if (requestData === null || requestData === void 0 ? void 0 : requestData.product_image_key) {
                    yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces(requestData === null || requestData === void 0 ? void 0 : requestData.product_image_key);
                }
                return (0, sendResponse_1.default)(res, {
                    statusCode: http_status_1.default.OK,
                    success: true,
                    message: "Custom Order Update Successfully !",
                });
            }
            else {
                throw new AppError_1.default(400, "CustomOrder Update Failed !");
            }
        }
        else {
            const requestData = req.body;
            // Find the customOrder that is being updated
            const customOrderToUpdate = yield customOrder_model_1.CustomOrderModel.findById(requestData === null || requestData === void 0 ? void 0 : requestData._id);
            if (!customOrderToUpdate) {
                throw new Error("CustomOrder to update not found.");
            }
            const data = Object.assign({}, requestData);
            const result = yield (0, customOrder_service_1.updateCustomOrderServices)(data, requestData === null || requestData === void 0 ? void 0 : requestData._id);
            if ((result === null || result === void 0 ? void 0 : result.modifiedCount) > 0) {
                return (0, sendResponse_1.default)(res, {
                    statusCode: http_status_1.default.OK,
                    success: true,
                    message: "Custom Order Update Successfully !",
                });
            }
            else {
                throw new AppError_1.default(400, "Custom Order Update Failed !");
            }
        }
    }
    catch (error) {
        next(error);
    }
});
exports.updateCustomOrder = updateCustomOrder;
// delete A CustomOrder item
const deleteACustomOrderInfo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const customOrder_id = req.body._id;
        const result = yield (0, customOrder_service_1.deleteCustomOrderServices)(customOrder_id);
        if ((result === null || result === void 0 ? void 0 : result.deletedCount) > 0) {
            if ((_a = req.body) === null || _a === void 0 ? void 0 : _a.product_image_key) {
                yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces((_b = req.body) === null || _b === void 0 ? void 0 : _b.product_image_key);
            }
            return (0, sendResponse_1.default)(res, {
                statusCode: http_status_1.default.OK,
                success: true,
                message: "Custom Order Delete successfully !",
            });
        }
        else {
            throw new AppError_1.default(400, "Custom Order delete failed !");
        }
    }
    catch (error) {
        next(error);
    }
});
exports.deleteACustomOrderInfo = deleteACustomOrderInfo;
