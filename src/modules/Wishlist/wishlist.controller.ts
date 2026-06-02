import { Request, Response, NextFunction, RequestHandler } from 'express';
import httpStatus from 'http-status';
import { WishlistServices } from './wishlist.service';
import sendResponse from '../../utils/sendResponse';


// POST
export const postWishlist: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?._id;
  const wishlistBody = {
    ...req.body,
    user_id: userId,
  }
  const result = await WishlistServices.postWishlistService(wishlistBody);

  return sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Product added to wishlist',
    data: result,
  });
};

// GET
export const getWishlist: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?._id;

  const result = await WishlistServices.getWishlistService(userId);

  return sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Wishlist fetched successfully',
    data: result,
  });
};

// UPDATE
export const updateWishlist: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?._id;
  const updatedData = req.body;

  const result = await WishlistServices.updateWishlistService(userId, updatedData);

  return sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Wishlist updated successfully',
    data: result,
  });
};

// Remove
export const removeFromWishlist: RequestHandler = async (req, res): Promise<void> => {
  const userId = req.user?._id;
  const productId = req.params.product_id;
  console.log(req.params, 'req.params from removeFromWishlist');
  console.log(productId, 'productId from removeFromWishlist');


  const result = await WishlistServices.removeFromWishlistService(userId, productId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Product removed from wishlist',
    data: result,
  });
};
