import { NextFunction, Request, RequestHandler, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { OrderServices } from "./order.service";
import { IOrder } from "./order.interface";
import httpStatus from "http-status";
import { AddressModel } from "../Address/address.model";
import SSLCommerzPayment from "sslcommerz-lts";
import config from "../../config";
import mongoose from "mongoose";
import ProductModel from "../Product/product.model";
import { OrderModel } from "./order.model";
import { ComboModel } from "../Combo/combo.model";

const generateOrderId = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Ensures a 4-digit number
};

// const createOrder: RequestHandler = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ): Promise<void> => {
//     const order_user_id = req.user?._id
//     const order_id = generateOrderId();
//     const {
//         order_details,
//         order_tip = 0,
//         order_payment_method,
//         order_delivery_location,
//         order_product_id
//     } = req.body;

//     // Extract necessary fields from order_details
//     const {
//         product_price,
//         coupon_discount = 0,
//         delivery_charge = 0,
//         vat = 0,
//         wallet_used = 0,
//         demand_charge = 0,
//     } = order_details;

//     // Calculate VAT amount (as percentage of product_price)
//     const vatAmount = product_price * (vat / 100);

//     // Calculate total payable amount (backend authority!)
//     const order_payable_amount =
//         product_price -
//         coupon_discount -
//         wallet_used +
//         delivery_charge +
//         vatAmount +
//         order_tip +
//         demand_charge;

//     const order_payment_transactionId = `TXN-${Date.now()}`;

//     const orderBody: any = {
//         ...req.body,
//         order_id,
//         order_user_id,
//         order_payable_amount,
//     };

//     if (order_payment_method === "ssl") {
//         const userInfo = await AddressModel.findOne({ _id: order_delivery_location });
//         const order_user_name = userInfo?.address_name
//         const order_user_email = userInfo?.address_email;
//         const order_user_phone = userInfo?.address_phone;
//         const order_delivery_district = userInfo?.address_district;
//         // orderBody.order_payable_amount = order_payable_amount;
//         orderBody.order_payment_transactionId = order_payment_transactionId;

//         const data = {
//             total_amount: order_payable_amount,
//             currency: "BDT",
//             tran_id: order_payment_transactionId,
//             success_url: `http://192.168.0.169:5000/api/v1/order/success/${order_id}?order_product_id=${order_product_id}`,
//             fail_url: `http://192.168.0.169:5000/api/v1/order/fail/${order_id}`,
//             cancel_url: `http://192.168.0.169:5000/api/v1/order/cancel/${order_id}`,
//             ipn_url: `http://192.168.0.169:5000/api/v1/order/ipn/${order_id}`,
//             shipping_method: "Courier",
//             product_name: "Groceries",
//             product_category: "Daily Needs",
//             product_profile: "general",
//             cus_name: order_user_name || "Customer",
//             cus_email: order_user_email || "customer@example.com",
//             cus_add1: "Customer Address",
//             cus_phone: order_user_phone || "0000000000",
//             cus_city: "Dhaka",
//             cus_postcode: "1207",
//             cus_country: "Bangladesh",
//             ship_name: order_user_name || 'Customer Name',
//             ship_add1: order_delivery_district || 'Dhaka',
//             ship_add2: 'Dhaka',
//             ship_city: order_delivery_district || 'Dhaka',
//             ship_state: 'Dhaka',
//             ship_postcode: 1000,
//             ship_country: 'Bangladesh',
//         };

//         const sslcz = new SSLCommerzPayment(config.payment.store_id, config.payment.store_passwd, config.payment.is_live);

//         const apiResponse = await sslcz.init(data);
//         // console.log(apiResponse, 'apiResponse');

//         if (apiResponse?.GatewayPageURL) {
//             // Optionally, save order as pending here
//             // await OrderServices.createOrderService(orderBody);

//             sendResponse(res, {
//                 success: true,
//                 statusCode: httpStatus.CREATED,
//                 message: "Redirect to SSLCommerz",
//                 data: {
//                     GatewayPageURL: apiResponse.GatewayPageURL,
//                     transactionId: order_payment_transactionId,
//                     orderId: order_id
//                 },
//             });
//         } else {
//             throw new Error("SSLCommerz initialization failed");
//         }
//     }

//     const result = await OrderServices.createOrderService(orderBody);

//     sendResponse<IOrder>(res, {
//         success: true,
//         statusCode: httpStatus.CREATED,
//         message: "Order created successfully",
//         data: result,
//     });
// };

// Orders by user id


const createOrder: RequestHandler = async (
    req,
    res,
    next
) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const order_user_id = req.user?._id;
        const order_id = generateOrderId();

        const {
            order_details,
            order_tip = 0,
            order_payment_method,
            order_delivery_location,
            order_product_id,
            order_items,
        } = req.body;

        const {
            product_price,
            coupon_discount = 0,
            delivery_charge = 0,
            vat = 0,
            wallet_used = 0,
            demand_charge = 0,
        } = order_details;

        const vatAmount = product_price * (vat / 100);

        const order_payable_amount =
            product_price -
            coupon_discount -
            wallet_used +
            delivery_charge +
            vatAmount +
            order_tip +
            demand_charge;

        const order_payment_transactionId = `TXN-${Date.now()}`;

        const orderBody: any = {
            ...req.body,
            order_id,
            order_user_id,
            order_payable_amount,
            order_items: order_items.map((item: any) => ({
                ...item,
                refCollection: item.type === 'product' ? 'products' : 'combos'
            }))
        };

        // SSLCommerz logic (skip DB ops for now)
        if (order_payment_method === "ssl") {
            const userInfo = await AddressModel.findOne({ _id: order_delivery_location });
            const order_user_name = userInfo?.address_name;
            const order_user_email = userInfo?.address_email;
            const order_user_phone = userInfo?.address_phone;
            const order_delivery_district = userInfo?.address_district;

            orderBody.order_payment_transactionId = order_payment_transactionId;
            orderBody.order_status = "pending";
            orderBody.order_payment_status = "unpaid";

            // STEP 1: Create Order (no stock update yet)
            const createdOrder = await OrderServices.createOrderService(orderBody, session);

            // STEP 2: Commit the transaction before redirect
            await session.commitTransaction();
            session.endSession();

            const data = {
                total_amount: order_payable_amount,
                currency: "BDT",
                tran_id: order_payment_transactionId,
                success_url: `${config.baseApiBackendLocal}/order/success/${order_id}?order_product_id=${order_product_id}`,
                fail_url: `${config.baseApiBackendLocal}/order/fail/${order_id}`,
                cancel_url: `${config.baseApiBackendLocal}/order/cancel/${order_id}`,
                ipn_url: `${config.baseApiBackendLocal}/order/ipn/${order_id}`,
                shipping_method: "Courier",
                product_name: "Groceries",
                product_category: "Daily Needs",
                product_profile: "general",
                cus_name: order_user_name || "Customer",
                cus_email: order_user_email || "customer@example.com",
                cus_add1: "Customer Address",
                cus_phone: order_user_phone || "0000000000",
                cus_city: "Dhaka",
                cus_postcode: "1207",
                cus_country: "Bangladesh",
                ship_name: order_user_name || "Customer Name",
                ship_add1: order_delivery_district || "Dhaka",
                ship_add2: "Dhaka",
                ship_city: order_delivery_district || "Dhaka",
                ship_state: "Dhaka",
                ship_postcode: 1000,
                ship_country: "Bangladesh",
            };

            const sslcz = new SSLCommerzPayment(config.payment.store_id, config.payment.store_passwd, config.payment.is_live);
            const apiResponse = await sslcz.init(data);

            if (apiResponse?.GatewayPageURL) {
                // await session.abortTransaction(); // no DB changes yet
                // session.endSession();

                return sendResponse(res, {
                    success: true,
                    statusCode: httpStatus.CREATED,
                    message: "Redirect to SSLCommerz",
                    data: {
                        GatewayPageURL: apiResponse.GatewayPageURL,
                        transactionId: order_payment_transactionId,
                        orderId: order_id,
                    },
                });
            } else {
                throw new Error("SSLCommerz initialization failed");
            }
        }

        orderBody.order_payment_status = "unpaid";

        // STEP 1: Create Order
        const createdOrder = await OrderServices.createOrderService(orderBody, session);

        // STEP 2: Update Product Quantities
        let hasStockToUpdate = false;

        for (const item of order_items) {
            if (item.type === "product") {
                const product = await ProductModel.findById(item._id).session(session);
                if (!product || product.product_quantity == null) continue;

                // Flag to indicate that at least one stock will be updated
                hasStockToUpdate = true;

                if (product.product_quantity < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.product_name}`);
                }

                product.product_quantity -= item.quantity;
                await product.save({ session });
            }

            if (item.type === "combo") {
                for (const comboProduct of item.combo_products || []) {
                    const productId = comboProduct.product_id._id || comboProduct.product_id;
                    const quantityToDecrease = comboProduct.product_quantity * item.quantity;

                    const product = await ProductModel.findById(productId).session(session);
                    if (!product || product.product_quantity == null) continue;

                    // Flag to indicate that at least one stock will be updated
                    hasStockToUpdate = true;

                    if (product.product_quantity < quantityToDecrease) {
                        throw new Error(`Insufficient stock for ${product.product_name}`);
                    }

                    product.product_quantity -= quantityToDecrease;
                    await product.save({ session });
                }
            }
        }

        // Optional: If none of the products had stock info
        if (!hasStockToUpdate) {
            console.log("All product quantities are null. No stock update needed.");
        }

        // STEP 3: Commit Transaction
        await session.commitTransaction();
        session.endSession();

        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Order created and stock updated successfully",
            data: createdOrder,
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error); // handle globally
    }
};


const findOrdersByUserId = catchAsync(async (req, res) => {
    const { user_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const result = await OrderServices.findOrdersByUserIdServices(user_id, limitNumber, skip)

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Orders by user id retrieved successfully',
        data: result.data,
        totalData: result.total,
        pagination: {
            currentPage: result.page,
            limit: result.limit,
            totalPage: Math.ceil(result.total / result.limit),
        }
    });
});

const findTransactionsByUserId = catchAsync(async (req, res) => {
    const { user_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const result = await OrderServices.findTransactionsByUserIdServices(user_id, limitNumber, skip)

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Transactions by user id retrieved successfully',
        data: result.data,
        totalData: result.total,
        pagination: {
            currentPage: result.page,
            limit: result.limit,
            totalPage: Math.ceil(result.total / result.limit),
        }
    });
});

// Dashboard orders
const findDashboardOrders = catchAsync(async (req, res) => {
    const { page = 1, limit = 10, searchTerm = '', order_status,
        order_payment_status,
        order_payment_method } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const filters = {
        ...(order_status && { order_status: String(order_status) }),
        ...(order_payment_status && { order_payment_status: String(order_payment_status) }),
        ...(order_payment_method && { order_payment_method: String(order_payment_method) })
    };

    const result = await OrderServices.findDashboardOrdersServices(limitNumber, skip, searchTerm as '', filters)

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Dashboard orders retrieved successfully',
        data: result.data,
        totalData: result.total,
        pagination: {
            currentPage: result.page,
            limit: result.limit,
            totalPage: Math.ceil(result.total / result.limit),
        }
    });
});

// get single product
const findSingleOrder = catchAsync(async (req, res, next: NextFunction) => {
    const { id } = req.params; // Get all query parameters

    // Step 1: Fetch product using the service
    const order = await OrderServices.findSingleOrderServices(id);

    // Step 2: Check if no data is found
    if (!order) {
        return sendResponse(res, {
            success: false,
            statusCode: httpStatus.NOT_FOUND,
            message: 'No data found.',
            data: [],
        });
    }

    // Step 4: Send the response
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Single order retrieved successfully',
        data: order,
    });
});

// Apply from wallet
const applyFromWallet = catchAsync(async (req, res) => {
    const userId = req.user?._id;
    const { totalAmount } = req.body;
    const result = await OrderServices.applyFromWalletServices(userId, totalAmount || 0);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Applied from wallet successfully',
        data: result,
    });
});

// Cancel order
const cancelOrder = catchAsync(async (req, res) => {
    const { order_id } = req.params;
    const result = await OrderServices.cancelOrderService(order_id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Order canceled successfully',
        data: result,
    });
})

// Order status update
const orderStatusUpdate = catchAsync(async (req, res) => {
    const userId = req.user?._id;
    const { order_id } = req.params;
    const { order_status, order_publisher_note, payment_status } = req.body;

    if (!order_status) {
        sendResponse(res, {
            statusCode: 400,
            success: false,
            message: 'Status is required',
        });
    }

    const result = await OrderServices.orderStatusUpdateService(order_id, order_status, order_publisher_note, userId, payment_status);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Order status updated successfully',
        data: result,
    });
})

// SSL Commerz payment success
const sslSuccess = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body, 'req.body from ssl success controller');
    console.log(req.params, 'req.params from ssl success controller');
    console.log(req.query, 'req.query from ssl success controller');

    try {
        const { order_id } = req.params;
        const transactionId = req.body.tran_id;
        const order_product_id = req.query.order_product_id;
        const cardIssuer = req.body.card_issuer || "N/A";
        const cardType = req.body.card_type || "N/A";

        const cardMethod = cardType.split("-")[0]

        // Mark order as paid
        const updatedOrder = await OrderServices.updateOrderPaymentStatus(order_id, {
            order_payment_status: "paid",
            order_status: "pending",
            order_payment_transactionId: transactionId,
            order_payment_method: cardIssuer
        });

        // Fetch full order to process stock
        const order = await OrderModel.findOne({ order_id }).lean();
        const order_items = order?.order_items || [];

        console.log(order_id, order);


        // Update Product Quantities
        let hasStockToUpdate = false;

        for (const item of order_items) {
            if (item.type === "product") {
                const product = await ProductModel.findById(item._id);
                if (!product || product.product_quantity == null) continue;

                // Flag to indicate that at least one stock will be updated
                hasStockToUpdate = true;

                if (product.product_quantity < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.product_name}`);
                }

                product.product_quantity -= item.quantity;
                await product.save();
            }

            if (item.type === "combo") {
                const combo = await ComboModel.findById(item._id).lean();
                if (!combo || !combo.combo_products?.length) continue;

                for (const comboProduct of combo.combo_products || []) {
                    const productId = comboProduct.product_id._id || comboProduct.product_id;
                    const quantityToDecrease = comboProduct.product_quantity * item.quantity;

                    const product = await ProductModel.findById(productId);
                    if (!product || product.product_quantity == null) continue;

                    // Flag to indicate that at least one stock will be updated
                    hasStockToUpdate = true;

                    if (product.product_quantity < quantityToDecrease) {
                        throw new Error(`Insufficient stock for ${product.product_name}`);
                    }

                    product.product_quantity -= quantityToDecrease;
                    await product.save();
                }
            }
        }

        // Optional: If none of the products had stock info
        if (!hasStockToUpdate) {
            console.log("All product quantities are null. No stock update needed.");
        }

        // Redirect to frontend success page
        if (order_product_id) {
            return res.redirect(`${config.baseApiWebLocal}/payment-success?order_id=${order_id}&order_product_id=${order_product_id}`);
        }
        return res.redirect(`${config.baseApiWebLocal}/payment-success?order_id=${order_id}`);

    } catch (err) {
        next(err);
    }
};

// SSL Commerz payment fail
const sslFail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { order_id } = req.params;

        // Mark order as failed
        await OrderServices.updateOrderPaymentStatus(order_id, {
            order_payment_status: "failed",
            order_status: "canceled",
        });

        // Redirect to frontend failure page
        return res.redirect(`${config.baseApiWebLocal}/payment-fail?order_id=${order_id}`);
    } catch (err) {
        next(err);
    }
};

// Order update
const orderUpdate = catchAsync(async (req, res) => {
    const userId = req.user?._id;
    const { order_id } = req.params;
    //const { productId, action, quantity } = req.body;

    const updates = req.body; // this is now an array


    // console.log('updates >>>>>>>>>', updates);
    // console.log('productId >>>>>>>>>', productId);

    // Validate action
    // if (!['decrease', 'remove'].includes(action)) {
    //     throw new Error('Invalid action. Must be "decrease" or "remove"');
    // }

    if (!Array.isArray(updates)) {
        throw new Error("Invalid payload. Expected an array of update actions.");
    }

    // // Validate quantity if action is decrease
    // if (action === 'decrease' && (!quantity || quantity <= 0)) {
    //     throw new Error('Quantity must be a positive number for decrease action');
    // }

    const result = await OrderServices.orderUpdateService(order_id, /*productId, action, quantity*/ updates);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Order updated successfully',
        data: result,
    });
})

export const OrderControllers = {
    findOrdersByUserId,
    createOrder,
    applyFromWallet,
    cancelOrder,
    orderStatusUpdate,
    sslSuccess,
    sslFail,
    findDashboardOrders,
    findSingleOrder,
    orderUpdate,
    findTransactionsByUserId

}