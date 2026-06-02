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
exports.BannerController = void 0;
const banner_service_1 = require("./banner.service");
const banner_model_1 = require("./banner.model");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const createBanner = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.files && "banner_image" in req.files && req.body) {
            const requestData = req.body;
            // Get the highest banner_serial
            const lastBanner = yield banner_model_1.BannerModel.findOne().sort({ banner_serial: -1 });
            // Determine the new banner_serial
            const newBannerSerial = lastBanner ? lastBanner.banner_serial + 1 : 1;
            // get the banner image and upload
            let banner_image;
            let banner_image_key;
            if (req.files && "banner_image" in req.files) {
                const bannerImage = req.files["banner_image"][0];
                const banner_image_upload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(bannerImage);
                banner_image = banner_image_upload === null || banner_image_upload === void 0 ? void 0 : banner_image_upload.Location;
                banner_image_key = banner_image_upload === null || banner_image_upload === void 0 ? void 0 : banner_image_upload.Key;
            }
            const data = Object.assign(Object.assign({}, requestData), { banner_image, banner_image_key, banner_serial: newBannerSerial });
            const result = yield banner_service_1.BannerService.createBannerServices(data);
            if (result) {
                return (0, sendResponse_1.default)(res, {
                    success: true,
                    statusCode: http_status_1.default.OK,
                    message: "Banner Added Successfully !",
                    data: result
                });
            }
            else {
                throw new AppError_1.default(400, "Banner Added Failed !");
            }
        }
        else {
            throw new AppError_1.default(400, "Image Upload Failed");
        }
    }
    catch (error) {
        next(error);
    }
}));
const findBanners = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield banner_service_1.BannerService.findBannersServices(query);
    // Check if the database collection is empty or no matching data is found
    if (!result || result.length === 0) {
        return (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_1.default.OK,
            message: 'No data found.',
            data: [],
        });
    }
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Banners retrieved successfully',
        data: result,
    });
}));
const findAllDashboardBanners = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield banner_service_1.BannerService.findAllDashboardBannerServices(query);
    // Check if the database collection is empty or no matching data is found
    // if (!result || result.length === 0) {
    //   return sendResponse(res, {
    //     success: false,
    //     statusCode: httpStatus.NOT_FOUND,
    //     message: 'No data found.',
    //     data: [],
    //   });
    // }
    const groupedObj = result.reduce((acc, banner) => {
        var _a;
        const bannerPosition = ((_a = banner.banner_position) === null || _a === void 0 ? void 0 : _a.trim()) || 'Uncategorized';
        const key = `${bannerPosition}`; // unique composite key
        if (!acc[key]) {
            acc[key] = {
                banner_position: bannerPosition,
                banners: [],
            };
        }
        acc[key].banners.push(banner);
        return acc;
    }, {});
    const groupedArray = Object.values(groupedObj);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Dashboard banners retrieved successfully',
        data: groupedArray,
    });
}));
const updateBanner = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.files && "banner_image" in req.files && req.body) {
            const requestData = req.body;
            // const findBannerNameExist = await BannerModel.exists({ banner_title: requestData?.banner_title });
            // if (findBannerNameExist) {
            //   if (req.files?.banner_image?.[0]?.path) {
            //     try {
            //       fs.unlinkSync(req.files.banner_image[0].path);
            //     } catch (error) {
            //       console.error("Error deleting file:", error);
            //     }
            //   }
            //   throw new AppError(httpStatus.BAD_REQUEST, 'This banner already exists!');
            // }
            // const findBrandSerialExist = await BannerModel.exists({
            //   banner_serial: requestData?.banner_serial,
            // });
            // if (findBrandSerialExist) {
            //   if (req.files?.banner_image?.[0]?.path) {
            //     try {
            //       fs.unlinkSync(req.files.banner_image[0].path);
            //     } catch (error) {
            //       console.error("Error deleting file:", error);
            //     }
            //   }
            //   throw new AppError(httpStatus.BAD_REQUEST, 'Serial Number Previously Added!');
            // }
            // Find the banner that currently has the given newSerial
            const existingBanner = yield banner_model_1.BannerModel.findOne({ banner_serial: requestData === null || requestData === void 0 ? void 0 : requestData.banner_serial });
            //console.log("hello",existingBanner);
            // Find the banner that is being updated
            const bannerToUpdate = yield banner_model_1.BannerModel.findById(requestData === null || requestData === void 0 ? void 0 : requestData._id);
            //console.log(bannerToUpdate);
            if (!bannerToUpdate) {
                throw new Error("banner to update not found.");
            }
            if (existingBanner) {
                // Swap serials if another banner already has the newSerial
                yield banner_model_1.BannerModel.findByIdAndUpdate(existingBanner._id, { banner_serial: bannerToUpdate.banner_serial });
            }
            // Update the requested banner with the new serial
            yield banner_model_1.BannerModel.findByIdAndUpdate(requestData === null || requestData === void 0 ? void 0 : requestData._id, { banner_serial: requestData === null || requestData === void 0 ? void 0 : requestData.banner_serial });
            // get the banner image and upload
            let banner_image;
            let banner_image_key;
            if (req.files && "banner_image" in req.files) {
                const bannerImage = req.files["banner_image"][0];
                const banner_image_upload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(bannerImage);
                banner_image = banner_image_upload === null || banner_image_upload === void 0 ? void 0 : banner_image_upload.Location;
                banner_image_key = banner_image_upload === null || banner_image_upload === void 0 ? void 0 : banner_image_upload.Key;
            }
            const data = Object.assign(Object.assign({}, requestData), { banner_image, banner_image_key });
            const result = yield banner_service_1.BannerService.updateBannerServices(data, requestData === null || requestData === void 0 ? void 0 : requestData._id);
            if (result) {
                if (requestData === null || requestData === void 0 ? void 0 : requestData.banner_image_key) {
                    yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces(requestData === null || requestData === void 0 ? void 0 : requestData.banner_image_key);
                }
                return (0, sendResponse_1.default)(res, {
                    statusCode: http_status_1.default.OK,
                    success: true,
                    message: "Banner Updated Successfully !",
                });
            }
            else {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Banner Update Failed !");
            }
        }
        else {
            const requestData = req.body;
            // const findBannerNameExist = await BannerModel.exists({ banner_title: requestData?.banner_title });
            // if (findBannerNameExist && requestData?._id !== findBannerNameExist?._id.toString()) {
            //   throw new AppError(httpStatus.BAD_REQUEST, 'Already added!');
            // }
            // Find the banner that currently has the given newSerial
            const existingBanner = yield banner_model_1.BannerModel.findOne({ banner_serial: requestData === null || requestData === void 0 ? void 0 : requestData.banner_serial });
            // Find the banner that is being updated
            const bannerToUpdate = yield banner_model_1.BannerModel.findById(requestData === null || requestData === void 0 ? void 0 : requestData._id);
            //console.log(bannerToUpdate);
            if (!bannerToUpdate) {
                throw new Error("banner to update not found.");
            }
            if (existingBanner) {
                // Swap serials if another banner already has the newSerial
                yield banner_model_1.BannerModel.findByIdAndUpdate(existingBanner._id, { banner_serial: bannerToUpdate.banner_serial });
            }
            // Update the requested banner with the new serial
            yield banner_model_1.BannerModel.findByIdAndUpdate(requestData === null || requestData === void 0 ? void 0 : requestData._id, { banner_serial: requestData === null || requestData === void 0 ? void 0 : requestData.banner_serial });
            const result = yield banner_service_1.BannerService.updateBannerServices(requestData, requestData === null || requestData === void 0 ? void 0 : requestData._id);
            if (result) { // ✅ Check if result is not null
                return (0, sendResponse_1.default)(res, {
                    statusCode: http_status_1.default.OK,
                    success: true,
                    message: "Banner Updated Successfully !",
                });
            }
            else {
                throw new AppError_1.default(400, "Banner Updated Failed !");
            }
        }
    }
    catch (error) {
        next(error);
    }
}));
const deleteBannerInfo = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        // const { _id } = req.params
        // console.log(req.body);
        const result = yield banner_service_1.BannerService.deleteBannerServices((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a._id);
        if (result) {
            if ((_b = req.body) === null || _b === void 0 ? void 0 : _b.banner_image_key) {
                yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces((_c = req.body) === null || _c === void 0 ? void 0 : _c.banner_image_key);
            }
            return (0, sendResponse_1.default)(res, {
                statusCode: http_status_1.default.OK,
                success: true,
                message: "Banner deleted successfully !",
            });
        }
        else {
            throw new AppError_1.default(400, "Banner delete failed !");
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.BannerController = {
    createBanner,
    findBanners,
    findAllDashboardBanners,
    updateBanner,
    deleteBannerInfo
};
