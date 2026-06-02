import mongoose, { Schema } from 'mongoose';
import { IAddress } from './address.interface';


// Main schema for IAddress
const AddressSchema = new mongoose.Schema<IAddress>(
    {
        address_name: { type: String },
        address_phone: { type: String },
        address_email: { type: String },
        address_district: { type: String },
        address_area: { type: String },
        address_address: { type: String },
        address_floor: { type: String },
        address_apartment: { type: String },
        address_lat: { type: String },
        address_long: { type: String },
        address_status: {
            type: String,
            enum: ['active', 'in-active'],
            default: 'active',
        },
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "users",
        }
    },
    {
        timestamps: true,
    }
);

export const AddressModel = mongoose.model<IAddress>('addresses', AddressSchema);
