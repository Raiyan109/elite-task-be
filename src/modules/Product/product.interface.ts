import { Types } from "mongoose";
import { ICategoryInterface } from "../Category/category.interface";
import { ISubcategoryInterface } from "../Subcategory/subcategory.interface";
import { IChildcategoryInterface } from "../Childcategory/childcategory.interface";
import { IAdminInterface } from "../Admin/admin.interface";
import { IBrand } from "../Brand/brand.interface";

export interface additionalImagesArray {
  additional_image?: string;
  additional_image_key?: string;
}

export interface metakeywordssArray {
  keyword?: string;
}

export interface IProductInterface {
  _id?: any;
  product_name: string;
  product_slug: string;
  product_sku?: string;
  product_status: "active" | "in-active" | "temporary-in-active";
  product_inactivity_start?: string;
  product_inactivity_end?: string;
  category_id: Types.ObjectId | ICategoryInterface;
  subcategory_id?: Types.ObjectId | ISubcategoryInterface;
  childcategory_id?: Types.ObjectId | IChildcategoryInterface;
  product_barcode?: string;
  product_barcode_image?: string;
  description: string;
  thumbnail_image: string;
  thumbnail_image_key?: string;
  additional_images?: additionalImagesArray[];
  product_price?: number;
  product_buying_price?: number;
  product_discount_price?: number | undefined | null;
  product_quantity?: number | undefined | null;
  product_alert_quantity?: number;
  product_warrenty?: string;
  product_return?: string;
  unit?: string;
  unit_quantity?: number;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: metakeywordssArray[];
  product_delivery_time?: string;
  product_is_delivery_dhaka_only?: boolean;
  popular_product_show?: boolean;
  bestselling_product_show?: boolean;

  product_order_count?: number;

  offered_product_show?: boolean;
  product_publisher_id?: Types.ObjectId | IAdminInterface;
  product_updated_by?: Types.ObjectId | IAdminInterface;

  video_url?: string;
  // is_flat_discount_show?: boolean;
  // is_percent_discount_show?: boolean;
  discount_show: ""; //'flat' | 'percent'
  brand_id?: Types.ObjectId | IBrand;


  pharmacy_section_1_show?: boolean;
  pharmacy_section_2_show?: boolean;
  pharmacy_section_3_show?: boolean;
  pharmacy_section_4_show?: boolean;
  pharmacy_section_5_show?: boolean;
  pharmacy_section_6_show?: boolean;


  skincare_section_1_show?: boolean;
  skincare_section_2_show?: boolean;
  skincare_section_3_show?: boolean;
  skincare_section_4_show?: boolean;
  skincare_section_5_show?: boolean;
  skincare_section_6_show?: boolean;


  fashion_section_1_show?: boolean;
  fashion_section_2_show?: boolean;
  fashion_section_3_show?: boolean;
  fashion_section_4_show?: boolean;
  fashion_section_5_show?: boolean;
  fashion_section_6_show?: boolean;
}

export const productSearchableField = [
  "product_name",
  "product_slug",
  "product_status",
  "description",
  "unit",
  "meta_title",
  "meta_description",
  "meta_keywords",
];
