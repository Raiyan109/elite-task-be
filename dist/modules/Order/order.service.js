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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderServices = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const user_model_1 = __importDefault(require("../User/user.model"));
const order_model_1 = require("./order.model");
const http_status_1 = __importDefault(require("http-status"));
const product_model_1 = __importDefault(require("../Product/product.model"));
const combo_model_1 = require("../Combo/combo.model");
const createOrderService = (payload, session) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield order_model_1.OrderModel.create([payload], { session });
    return result;
});
// find orders by user id
const findOrdersByUserIdServices = (user_id, limit, skip) => __awaiter(void 0, void 0, void 0, function* () {
    const orders = yield order_model_1.OrderModel.find({ order_user_id: user_id })
        .sort({ createdAt: -1 })
        .populate("order_user_id order_delivery_location")
        .skip(skip)
        .limit(limit)
        .lean();
    const total = yield order_model_1.OrderModel.countDocuments({ order_user_id: user_id });
    return {
        data: orders,
        total,
        page: Math.floor(skip / limit) + 1,
        limit,
    };
});
// find dashboard orders
// const findDashboardOrdersServices = async (limit: number, skip: number, searchTerm: string,filters: {
//     order_status?: string;
//     order_payment_status?: string;
//     order_payment_method?: string;
//   }) => {
//     const orders = await OrderModel.find({})
//         .populate('order_user_id order_delivery_location')
//         .skip(skip)
//         .limit(limit)
//         .lean()
//     const total = await OrderModel.countDocuments({});
//     return {
//         data: orders,
//         total,
//         page: Math.floor(skip / limit) + 1,
//         limit
//     };
// };
const findDashboardOrdersServices = (limit, skip, searchTerm, filters) => __awaiter(void 0, void 0, void 0, function* () {
    // Build the base query
    let query = order_model_1.OrderModel.find({}).populate([
        {
            path: "order_user_id",
            select: "user_phone user_first_name user_last_name user_address user_profile",
        },
        {
            path: "order_delivery_location",
        },
    ]);
    // Add search functionality
    if (searchTerm) {
        const searchRegex = new RegExp(searchTerm, "i");
        query = query.or([
            { order_id: searchRegex },
            { "order_user_id.user_phone": searchRegex },
        ]);
    }
    // Add filter functionality
    const filterConditions = {};
    if (filters.order_status) {
        filterConditions.order_status = filters.order_status;
    }
    if (filters.order_payment_status) {
        filterConditions.order_payment_status = filters.order_payment_status;
    }
    if (filters.order_payment_method) {
        filterConditions.order_payment_method = filters.order_payment_method;
    }
    if (Object.keys(filterConditions).length > 0) {
        query = query.where(filterConditions);
    }
    // Execute the query with pagination
    const orders = yield query
        .sort({ createdAt: -1 }) // Sort by newest first
        .skip(skip)
        .limit(limit)
        .lean();
    // Get total count (with the same filters applied)
    const totalQuery = order_model_1.OrderModel.find();
    if (searchTerm) {
        const searchRegex = new RegExp(searchTerm, "i");
        totalQuery.or([
            { order_id: searchRegex },
            { "order_user_id.user_phone": searchRegex },
        ]);
    }
    if (Object.keys(filterConditions).length > 0) {
        totalQuery.where(filterConditions);
    }
    const total = yield totalQuery.countDocuments();
    return {
        data: orders,
        total,
        page: Math.floor(skip / limit) + 1,
        limit,
    };
});
// find single order
const findSingleOrderServices = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield order_model_1.OrderModel.findById(id)
        .populate("order_user_id")
        .populate({
        path: "order_items._id",
        select: "product_name thumbnail_image combo_title combo_image",
    })
        .populate("order_delivery_location", "-user_id -address_status -address_email");
    // .populate('brand_id')
    // .select("-__v")
    // .lean(); // Use .lean() to return a plain JavaScript object
    if (!order) {
        throw new AppError_1.default(404, "Order Not Found !");
    }
    return order;
});
// Apply from wallet
const applyFromWalletServices = (user_id, totalAmount) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findById(user_id);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const walletBalance = user.user_wallet_amount || 0;
    const amountToDeduct = Math.min(walletBalance, totalAmount);
    const updatedUser = yield user_model_1.default.findByIdAndUpdate(user_id, { $inc: { user_wallet_amount: -amountToDeduct } }, { new: true });
    return { updatedUser, deductedAmount: amountToDeduct };
});
// User cancel order
const cancelOrderService = (orderId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Cancelling order with ID: ${orderId}`);
    const order = yield order_model_1.OrderModel.findById(orderId);
    if (!order) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Order not found");
    }
    if (order.order_status === "processing") {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Cannot cancel a processing order");
    }
    order.order_status = "canceled";
    // ✅ Loop through each item to update stock
    for (const item of order.order_items) {
        if (item.type === "product") {
            const product = yield product_model_1.default.findById(item._id);
            if (!product || product.product_quantity == null)
                continue;
            product.product_quantity += item.quantity;
            yield product.save();
        }
        if (item.type === "combo") {
            const combo = yield combo_model_1.ComboModel.findById(item._id);
            for (const comboProduct of (combo === null || combo === void 0 ? void 0 : combo.combo_products) || []) {
                const productId = comboProduct.product_id._id || comboProduct.product_id;
                const quantityToAdd = comboProduct.product_quantity * item.quantity;
                const product = yield product_model_1.default.findById(productId);
                if (!product || product.product_quantity == null)
                    continue;
                product.product_quantity += quantityToAdd;
                yield product.save();
            }
        }
    }
    // ✅ Save order status change
    yield order.save();
    return order;
});
// Admin order status update without transaction
// const orderStatusUpdateService = async (orderId: string, status: "pending" | "processing" | "on-the-way" | "delivered" | "canceled", order_publisher_note: string, userId: string, payment_status: string) => {
//     const adminId = new Types.ObjectId(userId);
//     const order = await OrderModel.findById(orderId);
//     console.log(order, 'order from order service status update');
//     if (!order) {
//         throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
//     }
//     order.order_status = status;
//     order.order_publisher_note = order_publisher_note;
//     order.order_publisher_id = adminId;
//     order.order_payment_status = payment_status;
//     if (status === 'delivered') {
//         const order = await OrderModel.findById(orderId).populate('order_items._id').lean();
//         if (!order) {
//             throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
//         }
//         const productOrderCount = order.order_items.filter(async item => {
//             const productId = item._id;
//             const product = await ProductModel.findById(productId).lean();
//             const combo = await ComboModel.findById(productId).lean();
//             if (!product && !combo) {
//                 throw new AppError(httpStatus.NOT_FOUND, `Product with ID ${productId} not found`);
//             }
//             if (product) {
//                 product.product_order_count = (product.product_order_count || 0) + item.quantity;
//             }
//             // await ProductModel.findByIdAndUpdate(productId, { product_order_count: product.product_order_count }, { new: true });
//             await ProductModel.findByIdAndUpdate(productId, { $inc: { product_order_count: 1, product_quantity: -item.quantity } }, { new: true });
//             return productId;
//         });
//         await OrderModel.findByIdAndUpdate(orderId, {
//             order_payment_status: 'paid'
//         })
//     }
//     // If status is rejected, re add the wallet used if exists
//     if (status === 'canceled' && order.order_details.wallet_used) {
//         const userId = order.order_user_id
//         const reAddTheWallet = await userModel.findOneAndUpdate(
//             { _id: userId },
//             {
//                 $inc: { user_wallet_amount: order.order_details.wallet_used }
//             })
//         console.log(reAddTheWallet, 'reAddTheWallet');
//     }
//     await order.save();
//     return order;
// }
// Admin order status update with transaction
const orderStatusUpdateService = (orderId, status, order_publisher_note, userId, payment_status) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const adminId = new mongoose_1.Types.ObjectId(userId);
        const order = yield order_model_1.OrderModel.findById(orderId).session(session);
        if (!order) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Order not found");
        }
        // Update order fields
        order.order_status = status;
        order.order_publisher_note = order_publisher_note;
        order.order_publisher_id = adminId;
        order.order_payment_status = payment_status;
        yield order.save({ session });
        if (status === "delivered") {
            const populatedOrder = yield order_model_1.OrderModel.findById(orderId)
                .populate("order_items._id")
                .lean()
                .session(session);
            if (!populatedOrder) {
                throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Order not found");
            }
            // Process each product update in parallel
            yield Promise.all(populatedOrder.order_items.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                const productId = item._id;
                const [product, combo] = yield Promise.all([
                    product_model_1.default.findById(productId).session(session).lean(),
                    combo_model_1.ComboModel.findById(productId).session(session).lean(),
                ]);
                if (!product && !combo) {
                    throw new AppError_1.default(http_status_1.default.NOT_FOUND, `Product with ID ${productId} not found`);
                }
                // if (product) {
                //     await ProductModel.findByIdAndUpdate(
                //         productId,
                //         {
                //             $inc: {
                //                 product_order_count: 1,
                //                 product_quantity: -item.quantity
                //             }
                //         },
                //         { new: true, session }
                //     );
                // }
                if (product) {
                    // Check if product_quantity exists and is a number
                    const update = {
                        $inc: { product_order_count: 1 },
                    };
                    // if (typeof product.product_quantity === "number") {
                    //   update.$inc.product_quantity = -item.quantity;
                    // } else {
                    //   // If product_quantity is null or not a number, set it to the negative quantity
                    //   update.$set = {
                    //     product_quantity: -item.quantity,
                    //   };
                    // }
                    yield product_model_1.default.findByIdAndUpdate(productId, update, {
                        new: true,
                        session,
                    });
                }
            })));
            yield order_model_1.OrderModel.findByIdAndUpdate(orderId, { order_payment_status: "paid" }, { session });
        }
        // if (status === 'canceled' && order.order_details.wallet_used) {
        //     const userId = order.order_user_id;
        //     await userModel.findOneAndUpdate(
        //         { _id: userId },
        //         { $inc: { user_wallet_amount: order.order_details.wallet_used } },
        //         { session }
        //     );
        // }
        if (status === "canceled") {
            // ✅ Restore wallet amount if used
            if (order.order_details.wallet_used) {
                const userId = order.order_user_id;
                yield user_model_1.default.findOneAndUpdate({ _id: userId }, { $inc: { user_wallet_amount: order.order_details.wallet_used } }, { session });
            }
            // ✅ Restore product stock
            for (const item of order.order_items) {
                if (item.type === "product") {
                    const product = yield product_model_1.default.findById(item._id).session(session);
                    if (!product || product.product_quantity == null)
                        continue;
                    product.product_quantity += item.quantity;
                    yield product.save({ session });
                }
                if (item.type === "combo") {
                    const combo = yield combo_model_1.ComboModel.findById(item._id).session(session);
                    for (const comboProduct of (combo === null || combo === void 0 ? void 0 : combo.combo_products) || []) {
                        const productId = comboProduct.product_id._id || comboProduct.product_id;
                        const quantityToAdd = comboProduct.product_quantity * item.quantity;
                        const product = yield product_model_1.default.findById(productId).session(session);
                        if (!product || product.product_quantity == null)
                            continue;
                        product.product_quantity += quantityToAdd;
                        yield product.save({ session });
                    }
                }
            }
        }
        yield session.commitTransaction();
        return order;
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
// Admin payment status update
const updateOrderPaymentStatus = (orderId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    return order_model_1.OrderModel.findOneAndUpdate({ order_id: orderId }, { $set: updateData }, { new: true });
});
// const orderUpdateService = async (orderId: string, /*productId: string, action: 'decrease' | 'remove', quantity?: number*/ updates: {
//     action: 'decrease' | 'remove';
//     _id: { _id: string }; // nested _id
//     quantity?: number;
// }[]) => {
//     // Find the order containing the product
//     // const order = await OrderModel.findOne({ _id: orderId, 'order_items._id': productId });
//     // if (!order) {
//     //     throw new Error('Order or product not found');
//     // }
//     // // Find the specific product in order_items
//     // const productIndex = order.order_items.findIndex(item => item._id.toString() === productId);
//     // if (productIndex === -1) {
//     //     throw new Error('Product not found in order');
//     // }
//     // const product = order.order_items[productIndex];
//     // let productPriceChange = 0;
//     // if (action === 'decrease' && quantity) {
//     //     // Ensure we don't decrease below 0
//     //     const newQuantity = Math.max(0, product.quantity - quantity);
//     //     productPriceChange = (product.quantity - newQuantity) * (product.price ?? 0);
//     //     product.quantity = newQuantity;
//     //     // If quantity reaches 0, remove the item
//     //     if (newQuantity === 0) {
//     //         order.order_items.splice(productIndex, 1);
//     //     }
//     // } else if (action === 'remove') {
//     //     // Calculate the price change for complete removal
//     //     productPriceChange = product.quantity * (product.price ?? 0);
//     //     order.order_items.splice(productIndex, 1);
//     // }
//     // // Recalculate the total payable amount
//     // const { product_price: prevProductPrice, coupon_discount, vat, delivery_charge, wallet_used } = order.order_details;
//     // // Update product_price
//     // order.order_details.product_price = prevProductPrice - productPriceChange;
//     // const subtotal = order.order_details.product_price - coupon_discount;
//     // const taxAmount = (subtotal * vat) / 100;
//     // order.order_payable_amount = subtotal + taxAmount + delivery_charge - (wallet_used ?? 0);
//     // // Save the updated order
//     // const updatedOrder = await order.save();
//     // return updatedOrder;
//     //new way (order updates data as array)
//     const order = await OrderModel.findById(orderId);
//     if (!order) {
//         throw new Error('Order not found');
//     }
//     let totalPriceChange = 0;
//     // let productPriceChange = 0;
//     // Save previous values for later
//     const previous_product_price = order.order_details.product_price;
//     const previous_order_payable_amount = order.order_payable_amount;
//     for (const update of updates) {
//         const productId = update._id._id;
//         const { action, quantity } = update;
//         if (!['decrease', 'remove'].includes(action)) {
//             throw new Error(`Invalid action "${action}"`);
//         }
//         const index = order.order_items.findIndex(
//             (item) => item._id.toString() === productId
//         );
//         if (index === -1) continue; // Skip if product not found
//         const product = order.order_items[index];
//         const orderedQuantity = product.quantity;
//         // 🆕 Load product stock
//         const productDoc = await ProductModel.findById(productId);
//         if (!productDoc) {
//             throw new Error(`Product ${productId} not found`);
//         }
//         // Use 0 if null
//         const currentStock = productDoc.product_quantity ?? null;
//         const isStockDefined = currentStock !== null && currentStock !== undefined;
//         if (action === 'decrease') {
//             if (!quantity || quantity <= 0) {
//                 throw new Error(`Quantity must be > 0 for product ${productId}`);
//             }
//             // const newQuantity = Math.max(0, product.quantity - quantity);
//             const newQuantity = Math.max(0, quantity);
//             // const priceChange = (product.quantity - newQuantity) * (product.price ?? 0);
//             const decreasedAmount = product.quantity - newQuantity;
//             // 🟢 Update product stock
//             // ✅ Only update stock if it's a valid number
//             if (isStockDefined) {
//                 productDoc.product_quantity = currentStock + decreasedAmount;
//                 await productDoc.save();
//             }
//             // ⬇️ Store previous quantity and how much decreased
//             product.previous_quantity = product.quantity;
//             product.quantity_decreased = product.quantity - newQuantity;
//             const priceChange = (newQuantity) * (product.price ?? 0);
//             //productPriceChange = (product.quantity - newQuantity) * (product.price ?? 0);
//             product.quantity = newQuantity;
//             totalPriceChange += priceChange;
//             // If quantity goes to 0, remove item
//             // if (newQuantity === 0) {
//             //     order.order_items.splice(index, 1);
//             // }
//             product.update_action = action;
//         } else if (action === 'remove') {
//             const priceChange = product.quantity * (product.price ?? 0);
//             //productPriceChange = product.quantity * (product.price ?? 0);
//             totalPriceChange += priceChange;
//             //order.order_items.splice(index, 1);
//             // 🟢 Update product stock (add full quantity back)
//             // ✅ Only update stock if it's a valid number
//             if (isStockDefined) {
//                 productDoc.product_quantity = currentStock + product.quantity;
//                 await productDoc.save();
//             }
//             product.update_action = action;
//         }
//     }
//     const { coupon_discount, vat, delivery_charge, wallet_used } = order.order_details;
//     // Update product_price
//     //order.order_details.product_price = prevProductPrice - totalPriceChange;
//     // const updatedProductPrice = (order.order_items || []).reduce(
//     //     (sum, item) => sum + (item.quantity * (item.price ?? 0)),
//     //     0
//     // );
//     const updatedProductPrice = (order.order_items || [])
//         .filter(item => item.update_action !== 'remove')
//         .reduce(
//             (sum, item) => sum + (item.quantity * (item.price ?? 0)),
//             0
//         ); // calculate updated product price with quantity decreased products list only since we dont need removed products to calculate price.
//     order.order_details.product_price = updatedProductPrice;
//     // Also attach previous values to order for audit/logging
//     order.order_details.previous_product_price = previous_product_price;
//     order.previous_order_payable_amount = previous_order_payable_amount;
//     const subtotal = updatedProductPrice - coupon_discount;
//     const taxAmount = (subtotal * vat) / 100;
//     order.order_payable_amount = subtotal + taxAmount + delivery_charge - (wallet_used ?? 0);
//     const updatedOrder = await order.save();
//     return updatedOrder;
// }
const orderUpdateService = (orderId, updates) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const order = yield order_model_1.OrderModel.findById(orderId);
    if (!order)
        throw new Error("Order not found");
    let totalPriceChange = 0;
    const previous_product_price = order.order_details.product_price;
    const previous_order_payable_amount = order.order_payable_amount;
    for (const update of updates) {
        const productId = update._id._id;
        const { action, quantity } = update;
        if (!["decrease", "remove"].includes(action)) {
            throw new Error(`Invalid action "${action}"`);
        }
        const index = order.order_items.findIndex((item) => item._id.toString() === productId);
        if (index === -1)
            continue;
        const item = order.order_items[index];
        if (item.type === "product") {
            const productDoc = yield product_model_1.default.findById(productId);
            if (!productDoc)
                continue;
            const currentStock = productDoc.product_quantity;
            const isStockDefined = currentStock !== null && currentStock !== undefined;
            if (action === "decrease") {
                if (!quantity || quantity <= 0) {
                    throw new Error(`Quantity must be > 0 for product ${productId}`);
                }
                const newQuantity = Math.max(0, quantity);
                const decreasedAmount = item.quantity - newQuantity;
                if (isStockDefined) {
                    productDoc.product_quantity = currentStock + decreasedAmount;
                    yield productDoc.save();
                }
                item.previous_quantity = item.quantity;
                item.quantity_decreased = decreasedAmount;
                item.quantity = newQuantity;
                item.update_action = action;
                totalPriceChange += newQuantity * ((_a = item.price) !== null && _a !== void 0 ? _a : 0);
            }
            if (action === "remove") {
                if (isStockDefined) {
                    productDoc.product_quantity = currentStock + item.quantity;
                    yield productDoc.save();
                }
                item.update_action = action;
                totalPriceChange += item.quantity * ((_b = item.price) !== null && _b !== void 0 ? _b : 0);
            }
        }
        if (item.type === "combo") {
            if (action === "decrease") {
                if (!quantity || quantity <= 0) {
                    throw new Error(`Quantity must be > 0 for combo ${productId}`);
                }
                const newQuantity = Math.max(0, quantity);
                const decreasedAmount = item.quantity - newQuantity;
                const combo = yield combo_model_1.ComboModel.findById(item._id);
                for (const comboProduct of (combo === null || combo === void 0 ? void 0 : combo.combo_products) || []) {
                    const productId = comboProduct.product_id._id || comboProduct.product_id;
                    const productDoc = yield product_model_1.default.findById(productId);
                    if (!productDoc)
                        continue;
                    const currentStock = productDoc.product_quantity;
                    const isStockDefined = currentStock !== null && currentStock !== undefined;
                    const perComboQty = (_c = comboProduct.product_quantity) !== null && _c !== void 0 ? _c : 1;
                    const qtyToRestore = perComboQty * decreasedAmount;
                    if (isStockDefined) {
                        productDoc.product_quantity = currentStock + qtyToRestore;
                        yield productDoc.save();
                    }
                }
                item.previous_quantity = item.quantity;
                item.quantity_decreased = decreasedAmount;
                item.quantity = newQuantity;
                item.update_action = action;
                totalPriceChange += newQuantity * ((_d = item.price) !== null && _d !== void 0 ? _d : 0);
            }
            if (action === "remove") {
                const combo = yield combo_model_1.ComboModel.findById(item._id);
                for (const comboProduct of (combo === null || combo === void 0 ? void 0 : combo.combo_products) || []) {
                    const productId = comboProduct.product_id._id || comboProduct.product_id;
                    const productDoc = yield product_model_1.default.findById(productId);
                    if (!productDoc)
                        continue;
                    const currentStock = productDoc.product_quantity;
                    const isStockDefined = currentStock !== null && currentStock !== undefined;
                    const perComboQty = (_e = comboProduct.product_quantity) !== null && _e !== void 0 ? _e : 1;
                    const totalQtyToRestore = perComboQty * item.quantity;
                    if (isStockDefined) {
                        productDoc.product_quantity = currentStock + totalQtyToRestore;
                        yield productDoc.save();
                    }
                }
                item.update_action = action;
                totalPriceChange += item.quantity * ((_f = item.price) !== null && _f !== void 0 ? _f : 0);
            }
        }
    }
    // Recalculate price
    const { coupon_discount, vat, delivery_charge, wallet_used } = order.order_details;
    const updatedProductPrice = (order.order_items || [])
        .filter((item) => item.update_action !== "remove")
        .reduce((sum, item) => { var _a; return sum + item.quantity * ((_a = item.price) !== null && _a !== void 0 ? _a : 0); }, 0);
    order.order_details.previous_product_price = previous_product_price;
    order.previous_order_payable_amount = previous_order_payable_amount;
    order.order_details.product_price = updatedProductPrice;
    const subtotal = updatedProductPrice - coupon_discount;
    const taxAmount = (subtotal * vat) / 100;
    order.order_payable_amount =
        subtotal + taxAmount + delivery_charge - (wallet_used !== null && wallet_used !== void 0 ? wallet_used : 0);
    const updatedOrder = yield order.save();
    return updatedOrder;
});
exports.OrderServices = {
    findOrdersByUserIdServices,
    createOrderService,
    applyFromWalletServices,
    cancelOrderService,
    orderStatusUpdateService,
    updateOrderPaymentStatus,
    findDashboardOrdersServices,
    findSingleOrderServices,
    orderUpdateService,
};
