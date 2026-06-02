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
exports.WebSettingsService = void 0;
const AppError_1 = __importDefault(require("../../errors/AppError"));
const webSettings_model_1 = require("./webSettings.model");
const http_status_1 = __importDefault(require("http-status"));
// Create Settings
const createSettingsServices = (settings) => __awaiter(void 0, void 0, void 0, function* () {
    const isSettingsExists = yield webSettings_model_1.WebSettingsModel.findOne({ name: settings.title });
    if (isSettingsExists) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'This settings is already exists!');
    }
    const result = yield webSettings_model_1.WebSettingsModel.create(settings);
    return result;
});
// Find Settings
const getSettingsServices = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield webSettings_model_1.WebSettingsModel.find();
    return result[0];
});
// Update Settings
const updateSettingsServices = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedSettings = yield webSettings_model_1.WebSettingsModel.findOneAndUpdate({}, payload, {
        new: true,
        runValidators: true,
    });
    console.log(updatedSettings, 'updatedSettings from service');
    if (!updatedSettings) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to update settings');
    }
    return updatedSettings;
});
exports.WebSettingsService = {
    createSettingsServices,
    getSettingsServices,
    updateSettingsServices
};
