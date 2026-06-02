import { Request, Response, NextFunction, RequestHandler } from 'express';
import httpStatus from 'http-status';
import { RequestOrderServices } from './requestOrder.service';
import sendResponse from '../../utils/sendResponse';


// POST
export const postRequestOrder: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?._id;
  const requestOrderBody = {
    ...req.body,
    user_id: userId,
  }
  const result = await RequestOrderServices.postRequestOrderService(requestOrderBody);

  return sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Product added to requestOrder',
    data: result,
  });
};

// GET
export const getRequestOrder: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?._id;

  const result = await RequestOrderServices.getRequestOrderService(userId);

  return sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'RequestOrder fetched successfully',
    data: result,
  });
};

// GET dashboard
export const getRequestOrderDashboard: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?._id;

  const result = await RequestOrderServices.getRequestOrderDashboardService(userId);

  return sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'RequestOrder for dashboard fetched successfully',
    data: result,
  });
};

// UPDATE
export const updateRequestOrder: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?._id;
  const product_id = req.params.product_id
  const updatedData = req.body;
  const result = await RequestOrderServices.updateRequestOrderService(product_id, updatedData);

  return sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'RequestOrder updated successfully',
    data: result,
  });
};

// update by admin
export const updateRequestOrderByAdmin: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const payload = req.body;

    const result = await RequestOrderServices.updateRequestOrderByAdminService(payload);

    res.status(httpStatus.OK).json({
      success: true,
      message: "Request Order updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Remove
export const removeFromRequestOrder: RequestHandler = async (req, res): Promise<void> => {
  const userId = req.user?._id;
  const productId = req.params.product_id;
  console.log(req.params, 'req.params from removeFromRequestOrder');
  console.log(productId, 'productId from removeFromRequestOrder');


  const result = await RequestOrderServices.removeFromRequestOrderService(userId, productId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Product removed from requestOrder',
    data: result,
  });
};
