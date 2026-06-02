
import AppError from "../../errors/AppError";
import CategoryModel from "../Category/category.model";
import { ISubcategoryInterface, subcategorySearchableField } from "./subcategory.interface";
import SubcategoryModel from "./subcategory.model";


// Create A Sub Category
export const postSubcategoryServices = async (
  data: ISubcategoryInterface
): Promise<ISubcategoryInterface | {}> => {
  const createSubcategory: ISubcategoryInterface | {} = await SubcategoryModel.create(data);
  return createSubcategory;
};

// Find Sub Category
export const findAllSubcategoryServices = async (searchTerm: any): Promise<ISubcategoryInterface[] | []> => {
  const andCondition = [];

  if (searchTerm) {
    andCondition.push({
      $or: subcategorySearchableField.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: "i",
        },
      })),
    });
  }
  const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};

  // Define the aggregation pipeline in a variable
  const pipeline = [
    {
      $match: { subcategory_status: "active", ...whereCondition }, // Match active categories with search filters
    },
    {
      $lookup: {
        from: "products", // The collection to join (products collection)
        localField: "_id", // The field in the categories collection
        foreignField: "subcategory_id", // The field in the products collection that references subcategory
        as: "products", // The array where matching products will be stored
        pipeline: [
          { $match: { product_status: "active" } }, // Only fetch active products
        ],
      },
    },
    {
      $lookup: {
        from: "categories",               // Name of the category collection
        localField: "category_id",        // Field in subcategory collection
        foreignField: "_id",              // Field in category collection
        as: "category",                   // Result field
      },
    },
    {
      $unwind: {
        path: "$category",                // Convert category array to object
        preserveNullAndEmptyArrays: true // Optional: keep subcategories even if category is missing
      }
    },
    {
      $addFields: {
        total_product: { $size: "$products" }, // Add a new field `total_product` that counts products
      },
    },
    {
      $project: {
        products: 0, // Optional: Remove the products array if you don't want to include product details in the result
      },
    },
    // {
    //   $sort: { subcategory_serial: 1 }, // Sort by subcategory_serial in ascending order (use 1 for ascending) (not working in this pipeline)
    // },
  ];

  const findSubcategory: ISubcategoryInterface[] | [] = await SubcategoryModel.aggregate(pipeline)
    .sort({ subcategory_serial: 1 })
  // .select("-__v");
  return findSubcategory;
};

// Find all dashboard Sub Category
export const findAllDashboardSubcategoryServices = async (
  limit: number,
  skip: number,
  searchTerm: any,
  category_id?: any,
): Promise<ISubcategoryInterface[] | []> => {
  const andCondition = [];
  if (searchTerm) {
    andCondition.push({
      $or: subcategorySearchableField.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: "i",
        },
      })),
    });
    const page = 1
    limit = 10
    skip = (page - 1) * limit;
  }

  // Category ID condition (only if provided)
  if (category_id) {
    andCondition.push({
      category_id: category_id,
    });
  }

  const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};
  const findSubcategory: ISubcategoryInterface[] | [] = await SubcategoryModel.find(
    whereCondition
  )
    .sort({ subcategory_serial: 1 })
    .skip(skip)
    .limit(limit)
    .populate('category_id')
    .select("-__v");
  return findSubcategory;
};

// Find Sub Category
export const findAllGrocerySubcategoryServices = async (/*searchTerm: any*/): Promise<ISubcategoryInterface[] | []> => {

  // Step 1: Find the category ID for 'Grocery'
  const groceryCategory = await CategoryModel.findOne({ category_name: "Grocery" });

  if (!groceryCategory) return [];

  // Step 2: Fetch subcategories under this category
  const findSubcategory: ISubcategoryInterface[] | [] = await SubcategoryModel.find({
    category_id: groceryCategory._id,
  }).sort({ subcategory_serial: 1 });

  return findSubcategory;
};

// Find Pharmacy Sub Category
export const findAllPharmacySubcategoryServices = async (/*searchTerm: any*/): Promise<ISubcategoryInterface[] | []> => {

  // Step 1: Find the category ID for 'Pharmacy'
  const pharmacyCategory = await CategoryModel.findOne({ category_name: "Pharmacy" });

  if (!pharmacyCategory) return [];

  // Step 2: Fetch subcategories under this category
  const findSubcategory: ISubcategoryInterface[] | [] = await SubcategoryModel.find({
    category_id: pharmacyCategory._id,
  }).sort({ subcategory_serial: 1 });

  return findSubcategory;
};

// Find Skincare/cosmetics/beauty related Sub Category
export const findAllSkincareSubcategoryServices = async (/*searchTerm: any*/): Promise<ISubcategoryInterface[] | []> => {

  // Step 1: Find the category ID for 'Skincare'
  const skincareCategory = await CategoryModel.findOne({ category_name: "Beauty & Skincare" });

  if (!skincareCategory) return [];

  // Step 2: Fetch subcategories under this category
  const findSubcategory: ISubcategoryInterface[] | [] = await SubcategoryModel.find({
    category_id: skincareCategory._id,
  }).sort({ subcategory_serial: 1 });

  return findSubcategory;
};


// Find fashion related Sub Category
export const findAllFashionSubcategoryServices = async (/*searchTerm: any*/): Promise<ISubcategoryInterface[] | []> => {

  // Step 1: Find the category ID for 'fashion'
  const fashionCategory = await CategoryModel.findOne({ category_name: "Fashion" });

  if (!fashionCategory) return [];

  // Step 2: Fetch subcategories under this category
  const findSubcategory: ISubcategoryInterface[] | [] = await SubcategoryModel.find({
    category_id: fashionCategory._id,
  }).sort({ subcategory_serial: 1 });

  return findSubcategory;
};

// Update a Sub Category
export const updateSubcategoryServices = async (
  data: ISubcategoryInterface,
  _id: string
): Promise<ISubcategoryInterface | any> => {
  const updateSubcategoryInfo: ISubcategoryInterface | null =
    await SubcategoryModel.findOne({ _id: _id });
  if (!updateSubcategoryInfo) {
    throw new AppError(404, "Sub category not found");
  }
  const Subcategory = await SubcategoryModel.updateOne({ _id: _id }, data, {
    runValidators: true,
  });
  return Subcategory;
};

// Delete a Sub Category
export const deleteSubcategoryServices = async (
  _id: string
): Promise<ISubcategoryInterface | any> => {
  const updateSubcategoryInfo: ISubcategoryInterface | null =
    await SubcategoryModel.findOne({ _id: _id });
  if (!updateSubcategoryInfo) {
    throw new AppError(404, "Subcategory not found");
  }
  const Subcategory = await SubcategoryModel.deleteOne(
    { _id: _id },
    {
      runValidators: true,
    }
  );
  return Subcategory;
};
