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
exports.deleteCustomOrderServices = exports.updateCustomOrderServices = exports.findAllDashboardCustomOrderServices = exports.findCustomOrderByUserIdServices = exports.findAllCustomOrderServices = exports.postCustomOrderServices = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const customOrder_interface_1 = require("./customOrder.interface");
const customOrder_model_1 = require("./customOrder.model");
// Create A CustomOrder
const postCustomOrderServices = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const createCustomOrder = yield customOrder_model_1.CustomOrderModel.create(data);
    return createCustomOrder;
});
exports.postCustomOrderServices = postCustomOrderServices;
// Find CustomOrder
const findAllCustomOrderServices = (searchTerm) => __awaiter(void 0, void 0, void 0, function* () {
    const andCondition = [];
    if (searchTerm) {
        andCondition.push({
            $or: customOrder_interface_1.customOrderSearchableField.map((field) => ({
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
            $match: Object.assign({ customOrder_status: "active" }, whereCondition), // Match active categories with search filters
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
    const findCustomOrder = yield customOrder_model_1.CustomOrderModel.find(whereCondition)
        .sort({ customOrder_serial: 1 });
    // .select("-__v");
    console.log(findCustomOrder);
    return findCustomOrder;
});
exports.findAllCustomOrderServices = findAllCustomOrderServices;
// Find all dashboard CustomOrder
const findCustomOrderByUserIdServices = (limit, skip, searchTerm, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const andCondition = [];
    if (searchTerm) {
        andCondition.push({
            $or: customOrder_interface_1.customOrderSearchableField.map((field) => ({
                [field]: {
                    $regex: searchTerm,
                    $options: "i",
                },
            })),
        });
        const page = 1;
        limit = 10;
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
    const findCustomOrder = yield customOrder_model_1.CustomOrderModel.find(whereCondition)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-__v");
    return findCustomOrder;
});
exports.findCustomOrderByUserIdServices = findCustomOrderByUserIdServices;
// Find all dashboard CustomOrder
const findAllDashboardCustomOrderServices = (limit, skip, searchTerm) => __awaiter(void 0, void 0, void 0, function* () {
    const andCondition = [];
    if (searchTerm) {
        andCondition.push({
            $or: customOrder_interface_1.customOrderSearchableField.map((field) => ({
                [field]: {
                    $regex: searchTerm,
                    $options: "i",
                },
            })),
        });
        const page = 1;
        limit = 10;
        skip = (page - 1) * limit;
    }
    const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};
    const findCustomOrder = yield customOrder_model_1.CustomOrderModel.find(whereCondition)
        .sort({ customOrder_serial: 1 })
        .skip(skip)
        .limit(limit)
        .select("-__v");
    return findCustomOrder;
});
exports.findAllDashboardCustomOrderServices = findAllDashboardCustomOrderServices;
// Update a CustomOrder
const updateCustomOrderServices = (data, _id) => __awaiter(void 0, void 0, void 0, function* () {
    const updateCustomOrderInfo = yield customOrder_model_1.CustomOrderModel.findOne({ _id: _id });
    if (!updateCustomOrderInfo) {
        throw new AppError_1.default(404, "CustomOrder not found");
    }
    const CustomOrder = yield customOrder_model_1.CustomOrderModel.updateOne({ _id: _id }, data, {
        runValidators: true,
    });
    return CustomOrder;
});
exports.updateCustomOrderServices = updateCustomOrderServices;
// Delete a CustomOrder
const deleteCustomOrderServices = (_id) => __awaiter(void 0, void 0, void 0, function* () {
    const updateCustomOrderInfo = yield customOrder_model_1.CustomOrderModel.findOne({ _id: _id });
    if (!updateCustomOrderInfo) {
        throw new AppError_1.default(404, "CustomOrder not found");
    }
    const CustomOrder = yield customOrder_model_1.CustomOrderModel.deleteOne({ _id: _id }, {
        runValidators: true,
    });
    return CustomOrder;
});
exports.deleteCustomOrderServices = deleteCustomOrderServices;
