import { NextFunction, Request, Response } from 'express';
import { QuestionService } from './question.service';
import { QuestionModel } from './question.model';
import * as fs from "fs";
import { IQuestion } from './question.interface';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { FileUploadHelper } from '../../helpers/FileUploadHelper';
import sendResponse from '../../utils/sendResponse';


const createQuestion = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestData = req.body;
    const userId = req.user._id
    const question = requestData?.question_name;
    const findQuestionNameExist = await QuestionModel.exists({ question });
    console.log(userId, 'userId from question controller');


    // // Get the highest question_serial
    // const lastQuestion = await QuestionModel.findOne().sort({ question_serial: -1 });

    // // Determine the new question_serial
    // const newQuestionSerial = lastQuestion ? lastQuestion.question_serial + 1 : 1;

    const data = { ...requestData, question_user_id: userId };

    const result = await QuestionService.createQuestionServices(data);

    if (result) {
      return sendResponse<IQuestion>(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Question Added Successfully !",
        data: result
      });
    } else {
      throw new AppError(400, "Question Added Failed !");
    }
  } catch (error: any) {
    next(error);
  }
});


const findQuestions = catchAsync(async (req, res) => {
  const query = req.query
  const result = await QuestionService.findQuestionsServices(query);

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
    message: 'Questions retrieved successfully',
    data: result,
  });
});

const findAllDashboardQuestions = catchAsync(async (req, res) => {
  const query = req.query
  const { result, totalCount } = await QuestionService.findAllDashboardQuestionServices(query);

  // Check if the database collection is empty or no matching data is found
  // if (!result || result.length === 0) {
  //   return sendResponse(res, {
  //     success: false,
  //     statusCode: httpStatus.NOT_FOUND,
  //     message: 'No data found.',
  //     data: [],
  //   });
  // }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Dashboard questions retrieved successfully',
    data: result,
    totalData: totalCount
  });
});

// Question by product id
const findQuestionByProductId = catchAsync(async (req, res) => {
  const { question_product_id } = req.params;
  const result = await QuestionService.findQuestionsByProductIdServices(question_product_id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Question by product id retrieved successfully',
    data: result,
  });

});

const updateQuestion = catchAsync(async (req, res) => {
  const updateData = req.body;
  const adminId = req?.user?._id;

  const { _id, question_answer } = updateData;

  if (question_answer) {
    updateData.question_isAnswered = true;
    updateData.question_answered_by = adminId;
  }

  const updatedQuestion = await QuestionService.updateQuestionServices(updateData, _id);

  if (!updatedQuestion || Object.keys(updatedQuestion).length === 0) {
    return sendResponse(res, {
      success: true,
      statusCode: httpStatus.NO_CONTENT,
      message: 'No data found.',
      data: [],
    });
  }

  if (updatedQuestion) {

    if (req.body?.question_image_key) {
      await FileUploadHelper.deleteFromSpaces(req.body?.question_image_key);
    }

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Questions updated successfully',
      data: updatedQuestion,
    });
  } else {
    throw new AppError(400, "Question update failed !");
  }

});

const deleteQuestionInfo = catchAsync(async (req, res, next) => {
  try {
    const { _id } = req.params
    const result = await QuestionService.deleteQuestionServices(_id);
    if (result) {
      if (req.body?.question_image_key) {
        await FileUploadHelper.deleteFromSpaces(req.body?.question_image_key);
      }
      return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Question deleted successfully !",
      });
    } else {
      throw new AppError(400, "Question delete failed !");
    }
  } catch (error: any) {
    next(error);
  }
});

export const QuestionController = {
  createQuestion,
  findQuestions,
  findAllDashboardQuestions,
  findQuestionByProductId,
  updateQuestion,
  deleteQuestionInfo
};