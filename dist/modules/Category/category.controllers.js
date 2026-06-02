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
exports.deleteACategoryInfo = exports.updateCategory = exports.findNestedCategory = exports.findGroceryCategoryBannerAndReels = exports.findAllDashboardCategory = exports.findAllCategory = exports.postCategory = void 0;
const category_interface_1 = require("./category.interface");
const category_services_1 = require("./category.services");
const fs = __importStar(require("fs"));
const category_model_1 = __importDefault(require("./category.model"));
const http_status_1 = __importDefault(require("http-status"));
const slugify_1 = __importDefault(require("slugify"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const subcategory_model_1 = __importDefault(require("../Subcategory/subcategory.model"));
const childcategory_model_1 = __importDefault(require("../Childcategory/childcategory.model"));
// Add A Category
const postCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.files || !("category_logo" in req.files)) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: 'Logo are required',
        });
    }
    try {
        // if (req.files && "category_logo" in req.files && "category_banner" in req.files && req.body) {
        const requestData = req.body;
        let category_slug = (0, slugify_1.default)(requestData === null || requestData === void 0 ? void 0 : requestData.category_name);
        const findCategoryNameExit = yield category_model_1.default.exists({
            category_slug,
        });
        if (findCategoryNameExit) {
            fs.unlinkSync(req.files.category_logo[0].path);
            throw new AppError_1.default(400, "This category is already exists!");
        }
        // Get the highest category_serial
        const lastCategory = yield category_model_1.default.findOne().sort({ category_serial: -1 });
        // Determine the new category_serial
        const newCategorySerial = lastCategory ? lastCategory.category_serial + 1 : 1;
        // get the category image and upload
        let category_logo;
        let category_logo_key;
        if (req.files && "category_logo" in req.files) {
            const categoryImage = req.files["category_logo"][0];
            const category_logo_upload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(categoryImage);
            category_logo = category_logo_upload === null || category_logo_upload === void 0 ? void 0 : category_logo_upload.Location;
            category_logo_key = category_logo_upload === null || category_logo_upload === void 0 ? void 0 : category_logo_upload.Key;
        }
        // Upload banners (optional)
        let category_banner = [];
        let category_banner_key = [];
        if ("category_banner" in req.files) {
            const categoryBanner = req.files["category_banner"];
            for (const file of categoryBanner) {
                const upload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(file);
                category_banner.push(upload === null || upload === void 0 ? void 0 : upload.Location);
                category_banner_key.push(upload === null || upload === void 0 ? void 0 : upload.Key);
            }
        }
        const data = Object.assign(Object.assign({}, requestData), { category_logo,
            category_logo_key,
            category_banner,
            category_banner_key,
            category_slug, category_serial: newCategorySerial });
        const result = yield (0, category_services_1.postCategoryServices)(data);
        if (result) {
            return (0, sendResponse_1.default)(res, {
                statusCode: http_status_1.default.OK,
                success: true,
                message: "Category Added Successfully !",
            });
        }
        else {
            throw new AppError_1.default(400, "Category Added Failed !");
        }
        // } else {
        //   throw new AppError(400, "Image Upload Failed");
        // }
    }
    catch (error) {
        next(error);
    }
});
exports.postCategory = postCategory;
// Find All Category
const findAllCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.query, { searchTerm } = _a, filterData = __rest(_a, ["searchTerm"]);
        const result = yield (0, category_services_1.findAllCategoryServices)(searchTerm);
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "Category Found Successfully !",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.findAllCategory = findAllCategory;
// Find All dashboard Category
const findAllDashboardCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, limit, searchTerm } = req.query;
        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        const skip = (pageNumber - 1) * limitNumber;
        const result = yield (0, category_services_1.findAllDashboardCategoryServices)(limitNumber, skip, searchTerm);
        const andCondition = [];
        if (searchTerm) {
            andCondition.push({
                $or: category_interface_1.categorySearchableField.map((field) => ({
                    [field]: {
                        $regex: searchTerm,
                        $options: "i",
                    },
                })),
            });
        }
        const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};
        const total = yield category_model_1.default.countDocuments(whereCondition);
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "Category Found Successfully !",
            data: result,
            totalData: total,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.findAllDashboardCategory = findAllDashboardCategory;
// Find All Grocery Category Banner And Reels
const findGroceryCategoryBannerAndReels = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, category_services_1.findGroceryCategoryBannerAndReelsServices)();
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "Grocery Category Banner And Reels Found Successfully !",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.findGroceryCategoryBannerAndReels = findGroceryCategoryBannerAndReels;
// Find Nested category 
const findNestedCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield category_model_1.default.find({ category_status: 'active' })
            .sort({ category_serial: 1 })
            .lean();
        const subcategories = yield subcategory_model_1.default.find({ subcategory_status: 'active' })
            .sort({ subcategory_serial: 1 })
            .lean();
        const childcategories = yield childcategory_model_1.default.find({ childcategory_status: 'active' })
            .sort({ childcategory_serial: 1 })
            .lean();
        // Build nested structure
        const nested = categories.map(category => {
            const catSubs = subcategories.filter(sub => sub.category_id.equals(category._id));
            const subsWithChildren = catSubs.map(sub => {
                const subChildren = childcategories.filter(child => child.subcategory_id.equals(sub._id));
                // Always add "Others" as default
                const childrensWithOthers = [
                    ...subChildren,
                    {
                        childcategory_name: "Others",
                        childcategory_slug: "Others",
                    },
                ];
                return Object.assign(Object.assign({}, sub), { childrens: childrensWithOthers });
            });
            return Object.assign(Object.assign({}, category), { subcategories: subsWithChildren });
        });
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "Nested category Found Successfully !",
            data: nested,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.findNestedCategory = findNestedCategory;
// Update A Category
const updateCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (req.files && ("category_logo" in req.files || "category_banner" in req.files) && req.body) {
            const requestData = req.body;
            console.log("requestData", requestData);
            console.log("req.files", req.files);
            let category_slug = (0, slugify_1.default)(requestData === null || requestData === void 0 ? void 0 : requestData.category_name);
            const findCategoryNameExit = yield category_model_1.default.exists({
                category_slug,
            });
            if (findCategoryNameExit &&
                (requestData === null || requestData === void 0 ? void 0 : requestData._id) !== (findCategoryNameExit === null || findCategoryNameExit === void 0 ? void 0 : findCategoryNameExit._id.toString())) {
                // fs.unlinkSync(req.files.category_logo[0].path);
                throw new AppError_1.default(400, "This category is already exists!");
            }
            // const findCategorySerialExit: boolean | null | undefined | any =
            //   await CategoryModel.exists({
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
            const existingCategory = yield category_model_1.default.findOne({ category_serial: requestData === null || requestData === void 0 ? void 0 : requestData.category_serial });
            //console.log("hello",existingCategory);
            // Find the category that is being updated
            const categoryToUpdate = yield category_model_1.default.findById(requestData === null || requestData === void 0 ? void 0 : requestData._id);
            //console.log(categoryToUpdate);
            if (!categoryToUpdate) {
                throw new Error("Category to update not found.");
            }
            if (existingCategory) {
                // Swap serials if another category already has the newSerial
                yield category_model_1.default.findByIdAndUpdate(existingCategory._id, { category_serial: categoryToUpdate.category_serial });
            }
            // Update the requested category with the new serial
            yield category_model_1.default.findByIdAndUpdate(requestData === null || requestData === void 0 ? void 0 : requestData._id, { category_serial: requestData === null || requestData === void 0 ? void 0 : requestData.category_serial });
            // get the category image and upload
            let category_logo;
            let category_logo_key;
            if (req.files && "category_logo" in req.files) {
                const categoryImage = req.files["category_logo"][0];
                const category_logo_upload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(categoryImage);
                category_logo = category_logo_upload === null || category_logo_upload === void 0 ? void 0 : category_logo_upload.Location;
                category_logo_key = category_logo_upload === null || category_logo_upload === void 0 ? void 0 : category_logo_upload.Key;
                fs.existsSync(categoryImage.path) && fs.unlinkSync(categoryImage.path);
                // Delete old logo if key exists
                if (requestData === null || requestData === void 0 ? void 0 : requestData.category_logo_key) {
                    yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces(requestData.category_logo_key);
                }
            }
            // Handle banner uploads
            // let category_banner = categoryToUpdate.category_banner || [];
            // let category_banner_key = categoryToUpdate.category_banner_key || [];
            // if ("category_banner" in req.files) {
            //   const bannerFiles = req.files["category_banner"];
            //   const bannerExistingFiles = categoryToUpdate.category_banner || [];
            //   const bannerExistingKeys = categoryToUpdate.category_banner_key || [];
            //   console.log(bannerExistingFiles, "bannerExistingFiles");
            //   const newBannerUrls: string[] = [...bannerExistingFiles];
            //   const newBannerKeys: string[] = [...bannerExistingKeys];
            //   for (const file of bannerFiles) {
            //     const upload = await FileUploadHelper.uploadToSpaces(file);
            //     newBannerUrls.push(upload?.Location);
            //     newBannerKeys.push(upload?.Key);
            //   }
            //   // Optional: Delete old banners if replacing
            //   if (Array.isArray(requestData?.category_banner_key)) {
            //     for (const oldKey of requestData.category_banner_key) {
            //       await FileUploadHelper.deleteFromSpaces(oldKey);
            //     }
            //   }
            //   category_banner = newBannerUrls;
            //   category_banner_key = newBannerKeys;
            // }
            // Handle banner uploads - MODIFIED SECTION
            let category_banner = [];
            let category_banner_key = [];
            // Process existing banners
            if (req.body.category_banner) {
                // Ensure we always work with an array
                const existingBanners = Array.isArray(req.body.category_banner)
                    ? req.body.category_banner
                    : [req.body.category_banner];
                category_banner = existingBanners.filter((b) => typeof b === 'string');
                // Process keys - ensure we have an array
                const existingKeys = Array.isArray(req.body.category_banner_key)
                    ? req.body.category_banner_key
                    : req.body.category_banner_key ? [req.body.category_banner_key] : [];
                // Match keys with banners
                category_banner_key = existingKeys.slice(0, category_banner.length);
            }
            // Process new banner files
            if ((_a = req.files) === null || _a === void 0 ? void 0 : _a.category_banner) {
                const bannerFiles = Array.isArray(req.files["category_banner"])
                    ? req.files["category_banner"]
                    : [req.files["category_banner"]];
                for (const file of bannerFiles) {
                    const upload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(file);
                    category_banner.push(upload === null || upload === void 0 ? void 0 : upload.Location);
                    category_banner_key.push(upload === null || upload === void 0 ? void 0 : upload.Key);
                    fs.existsSync(file.path) && fs.unlinkSync(file.path);
                }
            }
            const data = Object.assign(Object.assign({}, requestData), { category_logo, category_logo_key, category_banner,
                category_banner_key, category_slug });
            const result = yield (0, category_services_1.updateCategoryServices)(data, requestData === null || requestData === void 0 ? void 0 : requestData._id);
            if ((result === null || result === void 0 ? void 0 : result.modifiedCount) > 0) {
                if (requestData === null || requestData === void 0 ? void 0 : requestData.category_logo_key) {
                    yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces(requestData === null || requestData === void 0 ? void 0 : requestData.category_logo_key);
                }
                return (0, sendResponse_1.default)(res, {
                    statusCode: http_status_1.default.OK,
                    success: true,
                    message: "Category Update Successfully !",
                });
            }
            else {
                throw new AppError_1.default(400, "Category Update Failed !");
            }
        }
        else {
            const requestData = req.body;
            const category_banner = (requestData === null || requestData === void 0 ? void 0 : requestData.category_banner) ? requestData === null || requestData === void 0 ? void 0 : requestData.category_banner : []; //if no file but still banner image then add or []
            const category_banner_key = (requestData === null || requestData === void 0 ? void 0 : requestData.category_banner_key) ? requestData === null || requestData === void 0 ? void 0 : requestData.category_banner_key : [];
            // console.log("requestData from cat controller without file", requestData);
            let category_slug = (0, slugify_1.default)(requestData === null || requestData === void 0 ? void 0 : requestData.category_name);
            const findCategoryNameExit = yield category_model_1.default.exists({
                category_slug,
            });
            if (findCategoryNameExit &&
                (requestData === null || requestData === void 0 ? void 0 : requestData._id) !== (findCategoryNameExit === null || findCategoryNameExit === void 0 ? void 0 : findCategoryNameExit._id.toString())) {
                throw new AppError_1.default(400, "This category is already exists!");
            }
            // const findCategorySerialExit: boolean | null | undefined | any =
            //   await CategoryModel.exists({
            //     category_serial: requestData?.category_serial,
            //   });
            // if (
            //   findCategorySerialExit &&
            //   requestData?._id !== findCategorySerialExit?._id.toString()
            // ) {
            //   throw new AppError(400, "Serial Number Previously Added !");
            // }
            // Find the category that currently has the given newSerial
            const existingCategory = yield category_model_1.default.findOne({ category_serial: requestData === null || requestData === void 0 ? void 0 : requestData.category_serial });
            // Find the category that is being updated
            const categoryToUpdate = yield category_model_1.default.findById(requestData === null || requestData === void 0 ? void 0 : requestData._id);
            if (!categoryToUpdate) {
                throw new Error("Category to update not found.");
            }
            if (existingCategory) {
                // Swap serials if another category already has the newSerial
                yield category_model_1.default.findByIdAndUpdate(existingCategory._id, { category_serial: categoryToUpdate.category_serial });
            }
            // Update the requested category with the new serial
            yield category_model_1.default.findByIdAndUpdate(requestData === null || requestData === void 0 ? void 0 : requestData._id, { category_serial: requestData === null || requestData === void 0 ? void 0 : requestData.category_serial });
            const data = Object.assign(Object.assign({}, requestData), { category_banner, category_banner_key, category_slug });
            const result = yield (0, category_services_1.updateCategoryServices)(data, requestData === null || requestData === void 0 ? void 0 : requestData._id);
            if ((result === null || result === void 0 ? void 0 : result.modifiedCount) > 0) {
                return (0, sendResponse_1.default)(res, {
                    statusCode: http_status_1.default.OK,
                    success: true,
                    message: "Category Update Successfully !",
                });
            }
            else {
                throw new AppError_1.default(400, "Category Update Failed !");
            }
        }
    }
    catch (error) {
        next(error);
    }
});
exports.updateCategory = updateCategory;
// export const updateCategory: RequestHandler = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<ICategoryInterface | any> => {
//   try {
//     if (req.files && ("category_logo" in req.files || "category_banner" in req.files) && req.body) {
//       const requestData = req.body;
//       console.log("requestData", requestData);
//       console.log("req.files", req.files);
//       let category_slug = slugify(requestData?.category_name);
//       const findCategoryNameExit: boolean | null | undefined | any =
//         await CategoryModel.exists({
//           category_slug,
//         });
//       if (
//         findCategoryNameExit &&
//         requestData?._id !== findCategoryNameExit?._id.toString()
//       ) {
//         // fs.unlinkSync(req.files.category_logo[0].path);
//         throw new AppError(400, "This category is already exists!");
//       }
//       // const findCategorySerialExit: boolean | null | undefined | any =
//       //   await CategoryModel.exists({
//       //     category_serial: requestData?.category_serial,
//       //   });
//       // if (
//       //   findCategorySerialExit &&
//       //   requestData?._id !== findCategorySerialExit?._id.toString()
//       // ) {
//       //   fs.unlinkSync(req.files.category_logo[0].path);
//       //   throw new AppError(400, "Serial Number Previously Added !");
//       // }
//       // Find the category that currently has the given newSerial
//       const existingCategory = await CategoryModel.findOne({ category_serial: requestData?.category_serial });
//       //console.log("hello",existingCategory);
//       // Find the category that is being updated
//       const categoryToUpdate = await CategoryModel.findById(requestData?._id);
//       //console.log(categoryToUpdate);
//       if (!categoryToUpdate) {
//         throw new Error("Category to update not found.");
//       }
//       if (existingCategory) {
//         // Swap serials if another category already has the newSerial
//         await CategoryModel.findByIdAndUpdate(existingCategory._id, { category_serial: categoryToUpdate.category_serial });
//       }
//       // Update the requested category with the new serial
//       await CategoryModel.findByIdAndUpdate(requestData?._id, { category_serial: requestData?.category_serial });
//       // get the category image and upload
//       let category_logo;
//       let category_logo_key;
//       if (req.files && "category_logo" in req.files) {
//         const categoryImage = req.files["category_logo"][0];
//         const category_logo_upload = await FileUploadHelper.uploadToSpaces(
//           categoryImage
//         );
//         category_logo = category_logo_upload?.Location;
//         category_logo_key = category_logo_upload?.Key;
//         // fs.unlinkSync(categoryImage.path);
//         // Delete old logo if key exists
//         if (requestData?.category_logo_key) {
//           await FileUploadHelper.deleteFromSpaces(requestData.category_logo_key);
//         }
//       }
//       // Handle banner uploads
//       let category_banner = categoryToUpdate.category_banner || [];
//       // let category_banner_key = categoryToUpdate.category_banner_key || [];
//       if ("category_banner" in req.files) {
//         const bannerFiles = req.files["category_banner"];
//         const bannerExistingFiles = categoryToUpdate.category_banner || [];
//         // const bannerExistingKeys = categoryToUpdate.category_banner_key || [];
//         console.log(bannerExistingFiles, "bannerExistingFiles");
//         const newBannerUrls: string[] = [...bannerExistingFiles];
//         // const newBannerKeys: string[] = [...bannerExistingKeys];
//         for (const file of bannerFiles) {
//           const upload = await FileUploadHelper.uploadToSpaces(file);
//           newBannerUrls.push(upload?.Location);
//           // newBannerKeys.push(upload?.Key);
//         }
//         // Optional: Delete old banners if replacing
//         if (Array.isArray(requestData?.category_banner_key)) {
//           for (const oldKey of requestData.category_banner_key) {
//             await FileUploadHelper.deleteFromSpaces(oldKey);
//           }
//         }
//         category_banner = newBannerUrls;
//         // category_banner_key = newBannerKeys;
//       }
//       const data = {
//         ...requestData, category_logo, category_logo_key, category_banner,
//          category_slug
//       };
//       const result: ICategoryInterface | any = await updateCategoryServices(
//         data,
//         requestData?._id
//       );
//       if (result?.modifiedCount > 0) {
//         if (requestData?.category_logo_key) {
//           await FileUploadHelper.deleteFromSpaces(
//             requestData?.category_logo_key
//           );
//         }
//         return sendResponse<ICategoryInterface>(res, {
//           statusCode: httpStatus.OK,
//           success: true,
//           message: "Category Update Successfully !",
//         });
//       } else {
//         throw new AppError(400, "Category Update Failed !");
//       }
//     } else {
//       const requestData = req.body;
//       console.log("requestData from cat controller without file", requestData);
//       let category_slug = slugify(requestData?.category_name);
//       const findCategoryNameExit: boolean | null | undefined | any =
//         await CategoryModel.exists({
//           category_slug,
//         });
//       if (
//         findCategoryNameExit &&
//         requestData?._id !== findCategoryNameExit?._id.toString()
//       ) {
//         throw new AppError(400, "This category is already exists!");
//       }
//       // const findCategorySerialExit: boolean | null | undefined | any =
//       //   await CategoryModel.exists({
//       //     category_serial: requestData?.category_serial,
//       //   });
//       // if (
//       //   findCategorySerialExit &&
//       //   requestData?._id !== findCategorySerialExit?._id.toString()
//       // ) {
//       //   throw new AppError(400, "Serial Number Previously Added !");
//       // }
//       // Find the category that currently has the given newSerial
//       const existingCategory = await CategoryModel.findOne({ category_serial: requestData?.category_serial });
//       // Find the category that is being updated
//       const categoryToUpdate = await CategoryModel.findById(requestData?._id);
//       if (!categoryToUpdate) {
//         throw new Error("Category to update not found.");
//       }
//       if (existingCategory) {
//         // Swap serials if another category already has the newSerial
//         await CategoryModel.findByIdAndUpdate(existingCategory._id, { category_serial: categoryToUpdate.category_serial });
//       }
//       // Update the requested category with the new serial
//       await CategoryModel.findByIdAndUpdate(requestData?._id, { category_serial: requestData?.category_serial });
//       const data = { ...requestData, category_slug };
//       const result: ICategoryInterface | any = await updateCategoryServices(
//         data,
//         requestData?._id
//       );
//       if (result?.modifiedCount > 0) {
//         return sendResponse<ICategoryInterface>(res, {
//           statusCode: httpStatus.OK,
//           success: true,
//           message: "Category Update Successfully !",
//         });
//       } else {
//         throw new AppError(400, "Category Update Failed !");
//       }
//     }
//   } catch (error: any) {
//     next(error);
//   }
// };
// delete A Category item
const deleteACategoryInfo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const category_id = req.body._id;
        // const findCategoryInChildCategoryExist: boolean | null | undefined | any =
        //   await ChildCategoryModel.exists({
        //     category_id: category_id,
        //   });
        // if (findCategoryInChildCategoryExist) {
        //   throw new AppError(400, "Already Added In ChildCategory !");
        // }
        const result = yield (0, category_services_1.deleteCategoryServices)(category_id);
        if ((result === null || result === void 0 ? void 0 : result.deletedCount) > 0) {
            if ((_a = req.body) === null || _a === void 0 ? void 0 : _a.category_logo_key) {
                yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces((_b = req.body) === null || _b === void 0 ? void 0 : _b.category_logo_key);
            }
            return (0, sendResponse_1.default)(res, {
                statusCode: http_status_1.default.OK,
                success: true,
                message: "Category Delete successfully !",
            });
        }
        else {
            throw new AppError_1.default(400, "Category delete failed !");
        }
    }
    catch (error) {
        next(error);
    }
});
exports.deleteACategoryInfo = deleteACategoryInfo;
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
