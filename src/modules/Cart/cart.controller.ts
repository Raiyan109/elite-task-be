import { Request, Response, NextFunction, RequestHandler } from "express";
import httpStatus from "http-status";
import { CartServices } from "./cart.service";
import sendResponse from "../../utils/sendResponse";


const postCart: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    // const userId = req.user?._id;
    const cartData = {
        ...req.body,
        // user_id: userId,
    }
    console.log(cartData, 'cartData from cart controller');

    const result = await CartServices.postCartService(cartData);

    return sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Cart created successfully",
        data: result,
    });
};

const incrementQuantity: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const userId = req.user._id;
    const { productId } = req.params;
    console.log('productId >>>>>>>>>', productId);

    const result = await CartServices.incrementProductQuantityService(userId, productId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Product quantity increased",
        data: result,
    });
};

const decrementQuantity: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const userId = req.user._id;
    const { productId } = req.params;

    const result = await CartServices.decrementProductQuantityService(userId, productId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Product quantity updated",
        data: result,
    });
};

const removeCartItem: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const userId = req.user._id;
    const { productId } = req.params;

    const result = await CartServices.removeCartItemService(userId, productId);

    return sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result ? "Item removed from cart" : "Item removed, cart deleted (was last item)",
        data: result,
    });
};


const getCart: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const userId = req.user._id;
    console.log(userId, "user from cart controller");

    const result = await CartServices.getCartService(userId);

    return sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Cart fetched successfully",
        data: result,
    });
};

export const CartController = {
    postCart,
    incrementQuantity,
    decrementQuantity,
    removeCartItem,
    getCart,
};
