
import AppError from "../../errors/AppError";
import { YTLinkModel } from "../YTLink/ytLink.model";
import {
  ICategoryInterface,
  categorySearchableField,
} from "./category.interface";
import CategoryModel from "./category.model";

// Create A Category
export const postCategoryServices = async (
  data: ICategoryInterface
): Promise<ICategoryInterface | {}> => {
  const createCategory: ICategoryInterface | {} = await CategoryModel.create(data);
  return createCategory;
};

// Find Category
export const findAllCategoryServices = async (searchTerm: any): Promise<ICategoryInterface[] | []> => {
  const andCondition = [];

  if (searchTerm) {
    andCondition.push({
      $or: categorySearchableField.map((field) => ({
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
      $match: { category_status: "active", ...whereCondition }, // Match active categories with search filters
    },
    {
      $lookup: {
        from: "products", // The collection to join (products collection)
        localField: "_id", // The field in the categories collection
        foreignField: "category_id", // The field in the products collection that references category
        as: "products", // The array where matching products will be stored
        pipeline: [
          { $match: { product_status: "active" } }, // Only fetch active products
        ],
      },
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
    //   $sort: { category_serial: 1 }, // Sort by category_serial in ascending order (use 1 for ascending) (not working in this pipeline)
    // },
  ];

  const findCategory: ICategoryInterface[] | [] = await CategoryModel.aggregate(pipeline)
    .sort({ category_serial: 1 })
  // .select("-__v");
  return findCategory;
};

// Find all dashboard Category
export const findAllDashboardCategoryServices = async (
  limit: number,
  skip: number,
  searchTerm: any
): Promise<ICategoryInterface[] | []> => {
  const andCondition = [];
  if (searchTerm) {
    andCondition.push({
      $or: categorySearchableField.map((field) => ({
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
  const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};
  const findCategory: ICategoryInterface[] | [] = await CategoryModel.find(
    whereCondition
  )
    .sort({ category_serial: 1 })
    .skip(skip)
    .limit(limit)
    .select("-__v");
  return findCategory;
};

export const findGroceryCategoryBannerAndReelsServices = async () => {
  // 1️⃣ Find Grocery category
  const groceryCategory = await CategoryModel.findOne({
    category_name: "Grocery",
    category_status: "active",
  })
    .select("_id category_banner")
    .lean();

  if (!groceryCategory) {
    throw new Error("Grocery category not found");
  }

  // 2️⃣ Find YouTube reels for Grocery category
  const youtubeReels = await YTLinkModel.find({
    category_type: "Grocery",
    ytLink_status: "active",
  })
    .select("_id ytLink_link")
    .sort({ ytLink_serial: 1 }) // ✅ ordered by serial
    .lean();

  // 3️⃣ Return in required structure
  return {
    category_banner: groceryCategory.category_banner || [],
    youtube_reels: youtubeReels || [],
  };
};


// Update a Category
export const updateCategoryServices = async (
  data: ICategoryInterface,
  _id: string
): Promise<ICategoryInterface | any> => {
  const updateCategoryInfo: ICategoryInterface | null =
    await CategoryModel.findOne({ _id: _id });
  if (!updateCategoryInfo) {
    throw new AppError(404, "Category not found");
  }
  const Category = await CategoryModel.updateOne({ _id: _id }, data, {
    runValidators: true,
  });
  return Category;
};

// Delete a Category
export const deleteCategoryServices = async (
  _id: string
): Promise<ICategoryInterface | any> => {
  const updateCategoryInfo: ICategoryInterface | null =
    await CategoryModel.findOne({ _id: _id });
  if (!updateCategoryInfo) {
    throw new AppError(404, "Category not found");
  }
  const Category = await CategoryModel.deleteOne(
    { _id: _id },
    {
      runValidators: true,
    }
  );
  return Category;
};
