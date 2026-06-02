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
exports.YTLinkController = void 0;
const ytLink_service_1 = require("./ytLink.service");
const ytLink_model_1 = require("./ytLink.model");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const createYTLink = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requestData = req.body;
        const ytLink = requestData === null || requestData === void 0 ? void 0 : requestData.ytLink_link;
        const findYTLinkNameExist = yield ytLink_model_1.YTLinkModel.exists({ ytLink });
        // Get the highest ytLink_serial
        const lastYTLink = yield ytLink_model_1.YTLinkModel.findOne().sort({ ytLink_serial: -1 });
        // Determine the new ytLink_serial
        const newYTLinkSerial = lastYTLink ? lastYTLink.ytLink_serial + 1 : 1;
        const data = Object.assign(Object.assign({}, requestData), { ytLink_serial: newYTLinkSerial });
        const result = yield ytLink_service_1.YTLinkService.createYTLinkServices(data);
        if (result) {
            return (0, sendResponse_1.default)(res, {
                success: true,
                statusCode: http_status_1.default.OK,
                message: "YTLink Added Successfully !",
                data: result
            });
        }
        else {
            throw new AppError_1.default(400, "YTLink Added Failed !");
        }
    }
    catch (error) {
        next(error);
    }
}));
const findYTLinks = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield ytLink_service_1.YTLinkService.findYTLinksServices(query);
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
        message: 'YTLinks retrieved successfully',
        data: result,
    });
}));
const findAllDashboardYTLinks = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const { result, totalCount } = yield ytLink_service_1.YTLinkService.findAllDashboardYTLinkServices(query);
    // Check if the database collection is empty or no matching data is found
    // if (!result || result.length === 0) {
    //   return sendResponse(res, {
    //     success: false,
    //     statusCode: httpStatus.NOT_FOUND,
    //     message: 'No data found.',
    //     data: [],
    //   });
    // }
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Dashboard ytLinks retrieved successfully',
        data: result,
        totalData: totalCount
    });
}));
const updateYTLink = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.files && "ytLink_image" in req.files && req.body) {
            const requestData = req.body;
            // const findYTLinkNameExist = await YTLinkModel.exists({ ytLink_title: requestData?.ytLink_title });
            // if (findYTLinkNameExist) {
            //   if (req.files?.ytLink_image?.[0]?.path) {
            //     try {
            //       fs.unlinkSync(req.files.ytLink_image[0].path);
            //     } catch (error) {
            //       console.error("Error deleting file:", error);
            //     }
            //   }
            //   throw new AppError(httpStatus.BAD_REQUEST, 'This ytLink already exists!');
            // }
            // const findBrandSerialExist = await YTLinkModel.exists({
            //   ytLink_serial: requestData?.ytLink_serial,
            // });
            // if (findBrandSerialExist) {
            //   if (req.files?.ytLink_image?.[0]?.path) {
            //     try {
            //       fs.unlinkSync(req.files.ytLink_image[0].path);
            //     } catch (error) {
            //       console.error("Error deleting file:", error);
            //     }
            //   }
            //   throw new AppError(httpStatus.BAD_REQUEST, 'Serial Number Previously Added!');
            // }
            // Find the ytLink that currently has the given newSerial
            const existingYTLink = yield ytLink_model_1.YTLinkModel.findOne({ ytLink_serial: requestData === null || requestData === void 0 ? void 0 : requestData.ytLink_serial });
            //console.log("hello",existingYTLink);
            // Find the ytLink that is being updated
            const ytLinkToUpdate = yield ytLink_model_1.YTLinkModel.findById(requestData === null || requestData === void 0 ? void 0 : requestData._id);
            //console.log(ytLinkToUpdate);
            if (!ytLinkToUpdate) {
                throw new Error("ytLink to update not found.");
            }
            if (existingYTLink) {
                // Swap serials if another ytLink already has the newSerial
                yield ytLink_model_1.YTLinkModel.findByIdAndUpdate(existingYTLink._id, { ytLink_serial: ytLinkToUpdate.ytLink_serial });
            }
            // Update the requested ytLink with the new serial
            yield ytLink_model_1.YTLinkModel.findByIdAndUpdate(requestData === null || requestData === void 0 ? void 0 : requestData._id, { ytLink_serial: requestData === null || requestData === void 0 ? void 0 : requestData.ytLink_serial });
            // get the ytLink image and upload
            let ytLink_image;
            let ytLink_image_key;
            if (req.files && "ytLink_image" in req.files) {
                const ytLinkImage = req.files["ytLink_image"][0];
                const ytLink_image_upload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(ytLinkImage);
                ytLink_image = ytLink_image_upload === null || ytLink_image_upload === void 0 ? void 0 : ytLink_image_upload.Location;
                ytLink_image_key = ytLink_image_upload === null || ytLink_image_upload === void 0 ? void 0 : ytLink_image_upload.Key;
            }
            const data = Object.assign(Object.assign({}, requestData), { ytLink_image, ytLink_image_key });
            const result = yield ytLink_service_1.YTLinkService.updateYTLinkServices(data, requestData === null || requestData === void 0 ? void 0 : requestData._id);
            if (result) {
                if (requestData === null || requestData === void 0 ? void 0 : requestData.ytLink_image_key) {
                    yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces(requestData === null || requestData === void 0 ? void 0 : requestData.ytLink_image_key);
                }
                return (0, sendResponse_1.default)(res, {
                    statusCode: http_status_1.default.OK,
                    success: true,
                    message: "YTLink Updated Successfully !",
                });
            }
            else {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "YTLink Update Failed !");
            }
        }
        else {
            const requestData = req.body;
            // const findYTLinkNameExist = await YTLinkModel.exists({ ytLink_title: requestData?.ytLink_title });
            // if (findYTLinkNameExist && requestData?._id !== findYTLinkNameExist?._id.toString()) {
            //   throw new AppError(httpStatus.BAD_REQUEST, 'Already added!');
            // }
            // Find the ytLink that currently has the given newSerial
            const existingYTLink = yield ytLink_model_1.YTLinkModel.findOne({ ytLink_serial: requestData === null || requestData === void 0 ? void 0 : requestData.ytLink_serial });
            // Find the ytLink that is being updated
            const ytLinkToUpdate = yield ytLink_model_1.YTLinkModel.findById(requestData === null || requestData === void 0 ? void 0 : requestData._id);
            //console.log(ytLinkToUpdate);
            if (!ytLinkToUpdate) {
                throw new Error("ytLink to update not found.");
            }
            if (existingYTLink) {
                // Swap serials if another ytLink already has the newSerial
                yield ytLink_model_1.YTLinkModel.findByIdAndUpdate(existingYTLink._id, { ytLink_serial: ytLinkToUpdate.ytLink_serial });
            }
            // Update the requested ytLink with the new serial
            yield ytLink_model_1.YTLinkModel.findByIdAndUpdate(requestData === null || requestData === void 0 ? void 0 : requestData._id, { ytLink_serial: requestData === null || requestData === void 0 ? void 0 : requestData.ytLink_serial });
            const result = yield ytLink_service_1.YTLinkService.updateYTLinkServices(requestData, requestData === null || requestData === void 0 ? void 0 : requestData._id);
            if (result) { // ✅ Check if result is not null
                return (0, sendResponse_1.default)(res, {
                    statusCode: http_status_1.default.OK,
                    success: true,
                    message: "YTLink Updated Successfully !",
                });
            }
            else {
                throw new AppError_1.default(400, "YTLink Updated Failed !");
            }
        }
    }
    catch (error) {
        next(error);
    }
}));
const deleteYTLinkInfo = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // const { _id } = req.params
        const result = yield ytLink_service_1.YTLinkService.deleteYTLinkServices(req.body._id);
        if (result) {
            if ((_a = req.body) === null || _a === void 0 ? void 0 : _a.ytLink_image_key) {
                yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces((_b = req.body) === null || _b === void 0 ? void 0 : _b.ytLink_image_key);
            }
            return (0, sendResponse_1.default)(res, {
                statusCode: http_status_1.default.OK,
                success: true,
                message: "YTLink deleted successfully !",
            });
        }
        else {
            throw new AppError_1.default(400, "YTLink delete failed !");
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.YTLinkController = {
    createYTLink,
    findYTLinks,
    findAllDashboardYTLinks,
    updateYTLink,
    deleteYTLinkInfo
};
