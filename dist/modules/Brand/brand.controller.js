"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.BrandController = void 0;
const brand_services_1 = require("./brand.services");
const slugify_1 = __importDefault(require("slugify"));
const brand_model_1 = require("./brand.model");
const fs = __importStar(require("fs"));
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const postBrand = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // if (req.files && "brand_logo" in req.files && req.body) {
        // } else {
        //   throw new AppError(400, "Image Upload Failed");
        // }
        const requestData = req.body;
        let brand_slug = (0, slugify_1.default)(requestData === null || requestData === void 0 ? void 0 : requestData.brand_name);
        const findBrandNameExist = yield brand_model_1.BrandModel.exists({ brand_slug });
        if (findBrandNameExist) {
            try {
                if (req.files && "brand_logo" in req.files && ((_a = req.files.brand_logo[0]) === null || _a === void 0 ? void 0 : _a.path)) {
                    fs.unlinkSync(req.files.brand_logo[0].path);
                }
            }
            catch (error) {
                console.error("Error deleting file:", error);
            }
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This brand already exists!');
        }
        // const findBrandSerialExist = await BrandModel.exists({
        //   brand_serial: requestData?.brand_serial,
        // });
        // if (findBrandSerialExist) {
        //   if (req.files?.brand_logo?.[0]?.path) {
        //     try {
        //       fs.unlinkSync(req.files.brand_logo[0].path);
        //     } catch (error) {
        //       console.error("Error deleting file:", error);
        //     }
        //   }
        //   throw new AppError(httpStatus.BAD_REQUEST, 'Serial Number Previously Added!');
        // }
        // Get the highest brand_serial
        const lastBrand = yield brand_model_1.BrandModel.findOne().sort({ brand_serial: -1 });
        // Determine the new brand_serial
        const newBrandSerial = lastBrand ? lastBrand.brand_serial + 1 : 1;
        // get the brand image and upload
        let brand_logo;
        let brand_logo_key;
        if (req.files && "brand_logo" in req.files) {
            const brandImage = req.files["brand_logo"][0];
            const brand_logo_upload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(brandImage);
            brand_logo = brand_logo_upload === null || brand_logo_upload === void 0 ? void 0 : brand_logo_upload.Location;
            brand_logo_key = brand_logo_upload === null || brand_logo_upload === void 0 ? void 0 : brand_logo_upload.Key;
        }
        const data = Object.assign(Object.assign({}, requestData), { brand_logo, brand_logo_key, brand_slug, brand_serial: newBrandSerial });
        const result = yield brand_services_1.BrandServices.postBrandServices(data);
        if (result) {
            return (0, sendResponse_1.default)(res, {
                success: true,
                statusCode: http_status_1.default.OK,
                message: "Brand Added Successfully !",
                data: result
            });
        }
        else {
            throw new AppError_1.default(400, "Brand Added Failed !");
        }
    }
    catch (error) {
        next(error);
    }
}));
const findAllBrand = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield brand_services_1.BrandServices.findAllBrandsServices(query);
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
        message: 'Brands retrieved successfully',
        data: result,
    });
}));
const findAllDashboardBrands = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield brand_services_1.BrandServices.findAllDashboardBrandsServices(query);
    // Check if the database collection is empty or no matching data is found
    // if (!result || result?.data?.length === 0) {
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
        message: 'Dashboard brands retrieved successfully',
        data: result === null || result === void 0 ? void 0 : result.data,
        pagination: result === null || result === void 0 ? void 0 : result.pagination,
        totalData: result === null || result === void 0 ? void 0 : result.total
    });
}));
const findNestleAndUnileverBrands = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield brand_services_1.BrandServices.findNestleAndUnileverBrandsServices();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Nestle and Unilever brands retrieved successfully',
        data: result,
    });
}));
const updateBrand = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        if (req.files && "brand_logo" in req.files && req.body) {
            const requestData = req.body;
            const findBrandNameExist = yield brand_model_1.BrandModel.exists({ brand_slug: requestData === null || requestData === void 0 ? void 0 : requestData.brand_slug });
            if (findBrandNameExist) {
                if ((_c = (_b = (_a = req.files) === null || _a === void 0 ? void 0 : _a.brand_logo) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.path) {
                    try {
                        fs.unlinkSync(req.files.brand_logo[0].path);
                    }
                    catch (error) {
                        console.error("Error deleting file:", error);
                    }
                }
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This brand already exists!');
            }
            // const findBrandSerialExist = await BrandModel.exists({
            //   brand_serial: requestData?.brand_serial,
            // });
            // if (findBrandSerialExist) {
            //   if (req.files?.brand_logo?.[0]?.path) {
            //     try {
            //       fs.unlinkSync(req.files.brand_logo[0].path);
            //     } catch (error) {
            //       console.error("Error deleting file:", error);
            //     }
            //   }
            //   throw new AppError(httpStatus.BAD_REQUEST, 'Serial Number Previously Added!');
            // }
            // Find the brand that currently has the given newSerial
            const existingBrand = yield brand_model_1.BrandModel.findOne({ brand_serial: requestData === null || requestData === void 0 ? void 0 : requestData.brand_serial });
            //console.log("hello",existingbrand);
            // Find the brand that is being updated
            const brandToUpdate = yield brand_model_1.BrandModel.findById(requestData === null || requestData === void 0 ? void 0 : requestData._id);
            //console.log(brandToUpdate);
            if (!brandToUpdate) {
                throw new Error("brand to update not found.");
            }
            if (existingBrand) {
                // Swap serials if another brand already has the newSerial
                yield brand_model_1.BrandModel.findByIdAndUpdate(existingBrand._id, { brand_serial: brandToUpdate.brand_serial });
            }
            // Update the requested brand with the new serial
            yield brand_model_1.BrandModel.findByIdAndUpdate(requestData === null || requestData === void 0 ? void 0 : requestData._id, { brand_serial: requestData === null || requestData === void 0 ? void 0 : requestData.brand_serial });
            // get the brand image and upload
            let brand_logo;
            let brand_logo_key;
            if (req.files && "brand_logo" in req.files) {
                const brandImage = req.files["brand_logo"][0];
                const brand_logo_upload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(brandImage);
                brand_logo = brand_logo_upload === null || brand_logo_upload === void 0 ? void 0 : brand_logo_upload.Location;
                brand_logo_key = brand_logo_upload === null || brand_logo_upload === void 0 ? void 0 : brand_logo_upload.Key;
            }
            const data = Object.assign(Object.assign({}, requestData), { brand_logo, brand_logo_key });
            const result = yield brand_services_1.BrandServices.updateBrandServices(data, requestData === null || requestData === void 0 ? void 0 : requestData._id);
            if (result) {
                if (requestData === null || requestData === void 0 ? void 0 : requestData.brand_logo_key) {
                    yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces(requestData === null || requestData === void 0 ? void 0 : requestData.brand_logo_key);
                }
                return (0, sendResponse_1.default)(res, {
                    statusCode: http_status_1.default.OK,
                    success: true,
                    message: "Brand Update Successfully !",
                });
            }
            else {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Brand Update Failed !");
            }
        }
        else {
            const requestData = req.body;
            const findBrandNameExist = yield brand_model_1.BrandModel.exists({ brand_slug: requestData === null || requestData === void 0 ? void 0 : requestData.brand_slug });
            if (findBrandNameExist && (requestData === null || requestData === void 0 ? void 0 : requestData._id) !== (findBrandNameExist === null || findBrandNameExist === void 0 ? void 0 : findBrandNameExist._id.toString())) {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Already added!');
            }
            // const findBrandSerialExist = await BrandModel.exists({
            //   brand_serial: requestData?.brand_serial,
            // });
            // if (findBrandSerialExist && requestData?._id !== findBrandSerialExist?._id.toString()) {
            //   throw new AppError(httpStatus.BAD_REQUEST, 'Serial Number Previously Added!');
            // }
            // Find the brand that currently has the given newSerial
            const existingBrand = yield brand_model_1.BrandModel.findOne({ brand_serial: requestData === null || requestData === void 0 ? void 0 : requestData.brand_serial });
            //console.log("hello",existingbrand);
            // Find the brand that is being updated
            const brandToUpdate = yield brand_model_1.BrandModel.findById(requestData === null || requestData === void 0 ? void 0 : requestData._id);
            //console.log(brandToUpdate);
            if (!brandToUpdate) {
                throw new Error("brand to update not found.");
            }
            if (existingBrand) {
                // Swap serials if another brand already has the newSerial
                yield brand_model_1.BrandModel.findByIdAndUpdate(existingBrand._id, { brand_serial: brandToUpdate.brand_serial });
            }
            // Update the requested brand with the new serial
            yield brand_model_1.BrandModel.findByIdAndUpdate(requestData === null || requestData === void 0 ? void 0 : requestData._id, { brand_serial: requestData === null || requestData === void 0 ? void 0 : requestData.brand_serial });
            const result = yield brand_services_1.BrandServices.updateBrandServices(requestData, requestData === null || requestData === void 0 ? void 0 : requestData._id);
            if (result) { // ✅ Check if result is not null
                return (0, sendResponse_1.default)(res, {
                    statusCode: http_status_1.default.OK,
                    success: true,
                    message: "Brand Updated Successfully !",
                });
            }
            else {
                throw new AppError_1.default(400, "Brand Updated Failed !");
            }
        }
    }
    catch (error) {
        next(error);
    }
}));
const deleteABrandInfo = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const brand_id = req.body._id;
        const result = yield brand_services_1.BrandServices.deleteBrandServices(brand_id);
        if (result) {
            if ((_a = req.body) === null || _a === void 0 ? void 0 : _a.brand_logo_key) {
                yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces((_b = req.body) === null || _b === void 0 ? void 0 : _b.brand_logo_key);
            }
            return (0, sendResponse_1.default)(res, {
                statusCode: http_status_1.default.OK,
                success: true,
                message: "Brand deleted successfully !",
            });
        }
        else {
            throw new AppError_1.default(400, "Brand delete failed !");
        }
    }
    catch (error) {
        next(error);
    }
}));
// const updateBrandSequence = catchAsync(async (req, res) => {
//   const { brandId } = req.params;
//   const { sequence } = req.body;
//   if (sequence === undefined || isNaN(sequence)) {
//     return sendResponse(res, {
//       success: false,
//       statusCode: httpStatus.BAD_REQUEST,
//       message: 'Invalid sequence value',
//     });
//   }
//   const updatedBrand = await BrandServices.updateBrandSequenceInDB(brandId, Number(sequence));
//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: 'Brand sequence updated successfully',
//     data: updatedBrand,
//   });
// });
// //get single Brand item
// export const getSingleBrand = catchAsync(async (req, res) => {
//   const { _id } = req.body;
//   const result = await getSingleBrandServices(_id);
//   //console.log(result);
//   sendResponse(res, {
//       success: true,
//       statusCode: 200,
//       message: 'Brand retrieved successfully',
//       data: result,
//   });
// });
exports.BrandController = {
    postBrand,
    findAllBrand,
    findAllDashboardBrands,
    findNestleAndUnileverBrands,
    updateBrand,
    deleteABrandInfo,
};
