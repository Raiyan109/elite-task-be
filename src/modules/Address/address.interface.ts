import { Types } from "mongoose";


export interface IAddress {
    address_name?: string;
    address_phone?: string;
    address_email?: string;
    address_district?: string;
    address_area?: string;
    address_address?: string;
    address_floor?: string;
    address_apartment?: string;
    address_lat?: string;
    address_long?: string;
    address_status?: string;
    user_id: Types.ObjectId;
}