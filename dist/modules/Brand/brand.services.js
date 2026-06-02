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
exports.BrandServices = exports.deleteBrandServices = exports.updateBrandServices = exports.findNestleAndUnileverBrandsServices = exports.findAllDashboardBrandsServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const brand_model_1 = require("./brand.model");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const mongoose_1 = require("mongoose");
// const createBrandIntoDB = async (brand: IBrand) => {
//   const isBrandExists = await BrandModel.findOne({ name: brand.brand_name })
//   if (isBrandExists) {
//     throw new ApiError(httpStatus.CONFLICT, 'This brand is already exists!');
//   }
//   const newSequence = brand.sequence;
//   // Step 2: Shift the sequence of brands if the new sequence is not the last one
//   const brandsToShift = await BrandModel.find({ sequence: { $gte: newSequence } }).sort({ sequence: 1 });
//   // If there's any brand with a sequence greater than or equal to the new sequence, increment their sequence
//   if (brandsToShift.length > 0) {
//     for (const brandToShift of brandsToShift) {
//       await BrandModel.findByIdAndUpdate(brandToShift._id, { $inc: { sequence: 1 } });
//     }
//   }
//   // Step 3: Create the new brand with the desired sequence
//   const result = await BrandModel.create(brand);
//   return result;
// };
// Create a brand
const postBrandServices = (brand) => __awaiter(void 0, void 0, void 0, function* () {
    const isBrandExists = yield brand_model_1.BrandModel.findOne({ name: brand.brand_name });
    if (isBrandExists) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'This brand is already exists!');
    }
    const result = yield brand_model_1.BrandModel.create(brand);
    return result;
});
// Find brand
const findAllBrandsServices = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    const modelQuery = brand_model_1.BrandModel.find({ brand_status: "active" }); // Initial Mongoose query
    const query = new QueryBuilder_1.default(modelQuery, queryParams)
        .search(['brand_name']) // Provide searchable fields
        // .filter()
        .sort()
        .paginate();
    // .fields();
    const result = yield query.modelQuery; // Execute the query
    // const result = await query.modelQuery.sort({ sequence: 1 }); // Execute the query
    return result;
});
// Find all dashboard Brand
const findAllDashboardBrandsServices = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    const searchTerm = queryParams === null || queryParams === void 0 ? void 0 : queryParams.searchTerm;
    const categoryIdParam = queryParams === null || queryParams === void 0 ? void 0 : queryParams.category_id;
    let page = parseInt(queryParams === null || queryParams === void 0 ? void 0 : queryParams.page) || 1; // Default to page 1
    let limit = parseInt(queryParams === null || queryParams === void 0 ? void 0 : queryParams.limit) || 10; // Default to 10 items per page
    let skip = (page - 1) * limit;
    const aggregationPipeline = [];
    // [
    //   {
    //     $lookup: {
    //       from: 'categories', // Ensure this is the correct collection name
    //       localField: 'category_id',
    //       foreignField: '_id',
    //       as: 'category_id',
    //     },
    //   },
    //   { $unwind: '$category_id' }, // Convert array to object for easier searching
    // ];
    // Filter by category_id if provided
    if (categoryIdParam) {
        aggregationPipeline.push({
            $match: {
                category_id: new mongoose_1.Types.ObjectId(categoryIdParam)
            }
        });
    }
    // populate category_id
    aggregationPipeline.push({
        $lookup: {
            from: "categories",
            localField: "category_id",
            foreignField: "_id",
            as: "category_id"
        }
    }, {
        $unwind: {
            path: "$category_id",
            preserveNullAndEmptyArrays: true
        }
    }, {
        // Only change category_id, keep all other brand fields
        $set: {
            category_id: {
                _id: "$category_id._id",
                category_name: "$category_id.category_name"
            }
        }
    });
    // Apply search if searchTerm exists
    if (searchTerm) {
        aggregationPipeline.push({
            $match: {
                $or: [
                    { brand_name: { $regex: searchTerm, $options: 'i' } }, // Search in brand_name
                    { 'category_id.category_name': { $regex: searchTerm, $options: 'i' } }, // Search in category_name
                ],
            },
        });
        page = 1;
        limit = 10;
        skip = (page - 1) * limit;
    }
    aggregationPipeline.push({ $sort: { createdAt: -1 } }, { $skip: skip }, // Skip records for pagination
    { $limit: limit } // Limit records per page
    );
    const result = yield brand_model_1.BrandModel.aggregate(aggregationPipeline);
    // Count total matching records for pagination metadata
    const totalCountPipeline = [...aggregationPipeline.slice(0, -2), { $count: "total" }];
    const totalResult = yield brand_model_1.BrandModel.aggregate(totalCountPipeline);
    const totalRecords = totalResult.length > 0 ? totalResult[0].total : 0;
    const totalPages = Math.ceil(totalRecords / limit);
    return {
        data: result,
        pagination: {
            totalPage: totalPages,
            currentPage: page,
            limit: limit,
        },
        total: totalRecords,
    };
});
exports.findAllDashboardBrandsServices = findAllDashboardBrandsServices;
const findNestleAndUnileverBrandsServices = () => __awaiter(void 0, void 0, void 0, function* () {
    const brands = yield brand_model_1.BrandModel.find({ brand_name: { $in: ["Nestle", "Unilever"] } }, // ✅ filter
    { _id: 1, brand_name: 1, brand_logo: 1 } // ✅ projection
    ).lean();
    return brands;
});
exports.findNestleAndUnileverBrandsServices = findNestleAndUnileverBrandsServices;
// Update a Brand
const updateBrandServices = (data, _id) => __awaiter(void 0, void 0, void 0, function* () {
    const updateBrandInfo = yield brand_model_1.BrandModel.findOne({ _id: _id });
    if (!updateBrandInfo) {
        return {};
    }
    const Brand = yield brand_model_1.BrandModel.findByIdAndUpdate({ _id: _id }, { $set: data }, // ✅ This ensures only provided fields are updated
    { new: true, runValidators: true, context: "query" });
    return Brand;
});
exports.updateBrandServices = updateBrandServices;
// Delete a Brand
const deleteBrandServices = (_id) => __awaiter(void 0, void 0, void 0, function* () {
    const updateBrandInfo = yield brand_model_1.BrandModel.findOne({ _id: _id });
    if (!updateBrandInfo) {
        return {};
    }
    const Brand = yield brand_model_1.BrandModel.findByIdAndDelete({ _id: _id });
    return Brand;
});
exports.deleteBrandServices = deleteBrandServices;
// const updateBrandSequenceInDB = async (brandId: string, newSequence: number) => {
//   const targetBrand = await BrandModel.findById(brandId);
//   if (!targetBrand) {
//     throw new Error('Brand not found');
//   }
//   const oldSequence = targetBrand.sequence;
//   // Check if another brand already has the new sequence
//   const existingBrand = await BrandModel.findOne({ sequence: newSequence });
//   // If another brand has the same sequence, shift it
//   if (existingBrand) {
//     await BrandModel.findByIdAndUpdate(existingBrand._id, { sequence: oldSequence });
//   }
//   // Now update the target brand's sequence
//   targetBrand.sequence = newSequence;
//   await targetBrand.save();
//   return targetBrand;
// };
// //get single brand
// export const getSingleBrandServices = async (_id: string) => {
//   const result = await BrandModel.findById(_id);
//   return result;
// };
exports.BrandServices = {
    postBrandServices,
    findAllBrandsServices,
    findAllDashboardBrandsServices: exports.findAllDashboardBrandsServices,
    findNestleAndUnileverBrandsServices: exports.findNestleAndUnileverBrandsServices,
    updateBrandServices: exports.updateBrandServices,
    deleteBrandServices: exports.deleteBrandServices
};
