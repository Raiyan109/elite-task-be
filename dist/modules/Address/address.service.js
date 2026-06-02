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
exports.AddressServices = exports.deleteAddressService = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const address_model_1 = require("./address.model");
// Create Address
const postAddressService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield address_model_1.AddressModel.create(payload);
    return result;
});
//get Address info
const getAddressService = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield address_model_1.AddressModel.find().populate('user_id');
    return result;
});
// update Address info
const updateAddressService = (AddressId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield address_model_1.AddressModel.findByIdAndUpdate({ _id: AddressId }, payload, {
        new: true, // returns the updated doc
        runValidators: true,
    });
    return result;
});
// delete Address info
const deleteAddressService = (_id) => __awaiter(void 0, void 0, void 0, function* () {
    const AddressInfo = yield address_model_1.AddressModel.findById({ _id: _id });
    if (!AddressInfo) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Address does not exist!');
    }
    const result = yield address_model_1.AddressModel.findByIdAndDelete({ _id: _id });
    return result;
});
exports.deleteAddressService = deleteAddressService;
// find addresses by user id
const findAddressesByUserIdServices = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    const addresses = yield address_model_1.AddressModel.find({ user_id }).populate('user_id').lean();
    const totalAddresses = addresses.length;
    return {
        totalAddresses,
        addresses,
    };
});
exports.AddressServices = {
    postAddressService,
    getAddressService,
    updateAddressService,
    deleteAddressService: exports.deleteAddressService,
    findAddressesByUserIdServices
};
