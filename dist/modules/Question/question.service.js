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
exports.QuestionService = exports.deleteQuestionServices = exports.findAllDashboardQuestionServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const question_model_1 = require("./question.model");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
// Create Questions
const createQuestionServices = (question) => __awaiter(void 0, void 0, void 0, function* () {
    // const isQuestionExists = await QuestionModel.findOne({ name: question.question_name })
    // if (isQuestionExists) {
    //   throw new AppError(httpStatus.CONFLICT, 'This question is already exists!');
    // }
    // (Logic will go here) User can question any product only if he ordered and purchased it
    const result = yield question_model_1.QuestionModel.create(question);
    return result;
});
// Find Questions
const findQuestionsServices = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    const modelQuery = question_model_1.QuestionModel.find({ question_status: "active" }).sort({ createdAt: -1 });
    const query = new QueryBuilder_1.default(modelQuery, queryParams)
        .search(['question_name', 'question_answer']) // Provide searchable fields
        // .filter()
        .sort()
        .paginate();
    // .fields();
    const result = yield query.modelQuery; // Execute the query
    // const result = await query.modelQuery.sort({ sequence: 1 }); // Execute the query
    return result;
});
// find all dashboard Questions
const findAllDashboardQuestionServices = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    const modelQuery = question_model_1.QuestionModel.find().sort({ question_serial: 1 })
        .populate({
        path: 'question_user_id',
        select: '_id user_phone'
    })
        .populate({
        path: 'question_product_id',
        select: '_id product_name thumbnail_image'
    })
        .populate({
        path: 'question_answered_by',
        select: '_id admin_name'
    });
    const query = new QueryBuilder_1.default(modelQuery, queryParams)
        .search(['question_name']) // Provide searchable fields
        // .filter()
        .sort()
        .paginate();
    // .fields();
    const totalCount = yield question_model_1.QuestionModel.countDocuments(query.modelQuery.getFilter());
    const result = yield query.modelQuery; // Execute the query
    return { result, totalCount };
});
exports.findAllDashboardQuestionServices = findAllDashboardQuestionServices;
// find questions by product id
const findQuestionsByProductIdServices = (question_product_id) => __awaiter(void 0, void 0, void 0, function* () {
    const questions = yield question_model_1.QuestionModel.find({ question_product_id, question_status: 'active' }).populate('question_user_id question_product_id').lean();
    const totalQuestions = questions.length;
    return {
        totalQuestions,
        questions,
    };
});
// Update Questions
const updateQuestionServices = (question, _id) => __awaiter(void 0, void 0, void 0, function* () {
    const updateQuestionInfo = yield question_model_1.QuestionModel.findOne({ _id: _id });
    if (!updateQuestionInfo) {
        return {};
    }
    const Qustion = yield question_model_1.QuestionModel.findByIdAndUpdate({ _id: _id }, { $set: question }, // ✅ This ensures only provided fields are updated
    { new: true, runValidators: true, context: "query" });
    return Qustion;
});
// Delete a Question
const deleteQuestionServices = (_id) => __awaiter(void 0, void 0, void 0, function* () {
    const updateQuestionInfo = yield question_model_1.QuestionModel.findOne({ _id: _id });
    if (!updateQuestionInfo) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Question does not exist!');
    }
    const Question = yield question_model_1.QuestionModel.findByIdAndDelete({ _id: _id });
    return Question;
});
exports.deleteQuestionServices = deleteQuestionServices;
exports.QuestionService = {
    createQuestionServices,
    findQuestionsServices,
    updateQuestionServices,
    findAllDashboardQuestionServices: exports.findAllDashboardQuestionServices,
    findQuestionsByProductIdServices,
    deleteQuestionServices: exports.deleteQuestionServices
};
