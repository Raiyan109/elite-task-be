import { Types } from "mongoose";
import { IUserInterface } from "../User/user.interface";
import { IProductInterface } from "../Product/product.interface";
import { IAdminInterface } from "../Admin/admin.interface";
import { ICombo } from "../Combo/combo.interface";

export type IQuestion = {
  question_user_id?: Types.ObjectId | IUserInterface;
  question_product_id?: Types.ObjectId | IProductInterface;
  question_combo_id?: Types.ObjectId | ICombo;
  question_name: string;
  question_answer: string;
  question_isAnswered: boolean;
  question_answered_by: Types.ObjectId | IAdminInterface;
  question_status: string;
};