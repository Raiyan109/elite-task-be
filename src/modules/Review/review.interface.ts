import { Types } from "mongoose";
import { IUserInterface } from "../User/user.interface";
import { IProductInterface } from "../Product/product.interface";
import { ICombo } from "../Combo/combo.interface";

export type IReview = {
  review_comment?: string;
  review_rating: number;
  review_status: "active" | "in-active";
  review_user_id?: Types.ObjectId | IUserInterface;
  review_product_id?: Types.ObjectId | IProductInterface;
  review_combo_id?: Types.ObjectId | ICombo;
};

export const reviewSearchableField = [
    'order_id'
]