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
exports.QuestionController = void 0;
const question_service_1 = require("./question.service");
const question_model_1 = require("./question.model");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const createQuestion = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requestData = req.body;
        const userId = req.user._id;
        const question = requestData === null || requestData === void 0 ? void 0 : requestData.question_name;
        const findQuestionNameExist = yield question_model_1.QuestionModel.exists({ question });
        console.log(userId, 'userId from question controller');
        // // Get the highest question_serial
        // const lastQuestion = await QuestionModel.findOne().sort({ question_serial: -1 });
        // // Determine the new question_serial
        // const newQuestionSerial = lastQuestion ? lastQuestion.question_serial + 1 : 1;
        const data = Object.assign(Object.assign({}, requestData), { question_user_id: userId });
        const result = yield question_service_1.QuestionService.createQuestionServices(data);
        if (result) {
            return (0, sendResponse_1.default)(res, {
                success: true,
                statusCode: http_status_1.default.OK,
                message: "Question Added Successfully !",
                data: result
            });
        }
        else {
            throw new AppError_1.default(400, "Question Added Failed !");
        }
    }
    catch (error) {
        next(error);
    }
}));
const findQuestions = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield question_service_1.QuestionService.findQuestionsServices(query);
    // Check if the database collection is empty or no matching data is found
    if (!result || result.length === 0) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.NOT_FOUND,
            message: 'No data found.',
            data: [],
        });
    }
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Questions retrieved successfully',
        data: result,
    });
}));
const findAllDashboardQuestions = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const { result, totalCount } = yield question_service_1.QuestionService.findAllDashboardQuestionServices(query);
    // Check if the database collection is empty or no matching data is found
    // if (!result || result.length === 0) {
    //   return sendResponse(res, {
    //     success: false,
    //     statusCode: httpStatus.NOT_FOUND,
    //     message: 'No data found.',
    //     data: [],
    //   });
    // }
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Dashboard questions retrieved successfully',
        data: result,
        totalData: totalCount
    });
}));
// Question by product id
const findQuestionByProductId = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { question_product_id } = req.params;
    const result = yield question_service_1.QuestionService.findQuestionsByProductIdServices(question_product_id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Question by product id retrieved successfully',
        data: result,
    });
}));
const updateQuestion = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const updateData = req.body;
    const adminId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { _id, question_answer } = updateData;
    if (question_answer) {
        updateData.question_isAnswered = true;
        updateData.question_answered_by = adminId;
    }
    const updatedQuestion = yield question_service_1.QuestionService.updateQuestionServices(updateData, _id);
    if (!updatedQuestion || Object.keys(updatedQuestion).length === 0) {
        return (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_1.default.NO_CONTENT,
            message: 'No data found.',
            data: [],
        });
    }
    if (updatedQuestion) {
        if ((_b = req.body) === null || _b === void 0 ? void 0 : _b.question_image_key) {
            yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces((_c = req.body) === null || _c === void 0 ? void 0 : _c.question_image_key);
        }
        (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_1.default.OK,
            message: 'Questions updated successfully',
            data: updatedQuestion,
        });
    }
    else {
        throw new AppError_1.default(400, "Question update failed !");
    }
}));
const deleteQuestionInfo = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { _id } = req.params;
        const result = yield question_service_1.QuestionService.deleteQuestionServices(_id);
        if (result) {
            if ((_a = req.body) === null || _a === void 0 ? void 0 : _a.question_image_key) {
                yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces((_b = req.body) === null || _b === void 0 ? void 0 : _b.question_image_key);
            }
            return (0, sendResponse_1.default)(res, {
                statusCode: http_status_1.default.OK,
                success: true,
                message: "Question deleted successfully !",
            });
        }
        else {
            throw new AppError_1.default(400, "Question delete failed !");
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.QuestionController = {
    createQuestion,
    findQuestions,
    findAllDashboardQuestions,
    findQuestionByProductId,
    updateQuestion,
    deleteQuestionInfo
};
