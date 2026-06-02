import mongoose, { Schema } from 'mongoose';
import { IQuestion } from './question.interface';

const QuestionSchema = new mongoose.Schema<IQuestion>(
  {
    question_user_id: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
    question_product_id: {
      type: Schema.Types.ObjectId,
      ref: 'products',
    },
    question_combo_id: {
      type: Schema.Types.ObjectId,
      ref: 'combos',
    },
    question_name: {
      type: String,
      required: true,
    },
    question_answer: {
      type: String,
    },
    question_isAnswered: {
      type: Boolean,
      required: true,
      default: false,
    },
    question_answered_by: {
      type: Schema.Types.ObjectId,
      ref: 'admins',
    },
    question_status: {
      type: String,
      required: true,
      enum: ['active', 'in-active'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

export const QuestionModel = mongoose.model<IQuestion>('questions', QuestionSchema);
