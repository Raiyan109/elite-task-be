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
exports.deleteAChildcategoryInfo = exports.updateChildcategory = exports.findAllDashboardChildcategory = exports.findAllChildcategory = exports.postChildcategory = void 0;
const fs = __importStar(require("fs"));
const http_status_1 = __importDefault(require("http-status"));
const slugify_1 = __importDefault(require("slugify"));
const childcategory_interface_1 = require("./childcategory.interface");
const childcategory_model_1 = __importDefault(require("./childcategory.model"));
const childcategory_services_1 = require("./childcategory.services");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const category_model_1 = __importDefault(require("../Category/category.model"));
// Add A Category
const postChildcategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.files || !("childcategory_logo" in req.files)) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: 'Logo is required',
        });
    }
    try {
        // if (req.files && "childcategory_logo" in req.files && req.body) {
        const requestData = req.body;
        let childcategory_slug = (0, slugify_1.default)(requestData === null || requestData === void 0 ? void 0 : requestData.childcategory_name);
        const findChildcategoryNameExit = yield childcategory_model_1.default.exists({
            childcategory_slug,
        });
        if (findChildcategoryNameExit) {
            fs.unlinkSync(req.files.childcategory_logo[0].path);
            throw new AppError_1.default(400, "This childcategory is already exists!");
        }
        // Get the highest category_serial
        const lastChildcategory = yield childcategory_model_1.default.findOne({ subcategory_id: requestData === null || requestData === void 0 ? void 0 : requestData.subcategory_id }).sort({ childcategory_serial: -1 });
        // Determine the new category_serial
        const newChildcategorySerial = lastChildcategory ? lastChildcategory.childcategory_serial + 1 : 1;
        // get the childcategory image and upload
        let childcategory_logo;
        let childcategory_logo_key;
        if (req.files && "childcategory_logo" in req.files) {
            const childcategoryImage = req.files["childcategory_logo"][0];
            const childcategory_logo_upload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(childcategoryImage);
            childcategory_logo = childcategory_logo_upload === null || childcategory_logo_upload === void 0 ? void 0 : childcategory_logo_upload.Location;
            childcategory_logo_key = childcategory_logo_upload === null || childcategory_logo_upload === void 0 ? void 0 : childcategory_logo_upload.Key;
        }
        // Upload banners (optional)
        let childcategory_banner = [];
        let childcategory_banner_key = [];
        if ("childcategory_banner" in req.files) {
            const childcategoryBanner = req.files["childcategory_banner"];
            for (const file of childcategoryBanner) {
                const upload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(file);
                childcategory_banner.push(upload === null || upload === void 0 ? void 0 : upload.Location);
                childcategory_banner_key.push(upload === null || upload === void 0 ? void 0 : upload.Key);
            }
        }
        const data = Object.assign(Object.assign({}, requestData), { childcategory_logo,
            childcategory_logo_key,
            childcategory_banner,
            childcategory_banner_key,
            childcategory_slug, childcategory_serial: newChildcategorySerial });
        const result = yield (0, childcategory_services_1.postChildcategoryServices)(data);
        if (result) {
            return (0, sendResponse_1.default)(res, {
                statusCode: http_status_1.default.OK,
                success: true,
                message: "Child Category Added Successfully !",
                data: result
            });
        }
        else {
            throw new AppError_1.default(400, "Child Category Added Failed !");
        }
        // } else {
        //   throw new AppError(400, "Image Upload Failed");
        // }
    }
    catch (error) {
        next(error);
    }
});
exports.postChildcategory = postChildcategory;
// Find All Category
const findAllChildcategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.query, { searchTerm } = _a, filterData = __rest(_a, ["searchTerm"]);
        const result = yield (0, childcategory_services_1.findAllChildcategoryServices)(searchTerm);
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "Child Category Found Successfully !",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.findAllChildcategory = findAllChildcategory;
// Find All dashboard Category
const findAllDashboardChildcategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, searchTerm, subcategory_id } = req.query;
        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        const skip = (pageNumber - 1) * limitNumber;
        const result = yield (0, childcategory_services_1.findAllDashboardChildcategoryServices)(limitNumber, skip, searchTerm, subcategory_id);
        const andCondition = [];
        if (searchTerm) {
            andCondition.push({
                $or: childcategory_interface_1.childcategorySearchableField.map((field) => ({
                    [field]: {
                        $regex: searchTerm,
                        $options: "i",
                    },
                })),
            });
        }
        const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};
        const total = yield childcategory_model_1.default.countDocuments(whereCondition);
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "Child Category Found Successfully !",
            data: result,
            totalData: total,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.findAllDashboardChildcategory = findAllDashboardChildcategory;
// Update A Category
const updateChildcategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (req.files && ("childcategory_logo" in req.files || "childcategory_banner" in req.files) && req.body) {
            const requestData = req.body;
            let childcategory_slug = (0, slugify_1.default)(requestData === null || requestData === void 0 ? void 0 : requestData.childcategory_name);
            const findChildcategoryNameExit = yield childcategory_model_1.default.exists({
                childcategory_slug,
            });
            if (findChildcategoryNameExit &&
                (requestData === null || requestData === void 0 ? void 0 : requestData._id) !== (findChildcategoryNameExit === null || findChildcategoryNameExit === void 0 ? void 0 : findChildcategoryNameExit._id.toString())) {
                fs.unlinkSync(req.files.childcategory_logo[0].path);
                throw new AppError_1.default(400, "This childcategory is already exists!");
            }
            // const findCategorySerialExit: boolean | null | undefined | any =
            //   await ChildcategoryModel.exists({
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
            const existingChildcategory = yield childcategory_model_1.default.findOne({ subcategory_id: requestData === null || requestData === void 0 ? void 0 : requestData.subcategory_id, childcategory_serial: requestData === null || requestData === void 0 ? void 0 : requestData.childcategory_serial });
            //console.log("hello",existingChildcategory);
            // Find the category that is being updated
            const childcategoryToUpdate = yield childcategory_model_1.default.findById(requestData === null || requestData === void 0 ? void 0 : requestData._id);
            //console.log(childcategoryToUpdate);
            if (!childcategoryToUpdate) {
                throw new Error("Child Category to update not found.");
            }
            if (existingChildcategory) {
                // Swap serials if another category already has the newSerial
                yield childcategory_model_1.default.findByIdAndUpdate(existingChildcategory._id, { childcategory_serial: childcategoryToUpdate.childcategory_serial });
            }
            // Update the requested category with the new serial
            yield childcategory_model_1.default.findByIdAndUpdate(requestData === null || requestData === void 0 ? void 0 : requestData._id, { childcategory_serial: requestData === null || requestData === void 0 ? void 0 : requestData.childcategory_serial });
            // get the category image and upload
            let childcategory_logo;
            let childcategory_logo_key;
            if (req.files && "childcategory_logo" in req.files) {
                const childcategoryImage = req.files["childcategory_logo"][0];
                const childcategory_logo_upload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(childcategoryImage);
                childcategory_logo = childcategory_logo_upload === null || childcategory_logo_upload === void 0 ? void 0 : childcategory_logo_upload.Location;
                childcategory_logo_key = childcategory_logo_upload === null || childcategory_logo_upload === void 0 ? void 0 : childcategory_logo_upload.Key;
            }
            // Handle banner uploads
            // let childcategory_banner = childcategoryToUpdate.childcategory_banner || [];
            // let childcategory_banner_key = childcategoryToUpdate.childcategory_banner_key || [];
            // if ("childcategory_banner" in req.files) {
            //   const bannerFiles = req.files["childcategory_banner"];
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
            //   if (Array.isArray(requestData?.childcategory_banner_key)) {
            //     for (const oldKey of requestData.childcategory_banner_key) {
            //       await FileUploadHelper.deleteFromSpaces(oldKey);
            //     }
            //   }
            //   childcategory_banner = newBannerUrls;
            //   childcategory_banner_key = newBannerKeys;
            // }
            // Handle banner uploads - MODIFIED SECTION
            let childcategory_banner = [];
            let childcategory_banner_key = [];
            // Process existing banners
            if (req.body.childcategory_banner) {
                // Ensure we always work with an array
                const existingBanners = Array.isArray(req.body.childcategory_banner)
                    ? req.body.childcategory_banner
                    : [req.body.childcategory_banner];
                childcategory_banner = existingBanners.filter((b) => typeof b === 'string');
                // Process keys - ensure we have an array
                const existingKeys = Array.isArray(req.body.childcategory_banner_key)
                    ? req.body.childcategory_banner_key
                    : req.body.childcategory_banner_key ? [req.body.childcategory_banner_key] : [];
                // Match keys with banners
                childcategory_banner_key = existingKeys.slice(0, childcategory_banner.length);
            }
            // Process new banner files
            if ((_a = req.files) === null || _a === void 0 ? void 0 : _a.childcategory_banner) {
                const bannerFiles = Array.isArray(req.files["childcategory_banner"])
                    ? req.files["childcategory_banner"]
                    : [req.files["childcategory_banner"]];
                for (const file of bannerFiles) {
                    const upload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(file);
                    childcategory_banner.push(upload === null || upload === void 0 ? void 0 : upload.Location);
                    childcategory_banner_key.push(upload === null || upload === void 0 ? void 0 : upload.Key);
                    fs.existsSync(file.path) && fs.unlinkSync(file.path);
                }
            }
            const data = Object.assign(Object.assign({}, requestData), { childcategory_logo,
                childcategory_logo_key,
                childcategory_banner,
                childcategory_banner_key,
                childcategory_slug });
            const result = yield (0, childcategory_services_1.updateChildcategoryServices)(data, requestData === null || requestData === void 0 ? void 0 : requestData._id);
            if ((result === null || result === void 0 ? void 0 : result.modifiedCount) > 0) {
                if (requestData === null || requestData === void 0 ? void 0 : requestData.childcategory_logo_key) {
                    yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces(requestData === null || requestData === void 0 ? void 0 : requestData.childcategory_logo_key);
                }
                return (0, sendResponse_1.default)(res, {
                    statusCode: http_status_1.default.OK,
                    success: true,
                    message: "Child Category Update Successfully !",
                });
            }
            else {
                throw new AppError_1.default(400, "Child Category Update Failed !");
            }
        }
        else {
            const requestData = req.body;
            const childcategory_banner = (requestData === null || requestData === void 0 ? void 0 : requestData.childcategory_banner) ? requestData === null || requestData === void 0 ? void 0 : requestData.childcategory_banner : []; //if no file but still banner image then add or []
            const childcategory_banner_key = (requestData === null || requestData === void 0 ? void 0 : requestData.childcategory_banner_key) ? requestData === null || requestData === void 0 ? void 0 : requestData.childcategory_banner_key : [];
            let childcategory_slug = (0, slugify_1.default)(requestData === null || requestData === void 0 ? void 0 : requestData.childcategory_name);
            const findChildcategoryNameExit = yield childcategory_model_1.default.exists({
                childcategory_slug,
            });
            if (findChildcategoryNameExit &&
                (requestData === null || requestData === void 0 ? void 0 : requestData._id) !== (findChildcategoryNameExit === null || findChildcategoryNameExit === void 0 ? void 0 : findChildcategoryNameExit._id.toString())) {
                throw new AppError_1.default(400, "This childcategory is already exists!");
            }
            // const findCategorySerialExit: boolean | null | undefined | any =
            //   await ChildcategoryModel.exists({
            //     category_serial: requestData?.category_serial,
            //   });
            // if (
            //   findCategorySerialExit &&
            //   requestData?._id !== findCategorySerialExit?._id.toString()
            // ) {
            //   throw new AppError(400, "Serial Number Previously Added !");
            // }
            // Find the category that currently has the given newSerial
            const existingChildcategory = yield childcategory_model_1.default.findOne({ subcategory_id: requestData === null || requestData === void 0 ? void 0 : requestData.subcategory_id, childcategory_serial: requestData === null || requestData === void 0 ? void 0 : requestData.childcategory_serial });
            // Find the category that is being updated
            const childcategoryToUpdate = yield childcategory_model_1.default.findById(requestData === null || requestData === void 0 ? void 0 : requestData._id);
            if (!childcategoryToUpdate) {
                throw new Error("Child Category to update not found.");
            }
            if (existingChildcategory) {
                // Swap serials if another category already has the newSerial
                yield childcategory_model_1.default.findByIdAndUpdate(existingChildcategory._id, { childcategory_serial: childcategoryToUpdate.childcategory_serial });
            }
            // Update the requested category with the new serial
            yield childcategory_model_1.default.findByIdAndUpdate(requestData === null || requestData === void 0 ? void 0 : requestData._id, { childcategory_serial: requestData === null || requestData === void 0 ? void 0 : requestData.childcategory_serial });
            const data = Object.assign(Object.assign({}, requestData), { childcategory_banner, childcategory_banner_key, childcategory_slug });
            const result = yield (0, childcategory_services_1.updateChildcategoryServices)(data, requestData === null || requestData === void 0 ? void 0 : requestData._id);
            if ((result === null || result === void 0 ? void 0 : result.modifiedCount) > 0) {
                return (0, sendResponse_1.default)(res, {
                    statusCode: http_status_1.default.OK,
                    success: true,
                    message: "Child Category Update Successfully !",
                });
            }
            else {
                throw new AppError_1.default(400, "Child Category Update Failed !");
            }
        }
    }
    catch (error) {
        next(error);
    }
});
exports.updateChildcategory = updateChildcategory;
// delete A Category item
const deleteAChildcategoryInfo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const childcategory_id = req.body._id;
        // const findChildcategoryInAttributeExist: boolean | null | undefined | any =
        //   await AttributeModel.exists({
        //     childcategory_id: childcategory_id,
        //   });
        // if (findChildcategoryInAttributeExist) {
        //   throw new AppError(400, "Already Added In Attribute!");
        // }
        const findCategoryInChildcategoryExist = yield category_model_1.default.exists({
            childcategory_id: childcategory_id,
        });
        if (findCategoryInChildcategoryExist) {
            throw new AppError_1.default(400, "Already Added In Childcategory!");
        }
        // const findCategoryInChildCategoryExist: boolean | null | undefined | any =
        //   await ChildChildcategoryModel.exists({
        //     category_id: category_id,
        //   });
        // if (findCategoryInChildCategoryExist) {
        //   throw new AppError(400, "Already Added In ChildCategory !");
        // }
        const result = yield (0, childcategory_services_1.deleteChildcategoryServices)(childcategory_id);
        if ((result === null || result === void 0 ? void 0 : result.deletedCount) > 0) {
            if ((_a = req.body) === null || _a === void 0 ? void 0 : _a.childcategory_logo_key) {
                yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces((_b = req.body) === null || _b === void 0 ? void 0 : _b.childcategory_logo_key);
            }
            return (0, sendResponse_1.default)(res, {
                statusCode: http_status_1.default.OK,
                success: true,
                message: "Child Category Delete successfully !",
            });
        }
        else {
            throw new AppError_1.default(400, "Child Category delete failed !");
        }
    }
    catch (error) {
        next(error);
    }
});
exports.deleteAChildcategoryInfo = deleteAChildcategoryInfo;
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
