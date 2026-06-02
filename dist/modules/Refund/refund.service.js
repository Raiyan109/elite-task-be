"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundServices = void 0;
const refund_model_1 = require("./refund.model");
const refund_interface_1 = require("./refund.interface");
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const user_model_1 = __importDefault(require("../User/user.model"));
const createRefundService = (refundData) => __awaiter(void 0, void 0, void 0, function* () {
    const existingRefund = yield refund_model_1.RefundModel.findOne({ order_id: refundData.order_id });
    if (existingRefund) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Refund request already exists for this order');
    }
    const result = yield refund_model_1.RefundModel.create(refundData);
    return result;
});
const findAllDashboardRefundsService = (limit, skip, searchTerm) => __awaiter(void 0, void 0, void 0, function* () {
    const matchingUsers = yield user_model_1.default.find({
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
            $or: refund_interface_1.refundSearchableField.map((field) => ({
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
    const refunds = yield refund_model_1.RefundModel.find(whereCondition).populate('user_id')
        .skip(skip)
        .limit(limit);
    return refunds;
});
const findRefundByIdService = (id, limit, skip) => __awaiter(void 0, void 0, void 0, function* () {
    const refunds = yield refund_model_1.RefundModel.find({ user_id: id })
        .sort({ createdAt: -1 })
        .populate('user_id')
        .skip(skip)
        .limit(limit);
    const total = yield refund_model_1.RefundModel.countDocuments({ user_id: id });
    return {
        data: refunds,
        total,
        page: Math.floor(skip / limit) + 1,
        limit
    };
});
const findRefundByOrderIdService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const refund = yield refund_model_1.RefundModel.findOne({ order_id: id }).populate('user_id');
    if (!refund) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Refund not found');
    }
    return refund;
});
const updateRefundService = (id, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    const refund = yield refund_model_1.RefundModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!refund) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Refund not found');
    }
    if (updateData.refund_status === 'approved' && updateData.refund_amount) {
        const user = yield user_model_1.default.findByIdAndUpdate(refund.user_id, { $inc: { user_wallet_amount: updateData.refund_amount } }, { new: true });
        if (!user) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
        }
    }
    return refund;
});
const deleteRefundService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const refund = yield refund_model_1.RefundModel.findByIdAndDelete(id);
    if (!refund) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Refund not found');
    }
    return refund;
});
exports.RefundServices = {
    createRefundService,
    findAllDashboardRefundsService,
    findRefundByIdService,
    updateRefundService,
    deleteRefundService,
    findRefundByOrderIdService,
};
