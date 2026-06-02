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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestOrderServices = void 0;
const requestOrder_model_1 = require("./requestOrder.model");
const mongoose_1 = require("mongoose");
const checkAvailability_1 = require("../../utils/checkAvailability");
// CREATE RequestOrder
const postRequestOrderService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingRequestOrder = yield requestOrder_model_1.RequestOrderModel.findOne({ user_id: payload.user_id, requestOrder_status: "pending" });
    if (existingRequestOrder) {
        // const alreadyExists = existingRequestOrder.product_id.includes(payload.product_id as any);
        // if (alreadyExists) {
        //     throw new Error('Product already in requestOrder');
        // }
        existingRequestOrder.product_id.push(payload.product_id);
        yield existingRequestOrder.save();
        return existingRequestOrder;
    }
    else {
        const newRequestOrder = yield requestOrder_model_1.RequestOrderModel.create({
            user_id: payload.user_id,
            product_id: [payload.product_id],
        });
        return newRequestOrder;
    }
});
// GET RequestOrder (by user ID)
const getRequestOrderService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield requestOrder_model_1.RequestOrderModel.findOne({ user_id: userId, requestOrder_status: "pending" }).populate('product_id');
    // const productsWithAvailability = result?.product_id.map(product => ({
    //     ...product,
    //     availability: checkProductAvailability(product as IProductInterface)
    // }))
    // console.log(productsWithAvailability);
    // const productsWithAvailability = result?.product_id.flatMap(productDoc => {
    //     const product = (productDoc as any).toObject(); // Convert from Mongoose doc to plain JS object
    //     return {
    //         ...product,
    //         availability: checkProductAvailability(product as IProductInterface)
    //     };
    // });
    // return productsWithAvailability;
    if (!result)
        return undefined;
    // Convert Mongoose doc to plain object
    const requestOrder = result.toObject();
    // Replace product_id array with enriched version
    requestOrder.product_id = requestOrder.product_id.map((product) => {
        return Object.assign(Object.assign({}, product), { availability: (0, checkAvailability_1.checkProductAvailability)(product) });
    });
    return requestOrder;
});
// GET RequestOrder (by user ID)
const getRequestOrderDashboardService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield requestOrder_model_1.RequestOrderModel.find()
        .populate('product_id', '-meta_title -meta_description -meta_keywords -product_is_delivery_dhaka_only')
        .populate('user_id');
    return result;
});
// UPDATE RequestOrder (replace product list for a user)
const updateRequestOrderService = (product_id, updatedData) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(product_id, 'product_id');
    const result = yield requestOrder_model_1.RequestOrderModel.findOneAndUpdate({ product_id }, { $set: updatedData }, { new: true });
    return result;
});
// update request order by admin
const updateRequestOrderByAdminService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = payload, updateData = __rest(payload, ["_id"]);
    if (!_id || !mongoose_1.Types.ObjectId.isValid(_id)) {
        throw new Error("Invalid request order ID");
    }
    // Ensure it exists
    const existingOrder = yield requestOrder_model_1.RequestOrderModel.findById(_id);
    if (!existingOrder) {
        throw new Error("Request Order not found");
    }
    // Apply update
    const updatedOrder = yield requestOrder_model_1.RequestOrderModel.findByIdAndUpdate(_id, { $set: updateData }, { new: true, runValidators: true });
    // .populate("product_id")
    // .populate("user_id")
    // .populate("requestOrder_updatedBy")
    // .populate("requestOrder_details.product_id");
    return updatedOrder;
});
// Remove RequestOrder 
const removeFromRequestOrderService = (userId, productId) => __awaiter(void 0, void 0, void 0, function* () {
    const requestOrder = yield requestOrder_model_1.RequestOrderModel.findOne({ user_id: userId });
    if (!requestOrder)
        throw new Error('RequestOrder not found');
    requestOrder.product_id = requestOrder.product_id.filter((id) => id.toString() !== productId);
    // 🚨 If requested orders is now empty, delete the requested orders document
    if (requestOrder.product_id.length === 0) {
        yield requestOrder_model_1.RequestOrderModel.deleteOne({ user_id: userId });
        return null; // or return a message saying "Cart deleted"
    }
    yield requestOrder.save();
    return requestOrder;
});
exports.RequestOrderServices = {
    postRequestOrderService,
    getRequestOrderService,
    updateRequestOrderService,
    updateRequestOrderByAdminService,
    removeFromRequestOrderService,
    getRequestOrderDashboardService
};
