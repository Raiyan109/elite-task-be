
import AppError from "../../errors/AppError";
import { IChildcategoryInterface, childcategorySearchableField } from "./childcategory.interface";
import ChildcategoryModel from "./childcategory.model";


// Create A Category
export const postChildcategoryServices = async (
  data: IChildcategoryInterface
): Promise<IChildcategoryInterface | {}> => {
  const createChildcategory: IChildcategoryInterface | {} = await ChildcategoryModel.create(data);
  return createChildcategory;
};

// Find Category
export const findAllChildcategoryServices = async (searchTerm: any): Promise<IChildcategoryInterface[] | []> => {
  const andCondition = [];

  if (searchTerm) {
    andCondition.push({
      $or: childcategorySearchableField.map((field) => ({
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
      $match: { childcategory_status: "active", ...whereCondition }, // Match active categories with search filters
    },
    {
      $lookup: {
        from: "products", // The collection to join (products collection)
        localField: "_id", // The field in the categories collection
        foreignField: "childcategory_id", // The field in the products collection that references childcategory
        as: "products", // The array where matching products will be stored
        pipeline: [
          { $match: { product_status: "active" } }, // Only fetch active products
        ],
      },
    },
    {
      $lookup: {
        from: "categories",               // Name of the category collection
        localField: "category_id",        // Field in childcategory collection
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
    //   $sort: { childcategory_serial: 1 }, // Sort by childcategory_serial in ascending order (use 1 for ascending) (not working in this pipeline)
    // },
  ];

  const findChildcategory: IChildcategoryInterface[] | [] = await ChildcategoryModel.aggregate(pipeline)
    .sort({ childcategory_serial: 1 })
  // .select("-__v");
  return findChildcategory;
};

// Find all dashboard Category
export const findAllDashboardChildcategoryServices = async (
  limit: number,
  skip: number,
  searchTerm: any,
  subcategory_id?: any,
): Promise<IChildcategoryInterface[] | []> => {
  const andCondition = [];
  if (searchTerm) {
    andCondition.push({
      $or: childcategorySearchableField.map((field) => ({
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

  // subcategory ID condition (only if provided)
  if (subcategory_id) {
    andCondition.push({
      subcategory_id: subcategory_id,
    });
  }

  const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};
  const findChildcategory: IChildcategoryInterface[] | [] = await ChildcategoryModel.find(
    whereCondition
  )
    .sort({ childcategory_serial: 1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'subcategory_id',
      populate: {
        path: 'category_id'
      }
    })
    .select("-__v");
  return findChildcategory;
};

// Update a Category
export const updateChildcategoryServices = async (
  data: IChildcategoryInterface,
  _id: string
): Promise<IChildcategoryInterface | any> => {
  const updateChildcategoryInfo: IChildcategoryInterface | null =
    await ChildcategoryModel.findOne({ _id: _id });
  if (!updateChildcategoryInfo) {
    throw new AppError(404, "Sub category not found");
  }
  const Childcategory = await ChildcategoryModel.updateOne({ _id: _id }, data, {
    runValidators: true,
  });
  return Childcategory;
};

// Delete a Category
export const deleteChildcategoryServices = async (
  _id: string
): Promise<IChildcategoryInterface | any> => {
  const updateChildcategoryInfo: IChildcategoryInterface | null =
    await ChildcategoryModel.findOne({ _id: _id });
  if (!updateChildcategoryInfo) {
    throw new AppError(404, "Childcategory not found");
  }
  const Childcategory = await ChildcategoryModel.deleteOne(
    { _id: _id },
    {
      runValidators: true,
    }
  );
  return Childcategory;
};
