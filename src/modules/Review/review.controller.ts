import { NextFunction, Request, Response } from 'express';
import { ReviewService } from './review.service';
import { ReviewModel } from './review.model';
import * as fs from "fs";
import { IReview } from './review.interface';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { FileUploadHelper } from '../../helpers/FileUploadHelper';
import sendResponse from '../../utils/sendResponse';
import ProductModel from '../Product/product.model';
import { ComboModel } from '../Combo/combo.model';


const createReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestData = req.body;
    const review = requestData?.review_link;
    const findReviewNameExist = await ReviewModel.exists({ review });
    const userId = req.user?._id;

    const { review_product_id, review_combo_id } = requestData;
    const product = await ProductModel.findOne({ _id: review_product_id })
    const combo = await ComboModel.findOne({ _id: review_combo_id })
    console.log(product);
    console.log(combo);


    const reviewData = {
      ...requestData,
      review_user_id: userId,
    }

    const result = await ReviewService.createReviewServices(reviewData);

    if (result) {
      return sendResponse<IReview>(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Review Added Successfully !",
        data: result
      });
    } else {
      throw new AppError(400, "Review Added Failed !");
    }
  } catch (error: any) {
    next(error);
  }
});


const findReviews = catchAsync(async (req, res) => {
  const query = req.query
  console.log('Query parameters received:', query);
  const result = await ReviewService.findReviewsServices(query);

  // Check if the database collection is empty or no matching data is found
  if (!result || result.length === 0) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.NOT_FOUND,
      message: 'No data found.',
      data: [],
    });
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Reviews retrieved successfully',
    data: result,
  });
});

const findAllDashboardReviews = catchAsync(async (req, res) => {
  const query = req.query
  const result = await ReviewService.findAllDashboardReviewServices(query);

  // Check if the database collection is empty or no matching data is found
  if (!result || result.length === 0) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.NOT_FOUND,
      message: 'No data found.',
      data: [],
    });
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Dashboard reviews retrieved successfully',
    data: result,
  });
});


// Review by product id
const findReviewsByProductId = catchAsync(async (req, res) => {
  const { review_product_id } = req.params;
  const result = await ReviewService.findReviewsByProductIdServices(review_product_id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Review by product id retrieved successfully',
    data: result,
  });

});

const updateReview = catchAsync(async (req, res, next) => {
  try {
    if (req.files && "review_image" in req.files && req.body) {
      const requestData = req.body;

      // const findReviewNameExist = await ReviewModel.exists({ review_title: requestData?.review_title });
      // if (findReviewNameExist) {
      //   if (req.files?.review_image?.[0]?.path) {
      //     try {
      //       fs.unlinkSync(req.files.review_image[0].path);
      //     } catch (error) {
      //       console.error("Error deleting file:", error);
      //     }
      //   }
      //   throw new AppError(httpStatus.BAD_REQUEST, 'This review already exists!');
      // }

      // const findBrandSerialExist = await ReviewModel.exists({
      //   review_serial: requestData?.review_serial,
      // });
      // if (findBrandSerialExist) {
      //   if (req.files?.review_image?.[0]?.path) {
      //     try {
      //       fs.unlinkSync(req.files.review_image[0].path);
      //     } catch (error) {
      //       console.error("Error deleting file:", error);
      //     }
      //   }
      //   throw new AppError(httpStatus.BAD_REQUEST, 'Serial Number Previously Added!');
      // }


      // Find the review that currently has the given newSerial
      const existingReview = await ReviewModel.findOne({ review_serial: requestData?.review_serial });

      //console.log("hello",existingReview);


      // Find the review that is being updated
      const reviewToUpdate = await ReviewModel.findById(requestData?._id);

      //console.log(reviewToUpdate);


      if (!reviewToUpdate) {
        throw new Error("review to update not found.");
      }

      // if (existingReview) {
      //   // Swap serials if another review already has the newSerial
      //   await ReviewModel.findByIdAndUpdate(existingReview._id, { review_serial: reviewToUpdate.review_serial });
      // }

      // // Update the requested review with the new serial
      // await ReviewModel.findByIdAndUpdate(requestData?._id, { review_serial: requestData?.review_serial });

      // get the review image and upload
      let review_image;
      let review_image_key;
      if (req.files && "review_image" in req.files) {
        const reviewImage = req.files["review_image"][0];
        const review_image_upload = await FileUploadHelper.uploadToSpaces(
          reviewImage
        );
        review_image = review_image_upload?.Location;
        review_image_key = review_image_upload?.Key;
      }
      const data = { ...requestData, review_image, review_image_key };
      const result: IReview | any = await ReviewService.updateReviewServices(data, requestData?._id
      );

      if (result) {
        if (requestData?.review_image_key) {
          await FileUploadHelper.deleteFromSpaces(
            requestData?.review_image_key
          );
        }
        return sendResponse<IReview>(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: "Review Updated Successfully !",
        });
      } else {
        throw new AppError(httpStatus.BAD_REQUEST, "Review Update Failed !");
      }
    } else {
      const requestData = req.body;

      // const findReviewNameExist = await ReviewModel.exists({ review_title: requestData?.review_title });
      // if (findReviewNameExist && requestData?._id !== findReviewNameExist?._id.toString()) {
      //   throw new AppError(httpStatus.BAD_REQUEST, 'Already added!');
      // }


      // Find the review that currently has the given newSerial
      const existingReview = await ReviewModel.findOne({ review_serial: requestData?.review_serial });

      // Find the review that is being updated
      const reviewToUpdate = await ReviewModel.findById(requestData?._id);

      //console.log(reviewToUpdate);


      if (!reviewToUpdate) {
        throw new Error("review to update not found.");
      }

      // if (existingReview) {
      //   // Swap serials if another review already has the newSerial
      //   await ReviewModel.findByIdAndUpdate(existingReview._id, { review_serial: reviewToUpdate.review_serial });
      // }

      // // Update the requested review with the new serial
      // await ReviewModel.findByIdAndUpdate(requestData?._id, { review_serial: requestData?.review_serial });

      const result: IReview | any = await ReviewService.updateReviewServices(requestData, requestData?._id
      );
      if (result) { // ✅ Check if result is not null
        return sendResponse<IReview>(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: "Review Updated Successfully !",
        });
      } else {
        throw new AppError(400, "Review Updated Failed !");
      }

    }
  } catch (error: any) {
    next(error);
  }
});

const deleteReviewInfo = catchAsync(async (req, res, next) => {
  try {
    const { _id } = req.params
    const result = await ReviewService.deleteReviewServices(_id);
    if (result) {
      if (req.body?.review_image_key) {
        await FileUploadHelper.deleteFromSpaces(req.body?.review_image_key);
      }
      return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Review deleted successfully !",
      });
    } else {
      throw new AppError(400, "Review delete failed !");
    }
  } catch (error: any) {
    next(error);
  }
});

export const ReviewController = {
  createReview,
  findReviews,
  findAllDashboardReviews,
  findReviewsByProductId,
  updateReview,
  deleteReviewInfo
};