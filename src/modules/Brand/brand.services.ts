import httpStatus from 'http-status';
import { IBrand } from './brand.interface';
import { BrandModel } from './brand.model';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { Types } from 'mongoose';



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
const postBrandServices = async (brand: IBrand) => {
  const isBrandExists = await BrandModel.findOne({ name: brand.brand_name })
  if (isBrandExists) {
    throw new AppError(httpStatus.CONFLICT, 'This brand is already exists!');
  }

  const result = await BrandModel.create(brand);
  return result;
};

// Find brand
const findAllBrandsServices = async (queryParams: Record<string, unknown>) => {
  const modelQuery = BrandModel.find({ brand_status: "active" }) // Initial Mongoose query

  const query = new QueryBuilder(modelQuery, queryParams)
    .search(['brand_name']) // Provide searchable fields
    // .filter()
    .sort()
    .paginate()
  // .fields();

  const result = await query.modelQuery; // Execute the query
  // const result = await query.modelQuery.sort({ sequence: 1 }); // Execute the query
  return result;
};


// Find all dashboard Brand
export const findAllDashboardBrandsServices = async (queryParams: Record<string, unknown>) => {
  const searchTerm = queryParams?.searchTerm as string;
  const categoryIdParam = queryParams?.category_id as string;
  let page = parseInt(queryParams?.page as string) || 1; // Default to page 1
  let limit = parseInt(queryParams?.limit as string) || 10; // Default to 10 items per page
  let skip = (page - 1) * limit;

  const aggregationPipeline: any[] = []
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
        category_id: new Types.ObjectId(categoryIdParam)
      }
    });
  }


  // populate category_id
  aggregationPipeline.push(
    {
      $lookup: {
        from: "categories",
        localField: "category_id",
        foreignField: "_id",
        as: "category_id"
      }
    },
    {
      $unwind: {
        path: "$category_id",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      // Only change category_id, keep all other brand fields
      $set: {
        category_id: {
          _id: "$category_id._id",
          category_name: "$category_id.category_name"
        }
      }
    }
  );

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
    page = 1
    limit = 10
    skip = (page - 1) * limit;
  }

  aggregationPipeline.push(
    { $sort: { createdAt: -1 } },
    { $skip: skip }, // Skip records for pagination
    { $limit: limit } // Limit records per page
  );

  const result = await BrandModel.aggregate(aggregationPipeline);
  // Count total matching records for pagination metadata
  const totalCountPipeline = [...aggregationPipeline.slice(0, -2), { $count: "total" }];
  const totalResult = await BrandModel.aggregate(totalCountPipeline);
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
  }

};

export const findNestleAndUnileverBrandsServices = async (): Promise<Pick<IBrand, "_id" | "brand_name" | "brand_logo">[]> => {
  const brands = await BrandModel.find(
    { brand_name: { $in: ["Nestle", "Unilever"] } }, // ✅ filter
    { _id: 1, brand_name: 1, brand_logo: 1 }         // ✅ projection
  ).lean();

  return brands;
};


// Update a Brand
export const updateBrandServices = async (data: IBrand, _id: string): Promise<IBrand | any> => {
  const updateBrandInfo = await BrandModel.findOne({ _id: _id });
  if (!updateBrandInfo) {
    return {};
  }
  const Brand = await BrandModel.findByIdAndUpdate({ _id: _id },
    { $set: data }, // ✅ This ensures only provided fields are updated
    { new: true, runValidators: true, context: "query" }
  );
  return Brand;
};

// Delete a Brand
export const deleteBrandServices = async (_id: string): Promise<IBrand | any> => {
  const updateBrandInfo = await BrandModel.findOne({ _id: _id });
  if (!updateBrandInfo) {
    return {};
  }
  const Brand = await BrandModel.findByIdAndDelete({ _id: _id }
  );
  return Brand;
};

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


export const BrandServices = {
  postBrandServices,
  findAllBrandsServices,
  findAllDashboardBrandsServices,
  findNestleAndUnileverBrandsServices,
  updateBrandServices,
  deleteBrandServices
};