import { RefundModel } from './refund.model';
import { IRefund, refundSearchableField } from './refund.interface';
import { Types } from 'mongoose';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import userModel from '../User/user.model';


const createRefundService = async (refundData: IRefund) => {
    const existingRefund = await RefundModel.findOne({ order_id: refundData.order_id });
    if (existingRefund) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Refund request already exists for this order');
    }
    const result = await RefundModel.create(refundData);
    return result;
};

const findAllDashboardRefundsService = async (limit: number, skip: number, searchTerm: string) => {
    const matchingUsers = await userModel.find({
        $or: [
            { user_first_name: { $regex: searchTerm, $options: 'i' } },
            { user_last_name: { $regex: searchTerm, $options: 'i' } },
            { user_email: { $regex: searchTerm, $options: 'i' } },
            { user_phone: { $regex: searchTerm, $options: 'i' } },
        ]
    }).select('_id');
    const userIds = matchingUsers.map(user => user._id);

    const andCondition = [];

    if (searchTerm) {
        andCondition.push({
            $or: refundSearchableField.map((field) => ({
                [field]: {
                    $regex: searchTerm,
                    $options: "i",
                },
            })),
            // $or: [
            //     { order_id: { $regex: searchTerm, $options: 'i' } },
            //     { user_id: { $in: userIds } },
            // ],
        });
    }
    const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};
    const refunds = await RefundModel.find(whereCondition).populate('user_id')
        .skip(skip)
        .limit(limit)


    return refunds;
};

const findRefundByIdService = async (id: string, limit: number, skip: number) => {
    const refunds = await RefundModel.find({ user_id: id })
        .sort({ createdAt: -1 })
        .populate('user_id')
        .skip(skip)
        .limit(limit)

    const total = await RefundModel.countDocuments({ user_id: id });

    return {
        data: refunds,
        total,
        page: Math.floor(skip / limit) + 1,
        limit
    };
};

const findRefundByOrderIdService = async (id: string) => {
    const refund = await RefundModel.findOne({ order_id: id }).populate('user_id');
    if (!refund) {
        throw new AppError(httpStatus.NOT_FOUND, 'Refund not found');
    }
    return refund;
};

const updateRefundService = async (id: string, updateData: Partial<IRefund>) => {
    const refund = await RefundModel.findByIdAndUpdate(id, updateData, { new: true });

    if (!refund) {
        throw new AppError(httpStatus.NOT_FOUND, 'Refund not found');
    }

    if (updateData.refund_status === 'approved' && updateData.refund_amount) {
        const user = await userModel.findByIdAndUpdate(refund.user_id,
            { $inc: { user_wallet_amount: updateData.refund_amount } },
            { new: true }
        )

        if (!user) {
            throw new AppError(httpStatus.NOT_FOUND, 'User not found');
        }
    }

    return refund;
};

const deleteRefundService = async (id: string) => {
    const refund = await RefundModel.findByIdAndDelete(id);
    if (!refund) {
        throw new AppError(httpStatus.NOT_FOUND, 'Refund not found');
    }
    return refund;
};

export const RefundServices = {
    createRefundService,
    findAllDashboardRefundsService,
    findRefundByIdService,
    updateRefundService,
    deleteRefundService,
    findRefundByOrderIdService,
};
