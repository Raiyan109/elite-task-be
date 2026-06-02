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
exports.SendPhoneOTP = void 0;
const axios_1 = __importDefault(require("axios"));
const SendPhoneOTP = (otp, number) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const response = yield axios_1.default.get(`https://sms.rapidsms.xyz/request.php?user_id=tushar&password=tushar10840&number=${number}&message=Your Otp Is %20<b><u>${otp}</u></b>`);
        if (((_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.status) == "success") {
            console.log("OTP sent successfully", response === null || response === void 0 ? void 0 : response.data);
            return true;
        }
        else {
            return false;
        }
    }
    catch (error) {
        return false;
    }
});
exports.SendPhoneOTP = SendPhoneOTP;
