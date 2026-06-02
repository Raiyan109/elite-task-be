import mongoose, { Schema } from 'mongoose';
import { ISearch } from './search.interface';

const SearchSchema = new mongoose.Schema<ISearch>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        searchTerm: {
            type: String,
            required: true,
        },
        searchedAt: {
            type: Date,
            required: true,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

export const SearchModel = mongoose.model<ISearch>('searches', SearchSchema);
