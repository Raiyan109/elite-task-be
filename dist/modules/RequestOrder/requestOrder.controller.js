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
exports.removeFromRequestOrder = exports.updateRequestOrderByAdmin = exports.updateRequestOrder = exports.getRequestOrderDashboard = exports.getRequestOrder = exports.postRequestOrder = void 0;
const http_status_1 = __importDefault(require("http-status"));
const requestOrder_service_1 = require("./requestOrder.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
// POST
const postRequestOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const requestOrderBody = Object.assign(Object.assign({}, req.body), { user_id: userId });
    const result = yield requestOrder_service_1.RequestOrderServices.postRequestOrderService(requestOrderBody);
    return (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: 'Product added to requestOrder',
        data: result,
    });
});
exports.postRequestOrder = postRequestOrder;
// GET
const getRequestOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const result = yield requestOrder_service_1.RequestOrderServices.getRequestOrderService(userId);
    return (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'RequestOrder fetched successfully',
        data: result,
    });
});
exports.getRequestOrder = getRequestOrder;
// GET dashboard
const getRequestOrderDashboard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const result = yield requestOrder_service_1.RequestOrderServices.getRequestOrderDashboardService(userId);
    return (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'RequestOrder for dashboard fetched successfully',
        data: result,
    });
});
exports.getRequestOrderDashboard = getRequestOrderDashboard;
// UPDATE
const updateRequestOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const product_id = req.params.product_id;
    const updatedData = req.body;
    const result = yield requestOrder_service_1.RequestOrderServices.updateRequestOrderService(product_id, updatedData);
    return (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'RequestOrder updated successfully',
        data: result,
    });
});
exports.updateRequestOrder = updateRequestOrder;
// update by admin
const updateRequestOrderByAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = req.body;
        const result = yield requestOrder_service_1.RequestOrderServices.updateRequestOrderByAdminService(payload);
        res.status(http_status_1.default.OK).json({
            success: true,
            message: "Request Order updated successfully",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateRequestOrderByAdmin = updateRequestOrderByAdmin;
// Remove
const removeFromRequestOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const productId = req.params.product_id;
    console.log(req.params, 'req.params from removeFromRequestOrder');
    console.log(productId, 'productId from removeFromRequestOrder');
    const result = yield requestOrder_service_1.RequestOrderServices.removeFromRequestOrderService(userId, productId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Product removed from requestOrder',
        data: result,
    });
});
exports.removeFromRequestOrder = removeFromRequestOrder;
