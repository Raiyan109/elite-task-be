import { Request, Response, NextFunction, RequestHandler } from "express";
import httpStatus from "http-status";
import { ICoupon } from "./coupon.interface";
import * as CouponService from "./coupon.service";
import sendResponse from "../../utils/sendResponse";
import { CouponModel } from "./coupon.model";
import { OrderModel } from "../Order/order.model";
import catchAsync from "../../utils/catchAsync";
import { CouponNotAppliedModel } from "../CouponNotApplied/couponNotApplied.model";
import mongoose from "mongoose";
import ProductModel from "../Product/product.model";
import { HotDealModel } from "../HotDeals/hotDeal.model";


export const createCoupon: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const result = await CouponService.createCouponService(req.body);

    sendResponse<ICoupon>(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Coupon created successfully",
        data: result,
    });
};

export const findAllCoupons: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const result = await CouponService.getAllCouponsService();

    sendResponse<ICoupon[]>(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Coupons fetched successfully",
        data: result,
    });
};


export const findAllDashboardCoupons = catchAsync(async (req, res) => {
    const query = req.query
    const result = await CouponService.findAllDashboardCouponServices(query);

    // Check if the database collection is empty or no matching data is found
    // if (!result || result.length === 0) {
    //     return sendResponse(res, {
    //         success: false,
    //         statusCode: httpStatus.NOT_FOUND,
    //         message: 'No data found.',
    //         data: [],
    //     });
    // }

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Dashboard coupons retrieved successfully',
        data: result,
    });
});

const parseDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day); // JS month is 0-based
};

// export const checkCoupon: RequestHandler = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ): Promise<void> => {
//     const userId = req.user?._id;
//     const { coupon_code, orderTotal, product_ids } = req.body;
//     console.log('body from checkCoupon >>>>>>>>>', req.body);
//     const checkBody = {
//         coupon_code,
//         orderTotal,
//         userId
//     };

//     const coupon = await CouponModel.findOne({ coupon_code });

//     if (!coupon) {
//         return sendResponse(res, {
//             success: false,
//             statusCode: httpStatus.NOT_FOUND,
//             message: "Invalid coupon",
//         });
//     }

//     // Check validity
//     const now = new Date();
//     const startDate = parseDate(coupon.coupon_start_date);
//     const endDate = parseDate(coupon.coupon_end_date);
//     console.log('coupon >>>>>>>>>', coupon);
//     console.log('startDate >>>>>>>>>', startDate);
//     console.log('endDate >>>>>>>>>', endDate);
//     console.log('now >>>>>>>>>', now);
//     if (
//         coupon.coupon_status !== "active" ||
//         startDate > now ||
//         endDate < now
//     ) {
//         return sendResponse(res, {
//             success: false,
//             statusCode: httpStatus.NOT_FOUND,
//             message: "Coupon is not valid anymore.",
//         });
//     }

//     // Check min order condition
//     if (orderTotal < coupon.coupon_min_order) {
//         return sendResponse(res, {
//             success: false,
//             statusCode: httpStatus.NOT_FOUND,
//             message: `Order must be at least ৳${coupon.coupon_min_order} to use this coupon.`,
//         });
//     }

//     // Check if user already used this coupon
//     const usedBefore = await OrderModel.exists({
//         order_user_id: userId,
//         "order_details.coupon": coupon._id,
//     });

//     if (usedBefore) {
//         return sendResponse(res, {
//             success: false,
//             statusCode: httpStatus.NOT_FOUND,
//             message: "You have already used this coupon."
//         });
//     }

//     // Fetch all CouponNotApplied documents and populate product details
//     const couponNotAppliedList = await CouponNotAppliedModel.find().populate(
//         "coupon_not_applied_products.product_id"
//     );

//     // Collect all disallowed products across all documents
//     const disallowedMap = new Map<string, string>(); // Map<productId, productName>
//     couponNotAppliedList.forEach((doc) => {
//         doc.coupon_not_applied_products.forEach((item: any) => {
//             if (item.product_id?._id && item.product_id?.product_name) {
//                 const id = item.product_id._id.toString();
//                 const name = item.product_id.product_name;
//                 disallowedMap.set(id, name);
//             }
//         });
//     });

//     // Check incoming product_ids for conflicts with disallowed products
//     const conflictingNames: string[] = [];
//     if (Array.isArray(product_ids)) {
//         product_ids.forEach((id: string) => {
//             const pid = id.toString();
//             if (disallowedMap.has(pid)) {
//                 conflictingNames.push(disallowedMap.get(pid)!);
//             }
//         });
//     }

//     if (conflictingNames.length > 0) {
//         return sendResponse(res, {
//             success: false,
//             statusCode: httpStatus.NOT_FOUND,
//             message: `Can not use coupon for these products: ${conflictingNames.join(", ")}`,
//         });
//     }

//     const result = {
//         couponId: coupon._id,
//         discount: coupon.coupon_discount_amount,
//     }

//     sendResponse(res, {
//         success: true,
//         statusCode: httpStatus.CREATED,
//         message: "Coupon checked successfully",
//         data: result,
//     });
// };


// alternative (more efficient than previous one) 
export const checkCoupon: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { coupon_code, product_ids, cart } = req.body;

    // 1. Find coupon
    const coupon = await CouponModel.findOne({ coupon_code });
    if (!coupon) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.NOT_FOUND,
        message: "Invalid coupon",
      });
    }

    // 2. Validate coupon status & dates
    const now = new Date();
    const startDate = parseDate(coupon.coupon_start_date);
    const endDate = parseDate(coupon.coupon_end_date);

    if (coupon.coupon_status !== "active" || startDate > now || endDate < now) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.NOT_FOUND,
        message: "Coupon is not valid anymore.",
      });
    }

    const objectIds = product_ids.map((id: string) => new mongoose.Types.ObjectId(id));

    // 3. Fetch products
    const products = await ProductModel.find({ _id: { $in: objectIds } })
      .select("product_price product_discount_price product_name")
      .lean();

    if (!products.length) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.BAD_REQUEST,
        message: "No valid products found for this coupon",
      });
    }

    // 4. Fetch disallowed products for coupon
    const disallowedDocs = await CouponNotAppliedModel.find({
      "coupon_not_applied_products.product_id": { $in: objectIds },
    }).select("coupon_not_applied_products.product_id").lean();

    const disallowedIds = new Set<string>();
    disallowedDocs.forEach((doc) =>
      doc.coupon_not_applied_products.forEach((p: any) => disallowedIds.add(p.product_id.toString()))
    );

    // 5. Fetch hot deal products
    const nowISO = now.toISOString();
    const hotDeals = await HotDealModel.find({
      "hotDeal_products.product_id": { $in: objectIds },
      hotDeal_status: "active",
      hotDeal_start_date: { $lte: nowISO },
      hotDeal_end_date: { $gte: nowISO },
    }).select("hotDeal_products").lean();

    // Map productId => hotDeal discount
    const hotDealMap = new Map<string, number>();
    hotDeals.forEach((deal: any) => {
      deal.hotDeal_products.forEach((hp: any) => {
        hotDealMap.set(hp.product_id.toString(), hp.discount_amount);
      });
    });

    // Build a map: productId => cart item
    const cartMap = new Map<string, { quantity: number; type: string }>();
    cart?.forEach((c: any) => {
      cartMap.set(c._id, c);
    });

    // 6. Calculate eligible & disallowed products and eligible total
    let eligibleTotal = 0;
    const eligibleProducts: typeof products = [];
    const disallowedProducts: typeof products = [];

    products.forEach((p: any) => {
      const pid = p._id.toString();
      let price = p.product_discount_price ?? p.product_price ?? 0;

      // Apply hot deal discount if exists
      if (hotDealMap.has(pid)) {
        price -= hotDealMap.get(pid)!;
      }

      // Find cart item for this product
      // const cartItem = cart.find((c: any) => c._id === pid && c.type === "product");
      const cartItem = cartMap.get(pid);
      const quantity = cartItem?.quantity ?? 1; // default to 1 if not found

      if (disallowedIds.has(pid)) {
        disallowedProducts.push({...p, quantity});
      } else {
        eligibleProducts.push({...p, quantity});
        eligibleTotal += price * quantity; // ✅ multiply by quantity
      }
    });

    // console.log('eligibleTotal:', eligibleTotal);

    if (eligibleTotal < coupon.coupon_min_order) {
const disallowedNames = disallowedProducts.map((p: any) => p.product_name).join(", ");

      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.BAD_REQUEST,
        message: `Order must be at least ৳${coupon.coupon_min_order} in eligible products to use this coupon.`+ (disallowedNames ? ` These products will not be considered for coupon: ${disallowedNames}` : ""),
      });
    }
    

    // 7. Check if user already used coupon
    const usedBefore = await OrderModel.exists({
      order_user_id: userId,
      "order_details.coupon": coupon.coupon_code,
    });

    if (usedBefore) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.FORBIDDEN,
        message: "You have already used this coupon.",
      });
    }

    // 8. Return result
    const result = {
      couponId: coupon._id,
      discount: coupon.coupon_discount_amount,
      eligibleTotal,
      eligibleProducts,
      disallowedProducts,
    };

    return sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Coupon checked successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


export const updateCoupon: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const { _id } = req.params;
    const result = await CouponService.updateCouponService(_id, req.body);

    sendResponse<ICoupon | null>(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Coupon updated successfully",
        data: result,
    });
};

export const deleteCoupon: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const { _id } = req.params;
    const result = await CouponService.deleteCouponService(_id);

    sendResponse<ICoupon | null>(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Coupon deleted successfully",
        data: result,
    });
};
