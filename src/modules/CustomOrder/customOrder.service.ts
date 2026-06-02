
import AppError from "../../errors/AppError";
import {
  customOrderSearchableField,
  ICustomOrder,
} from "./customOrder.interface";
import { CustomOrderModel } from "./customOrder.model";


// Create A CustomOrder
export const postCustomOrderServices = async (
  data: ICustomOrder
): Promise<ICustomOrder | {}> => {
  const createCustomOrder: ICustomOrder | {} = await CustomOrderModel.create(data);
  return createCustomOrder;
};

// Find CustomOrder
export const findAllCustomOrderServices = async (searchTerm: any): Promise<ICustomOrder[] | []> => {
  const andCondition = [];

  if (searchTerm) {
    andCondition.push({
      $or: customOrderSearchableField.map((field) => ({
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
      $match: { customOrder_status: "active", ...whereCondition }, // Match active categories with search filters
    },
    // {
    //   $lookup: {
    //     from: "products", // The collection to join (products collection)
    //     localField: "_id", // The field in the categories collection
    //     foreignField: "customOrder_id", // The field in the products collection that references customOrder
    //     as: "products", // The array where matching products will be stored
    //     pipeline: [
    //       { $match: { product_status: "active" } }, // Only fetch active products
    //     ],
    //   },
    // },
    // {
    //   $addFields: {
    //     total_product: { $size: "$products" }, // Add a new field `total_product` that counts products
    //   },
    // },
    // {
    //   $project: {
    //     products: 0, // Optional: Remove the products array if you don't want to include product details in the result
    //   },
    // },
    // {
    //   $sort: { customOrder_serial: 1 }, // Sort by customOrder_serial in ascending order (use 1 for ascending) (not working in this pipeline)
    // },
  ];

  const findCustomOrder = await CustomOrderModel.find(whereCondition)
    .sort({ customOrder_serial: 1 })
  // .select("-__v");
  console.log(findCustomOrder);

  return findCustomOrder;
};

// Find all dashboard CustomOrder
export const findCustomOrderByUserIdServices = async (
  limit: number,
  skip: number,
  searchTerm: any,
  userId: string
): Promise<ICustomOrder[] | []> => {
  const andCondition = [];

  if (searchTerm) {
    andCondition.push({
      $or: customOrderSearchableField.map((field) => ({
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

  // Add userId filter
  if (userId) {
    andCondition.push({
      user_id: userId, // replace `user` with the actual field name used in your model for user reference
    });
  }


  const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};
  console.log(whereCondition, 'whereCondition from custom order service');

  const findCustomOrder: ICustomOrder[] | [] = await CustomOrderModel.find(
    whereCondition
  )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("-__v");
  return findCustomOrder;
};

// Find all dashboard CustomOrder
export const findAllDashboardCustomOrderServices = async (
  limit: number,
  skip: number,
  searchTerm: any
): Promise<ICustomOrder[] | []> => {
  const andCondition = [];
  if (searchTerm) {
    andCondition.push({
      $or: customOrderSearchableField.map((field) => ({
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
  const findCustomOrder: ICustomOrder[] | [] = await CustomOrderModel.find(
    whereCondition
  )
    .sort({ customOrder_serial: 1 })
    .skip(skip)
    .limit(limit)
    .select("-__v");
  return findCustomOrder;
};

// Update a CustomOrder
export const updateCustomOrderServices = async (
  data: ICustomOrder,
  _id: string
): Promise<ICustomOrder | any> => {
  const updateCustomOrderInfo: ICustomOrder | null =
    await CustomOrderModel.findOne({ _id: _id });
  if (!updateCustomOrderInfo) {
    throw new AppError(404, "CustomOrder not found");
  }
  const CustomOrder = await CustomOrderModel.updateOne({ _id: _id }, data, {
    runValidators: true,
  });
  return CustomOrder;
};

// Delete a CustomOrder
export const deleteCustomOrderServices = async (
  _id: string
): Promise<ICustomOrder | any> => {
  const updateCustomOrderInfo: ICustomOrder | null =
    await CustomOrderModel.findOne({ _id: _id });
  if (!updateCustomOrderInfo) {
    throw new AppError(404, "CustomOrder not found");
  }
  const CustomOrder = await CustomOrderModel.deleteOne(
    { _id: _id },
    {
      runValidators: true,
    }
  );
  return CustomOrder;
};
