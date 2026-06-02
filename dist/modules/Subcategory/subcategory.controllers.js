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
exports.deleteASubcategoryInfo = exports.updateSubcategory = exports.findAllDashboardSubcategory = exports.findAllFashionSubcategory = exports.findAllSkincareSubcategory = exports.findAllPharmacySubcategory = exports.findAllGrocerySubcategory = exports.findAllSubcategory = exports.postSubcategory = void 0;
const fs = __importStar(require("fs"));
const http_status_1 = __importDefault(require("http-status"));
const slugify_1 = __importDefault(require("slugify"));
const subcategory_interface_1 = require("./subcategory.interface");
const subcategory_model_1 = __importDefault(require("./subcategory.model"));
const subcategory_services_1 = require("./subcategory.services");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const category_model_1 = __importDefault(require("../Category/category.model"));
// Add A Sub category
const postSubcategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.files || !("subcategory_logo" in req.files)) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: 'Logo are required',
        });
    }
    try {
        // if (req.files && "subcategory_logo" in req.files && req.body) {
        const requestData = req.body;
        let subcategory_slug = (0, slugify_1.default)(requestData === null || requestData === void 0 ? void 0 : requestData.subcategory_name);
        const findSubcategoryNameExit = yield subcategory_model_1.default.exists({
            subcategory_slug,
        });
        if (findSubcategoryNameExit) {
            fs.unlinkSync(req.files.subcategory_logo[0].path);
            throw new AppError_1.default(400, "This subcategory is already exists!");
        }
        // Get the highest category_serial
        const lastSubcategory = yield subcategory_model_1.default.findOne({ category_id: requestData === null || requestData === void 0 ? void 0 : requestData.category_id }).sort({ subcategory_serial: -1 });
        // Determine the new category_serial
        const newSubcategorySerial = lastSubcategory ? lastSubcategory.subcategory_serial + 1 : 1;
        // get the subcategory image and upload
        let subcategory_logo;
        let subcategory_logo_key;
        if (req.files && "subcategory_logo" in req.files) {
            const subcategoryImage = req.files["subcategory_logo"][0];
            const subcategory_logo_upload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(subcategoryImage);
            subcategory_logo = subcategory_logo_upload === null || subcategory_logo_upload === void 0 ? void 0 : subcategory_logo_upload.Location;
            subcategory_logo_key = subcategory_logo_upload === null || subcategory_logo_upload === void 0 ? void 0 : subcategory_logo_upload.Key;
        }
        // Upload banners (optional)
        let subcategory_banner = [];
        let subcategory_banner_key = [];
        if ("subcategory_banner" in req.files) {
            const subcategoryBanner = req.files["subcategory_banner"];
            for (const file of subcategoryBanner) {
                const upload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(file);
                subcategory_banner.push(upload === null || upload === void 0 ? void 0 : upload.Location);
                subcategory_banner_key.push(upload === null || upload === void 0 ? void 0 : upload.Key);
            }
        }
        const data = Object.assign(Object.assign({}, requestData), { subcategory_logo,
            subcategory_logo_key,
            subcategory_banner,
            subcategory_banner_key,
            subcategory_slug, subcategory_serial: newSubcategorySerial });
        const result = yield (0, subcategory_services_1.postSubcategoryServices)(data);
        if (result) {
            return (0, sendResponse_1.default)(res, {
                statusCode: http_status_1.default.OK,
                success: true,
                message: "Sub Category Added Successfully !",
                data: result
            });
        }
        else {
            throw new AppError_1.default(400, "Sub Category Added Failed !");
        }
        // } else {
        //   throw new AppError(400, "Image Upload Failed");
        // }
    }
    catch (error) {
        next(error);
    }
});
exports.postSubcategory = postSubcategory;
// Find All Subategory
const findAllSubcategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.query, { searchTerm } = _a, filterData = __rest(_a, ["searchTerm"]);
        const result = yield (0, subcategory_services_1.findAllSubcategoryServices)(searchTerm);
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "Sub Category Found Successfully !",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.findAllSubcategory = findAllSubcategory;
// Find All Grocery Sub category
const findAllGrocerySubcategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const { searchTerm, ...filterData } = req.query;
        const result = yield (0, subcategory_services_1.findAllGrocerySubcategoryServices)( /*searchTerm*/);
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "Grocery Sub Category Found Successfully !",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.findAllGrocerySubcategory = findAllGrocerySubcategory;
// Find All Pharmacy Sub category
const findAllPharmacySubcategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const { searchTerm, ...filterData } = req.query;
        const result = yield (0, subcategory_services_1.findAllPharmacySubcategoryServices)( /*searchTerm*/);
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "Pharmacy Sub Category Found Successfully !",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.findAllPharmacySubcategory = findAllPharmacySubcategory;
// Find All Skincare/cosmetics/beauty related Sub category
const findAllSkincareSubcategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const { searchTerm, ...filterData } = req.query;
        const result = yield (0, subcategory_services_1.findAllSkincareSubcategoryServices)( /*searchTerm*/);
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "Skincare Sub Category Found Successfully !",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.findAllSkincareSubcategory = findAllSkincareSubcategory;
// Find All fashion related Sub category
const findAllFashionSubcategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const { searchTerm, ...filterData } = req.query;
        const result = yield (0, subcategory_services_1.findAllFashionSubcategoryServices)( /*searchTerm*/);
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "Fashion Sub Category Found Successfully !",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.findAllFashionSubcategory = findAllFashionSubcategory;
// Find All dashboard Sub category
const findAllDashboardSubcategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, searchTerm, category_id } = req.query;
        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        const skip = (pageNumber - 1) * limitNumber;
        const result = yield (0, subcategory_services_1.findAllDashboardSubcategoryServices)(limitNumber, skip, searchTerm, category_id);
        const andCondition = [];
        if (searchTerm) {
            andCondition.push({
                $or: subcategory_interface_1.subcategorySearchableField.map((field) => ({
                    [field]: {
                        $regex: searchTerm,
                        $options: "i",
                    },
                })),
            });
        }
        const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};
        const total = yield subcategory_model_1.default.countDocuments(whereCondition);
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "Sub Category Found Successfully !",
            data: result,
            totalData: total,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.findAllDashboardSubcategory = findAllDashboardSubcategory;
// Update A Sub category
const updateSubcategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (req.files && ("subcategory_logo" in req.files || "subcategory_banner" in req.files) && req.body) {
            const requestData = req.body;
            let subcategory_slug = (0, slugify_1.default)(requestData === null || requestData === void 0 ? void 0 : requestData.subcategory_name);
            const findSubcategoryNameExit = yield subcategory_model_1.default.exists({
                subcategory_slug,
            });
            if (findSubcategoryNameExit &&
                (requestData === null || requestData === void 0 ? void 0 : requestData._id) !== (findSubcategoryNameExit === null || findSubcategoryNameExit === void 0 ? void 0 : findSubcategoryNameExit._id.toString())) {
                // fs.unlinkSync(req.files.subcategory_logo[0].path);
                throw new AppError_1.default(400, "This subcategory is already exists!");
            }
            // const findCategorySerialExit: boolean | null | undefined | any =
            //   await SubcategoryModel.exists({
            //     category_serial: requestData?.category_serial,
            //   });
            // if (
            //   findCategorySerialExit &&
            //   requestData?._id !== findCategorySerialExit?._id.toString()
            // ) {
            //   fs.unlinkSync(req.files.category_logo[0].path);
            //   throw new AppError(400, "Serial Number Previously Added !");
            // }
            // Find the category that currently has the given newSerial
            const existingSubcategory = yield subcategory_model_1.default.findOne({ category_id: requestData === null || requestData === void 0 ? void 0 : requestData.category_id, subcategory_serial: requestData === null || requestData === void 0 ? void 0 : requestData.subcategory_serial });
            //console.log("hello",existingSubcategory);
            // Find the category that is being updated
            const subcategoryToUpdate = yield subcategory_model_1.default.findById(requestData === null || requestData === void 0 ? void 0 : requestData._id);
            //console.log(subcategoryToUpdate);
            if (!subcategoryToUpdate) {
                throw new Error("Sub Category to update not found.");
            }
            if (existingSubcategory) {
                // Swap serials if another category already has the newSerial
                yield subcategory_model_1.default.findByIdAndUpdate(existingSubcategory._id, { subcategory_serial: subcategoryToUpdate.subcategory_serial });
            }
            // Update the requested category with the new serial
            yield subcategory_model_1.default.findByIdAndUpdate(requestData === null || requestData === void 0 ? void 0 : requestData._id, { subcategory_serial: requestData === null || requestData === void 0 ? void 0 : requestData.subcategory_serial });
            // get the category image and upload
            let subcategory_logo;
            let subcategory_logo_key;
            if (req.files && "subcategory_logo" in req.files) {
                const subcategoryImage = req.files["subcategory_logo"][0];
                const subcategory_logo_upload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(subcategoryImage);
                subcategory_logo = subcategory_logo_upload === null || subcategory_logo_upload === void 0 ? void 0 : subcategory_logo_upload.Location;
                subcategory_logo_key = subcategory_logo_upload === null || subcategory_logo_upload === void 0 ? void 0 : subcategory_logo_upload.Key;
                fs.existsSync(subcategoryImage.path) && fs.unlinkSync(subcategoryImage.path);
                // Delete old logo if key exists
                if (requestData === null || requestData === void 0 ? void 0 : requestData.subcategory_logo_key) {
                    yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces(requestData.subcategory_logo_key);
                }
            }
            // Handle banner uploads
            // let subcategory_banner = subcategoryToUpdate.subcategory_banner || [];
            // let subcategory_banner_key = subcategoryToUpdate.subcategory_banner_key || [];
            // if ("subcategory_banner" in req.files) {
            //   const bannerFiles = req.files["subcategory_banner"];
            //   const newBannerUrls: string[] = [];
            //   const newBannerKeys: string[] = [];
            //   for (const file of bannerFiles) {
            //     const upload = await FileUploadHelper.uploadToSpaces(file);
            //     newBannerUrls.push(upload?.Location);
            //     newBannerKeys.push(upload?.Key);
            //     // ✅ delete the local file after upload
            //     try {
            //       await fs.promises.unlink(file.path);
            //     } catch (err: any) {
            //       console.warn("Failed to delete local banner file:", file.path, err.message);
            //     }
            //   }
            //   // Optional: Delete old banners if replacing
            //   if (Array.isArray(requestData?.subcategory_banner_key)) {
            //     for (const oldKey of requestData.subcategory_banner_key) {
            //       await FileUploadHelper.deleteFromSpaces(oldKey);
            //     }
            //   }
            //   subcategory_banner = newBannerUrls;
            //   subcategory_banner_key = newBannerKeys;
            // }
            // Handle banner uploads - MODIFIED SECTION
            let subcategory_banner = [];
            let subcategory_banner_key = [];
            // Process existing banners
            if (req.body.subcategory_banner) {
                // Ensure we always work with an array
                const existingBanners = Array.isArray(req.body.subcategory_banner)
                    ? req.body.subcategory_banner
                    : [req.body.subcategory_banner];
                subcategory_banner = existingBanners.filter((b) => typeof b === 'string');
                // Process keys - ensure we have an array
                const existingKeys = Array.isArray(req.body.subcategory_banner_key)
                    ? req.body.subcategory_banner_key
                    : req.body.subcategory_banner_key ? [req.body.subcategory_banner_key] : [];
                // Match keys with banners
                subcategory_banner_key = existingKeys.slice(0, subcategory_banner.length);
            }
            // Process new banner files
            if ((_a = req.files) === null || _a === void 0 ? void 0 : _a.subcategory_banner) {
                const bannerFiles = Array.isArray(req.files["subcategory_banner"])
                    ? req.files["subcategory_banner"]
                    : [req.files["subcategory_banner"]];
                for (const file of bannerFiles) {
                    const upload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(file);
                    subcategory_banner.push(upload === null || upload === void 0 ? void 0 : upload.Location);
                    subcategory_banner_key.push(upload === null || upload === void 0 ? void 0 : upload.Key);
                    fs.existsSync(file.path) && fs.unlinkSync(file.path);
                }
            }
            const data = Object.assign(Object.assign({}, requestData), { subcategory_logo,
                subcategory_logo_key,
                subcategory_banner,
                subcategory_banner_key,
                subcategory_slug });
            const result = yield (0, subcategory_services_1.updateSubcategoryServices)(data, requestData === null || requestData === void 0 ? void 0 : requestData._id);
            if ((result === null || result === void 0 ? void 0 : result.modifiedCount) > 0) {
                if (requestData === null || requestData === void 0 ? void 0 : requestData.subcategory_logo_key) {
                    yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces(requestData === null || requestData === void 0 ? void 0 : requestData.subcategory_logo_key);
                }
                return (0, sendResponse_1.default)(res, {
                    statusCode: http_status_1.default.OK,
                    success: true,
                    message: "Sub Category Update Successfully !",
                });
            }
            else {
                throw new AppError_1.default(400, "Sub Category Update Failed !");
            }
        }
        else {
            const requestData = req.body;
            const subcategory_banner = (requestData === null || requestData === void 0 ? void 0 : requestData.subcategory_banner) ? requestData === null || requestData === void 0 ? void 0 : requestData.subcategory_banner : []; //if no file but still banner image then add or []
            const subcategory_banner_key = (requestData === null || requestData === void 0 ? void 0 : requestData.subcategory_banner_key) ? requestData === null || requestData === void 0 ? void 0 : requestData.subcategory_banner_key : [];
            let subcategory_slug = (0, slugify_1.default)(requestData === null || requestData === void 0 ? void 0 : requestData.subcategory_name);
            const findSubcategoryNameExit = yield subcategory_model_1.default.exists({
                subcategory_slug,
            });
            if (findSubcategoryNameExit &&
                (requestData === null || requestData === void 0 ? void 0 : requestData._id) !== (findSubcategoryNameExit === null || findSubcategoryNameExit === void 0 ? void 0 : findSubcategoryNameExit._id.toString())) {
                throw new AppError_1.default(400, "This subcategory is already exists!");
            }
            // const findCategorySerialExit: boolean | null | undefined | any =
            //   await SubcategoryModel.exists({
            //     category_serial: requestData?.category_serial,
            //   });
            // if (
            //   findCategorySerialExit &&
            //   requestData?._id !== findCategorySerialExit?._id.toString()
            // ) {
            //   throw new AppError(400, "Serial Number Previously Added !");
            // }
            // Find the category that currently has the given newSerial
            const existingSubcategory = yield subcategory_model_1.default.findOne({ category_id: requestData === null || requestData === void 0 ? void 0 : requestData.category_id, subcategory_serial: requestData === null || requestData === void 0 ? void 0 : requestData.subcategory_serial });
            // Find the category that is being updated
            const subcategoryToUpdate = yield subcategory_model_1.default.findById(requestData === null || requestData === void 0 ? void 0 : requestData._id);
            if (!subcategoryToUpdate) {
                throw new Error("Sub Category to update not found.");
            }
            if (existingSubcategory) {
                // Swap serials if another category already has the newSerial
                yield subcategory_model_1.default.findByIdAndUpdate(existingSubcategory._id, { subcategory_serial: subcategoryToUpdate.subcategory_serial });
            }
            // Update the requested category with the new serial
            yield subcategory_model_1.default.findByIdAndUpdate(requestData === null || requestData === void 0 ? void 0 : requestData._id, { subcategory_serial: requestData === null || requestData === void 0 ? void 0 : requestData.subcategory_serial });
            const data = Object.assign(Object.assign({}, requestData), { subcategory_banner, subcategory_banner_key, subcategory_slug });
            const result = yield (0, subcategory_services_1.updateSubcategoryServices)(data, requestData === null || requestData === void 0 ? void 0 : requestData._id);
            if ((result === null || result === void 0 ? void 0 : result.modifiedCount) > 0) {
                return (0, sendResponse_1.default)(res, {
                    statusCode: http_status_1.default.OK,
                    success: true,
                    message: "Sub Category Update Successfully !",
                });
            }
            else {
                throw new AppError_1.default(400, "Sub Category Update Failed !");
            }
        }
    }
    catch (error) {
        next(error);
    }
});
exports.updateSubcategory = updateSubcategory;
// delete A Sub category item
const deleteASubcategoryInfo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const subcategory_id = req.body._id;
        // const findSubcategoryInAttributeExist: boolean | null | undefined | any =
        //   await AttributeModel.exists({
        //     subcategory_id: subcategory_id,
        //   });
        // if (findSubcategoryInAttributeExist) {
        //   throw new AppError(400, "Already Added In Attribute!");
        // }
        const findCategoryInSubcategoryExist = yield category_model_1.default.exists({
            subcategory_id: subcategory_id,
        });
        if (findCategoryInSubcategoryExist) {
            throw new AppError_1.default(400, "Already Added In Subcategory!");
        }
        // const findCategoryInChildCategoryExist: boolean | null | undefined | any =
        //   await ChildSubcategoryModel.exists({
        //     category_id: category_id,
        //   });
        // if (findCategoryInChildCategoryExist) {
        //   throw new AppError(400, "Already Added In ChildCategory !");
        // }
        const result = yield (0, subcategory_services_1.deleteSubcategoryServices)(subcategory_id);
        if ((result === null || result === void 0 ? void 0 : result.deletedCount) > 0) {
            if ((_a = req.body) === null || _a === void 0 ? void 0 : _a.subcategory_logo_key) {
                yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces((_b = req.body) === null || _b === void 0 ? void 0 : _b.subcategory_logo_key);
            }
            return (0, sendResponse_1.default)(res, {
                statusCode: http_status_1.default.OK,
                success: true,
                message: "Sub Category Delete successfully !",
            });
        }
        else {
            throw new AppError_1.default(400, "Sub Category delete failed !");
        }
    }
    catch (error) {
        next(error);
    }
});
exports.deleteASubcategoryInfo = deleteASubcategoryInfo;
// //get single category item
// export const getSingleCategory = catchAsync(async (req, res) => {
//   const { _id } = req.body;
//   const result = await getSingleCategoryServices(_id);
//   //console.log(result);
//   sendResponse(res, {
//       success: true,
//       statusCode: 200,
//       message: 'Category retrieved successfully',
//       data: result,
//   });
// });
