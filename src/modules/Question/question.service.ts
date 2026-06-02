import httpStatus from 'http-status';
import { IQuestion } from './question.interface';
import { QuestionModel } from './question.model';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';


// Create Questions
const createQuestionServices = async (question: IQuestion) => {
  // const isQuestionExists = await QuestionModel.findOne({ name: question.question_name })
  // if (isQuestionExists) {
  //   throw new AppError(httpStatus.CONFLICT, 'This question is already exists!');
  // }

  // (Logic will go here) User can question any product only if he ordered and purchased it

  const result = await QuestionModel.create(question)
  return result
};

// Find Questions
const findQuestionsServices = async (queryParams: Record<string, unknown>) => {
  const modelQuery = QuestionModel.find({ question_status: "active" }).sort({ createdAt: -1 })

  const query = new QueryBuilder(modelQuery, queryParams)
    .search(['question_name', 'question_answer']) // Provide searchable fields
    // .filter()
    .sort()
    .paginate()
  // .fields();

  const result = await query.modelQuery; // Execute the query
  // const result = await query.modelQuery.sort({ sequence: 1 }); // Execute the query
  return result;
};

// find all dashboard Questions
export const findAllDashboardQuestionServices = async (queryParams: Record<string, unknown>) => {
  const modelQuery = QuestionModel.find().sort({ question_serial: 1 })
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

  const query = new QueryBuilder(modelQuery, queryParams)
    .search(['question_name']) // Provide searchable fields
    // .filter()
    .sort()
    .paginate()
  // .fields();

  const totalCount = await QuestionModel.countDocuments(query.modelQuery.getFilter());

  const result = await query.modelQuery; // Execute the query
  return { result, totalCount };
};

// find questions by product id
const findQuestionsByProductIdServices = async (question_product_id: string) => {
  const questions = await QuestionModel.find({ question_product_id, question_status: 'active' }).populate('question_user_id question_product_id').lean();

  const totalQuestions = questions.length;

  return {
    totalQuestions,
    questions,
  };
};

// Update Questions
const updateQuestionServices = async (question: IQuestion, _id: string): Promise<IQuestion | any> => {
  const updateQuestionInfo = await QuestionModel.findOne({ _id: _id });
  if (!updateQuestionInfo) {
    return {};
  }
  const Qustion = await QuestionModel.findByIdAndUpdate({ _id: _id },
    { $set: question }, // ✅ This ensures only provided fields are updated
    { new: true, runValidators: true, context: "query" }
  );
  return Qustion;
};

// Delete a Question
export const deleteQuestionServices = async (_id: string): Promise<IQuestion | any> => {
  const updateQuestionInfo = await QuestionModel.findOne({ _id: _id });
  if (!updateQuestionInfo) {
    throw new AppError(httpStatus.NOT_FOUND, 'Question does not exist!');
  }
  const Question = await QuestionModel.findByIdAndDelete({ _id: _id }
  );
  return Question;
};

export const QuestionService = {
  createQuestionServices,
  findQuestionsServices,
  updateQuestionServices,
  findAllDashboardQuestionServices,
  findQuestionsByProductIdServices,
  deleteQuestionServices
};