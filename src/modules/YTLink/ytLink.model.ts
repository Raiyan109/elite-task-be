import mongoose, { Schema } from 'mongoose';
import { IYTLink } from './ytLink.interface';

const YTLinkSchema = new mongoose.Schema<IYTLink>(
  {
    ytLink_link: {
      type: String,
      required: true,
    },
    ytLink_serial: {
      type: Number,
      required: true,
    },
    ytLink_status: {
      type: String,
      enum: ['active', 'in-active'],
      default: 'active',
      required: true,
    },
    ytLink_publisher_id: {
      type: Schema.Types.ObjectId,
      ref: 'admins',
    },
    ytLink_updated_by: {
      type: Schema.Types.ObjectId,
      ref: 'admins',
    },
    category_type: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const YTLinkModel = mongoose.model<IYTLink>('ytlinks', YTLinkSchema);
