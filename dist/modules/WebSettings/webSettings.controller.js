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
exports.WebSettingsController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const webSettings_services_1 = require("./webSettings.services");
const createSettings = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.files || !("logo" in req.files) || !("favicon" in req.files)) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: 'Logo and favicon are required',
        });
    }
    let logo, logo_key;
    let favicon, favicon_key;
    try {
        const logoImage = req.files["logo"][0];
        const faviconImage = req.files["favicon"][0];
        const logoUpload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(logoImage);
        if (logoUpload) {
            logo = logoUpload === null || logoUpload === void 0 ? void 0 : logoUpload.Location;
            logo_key = logoUpload === null || logoUpload === void 0 ? void 0 : logoUpload.Key;
        }
        const faviconUpload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(faviconImage);
        if (faviconUpload) {
            favicon = faviconUpload.Location;
            favicon_key = faviconUpload.Key;
        }
        const settingsData = Object.assign(Object.assign({}, req.body), { favicon, favicon_key, logo, logo_key });
        const result = yield webSettings_services_1.WebSettingsService.createSettingsServices(settingsData);
        return (0, sendResponse_1.default)(res, {
            success: true,
            statusCode: http_status_1.default.OK,
            message: "Settings created successfully",
            data: result,
        });
    }
    catch (error) {
        console.error("Error uploading files:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
}));
const getSettings = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield webSettings_services_1.WebSettingsService.getSettingsServices();
    // Check if the database collection is empty or no matching data is found
    if (!result) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.NOT_FOUND,
            message: 'No data found.',
            data: [],
        });
    }
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Settings retrieved successfully',
        data: result,
    });
}));
const updateSettings = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch existing settings from DB to get old image keys
    const existingSettings = yield webSettings_services_1.WebSettingsService.getSettingsServices();
    // Default values if settings don't exist
    let logo = (existingSettings === null || existingSettings === void 0 ? void 0 : existingSettings.logo) || "";
    let logo_key = (existingSettings === null || existingSettings === void 0 ? void 0 : existingSettings.logo_key) || "";
    let favicon = (existingSettings === null || existingSettings === void 0 ? void 0 : existingSettings.favicon) || "";
    let favicon_key = (existingSettings === null || existingSettings === void 0 ? void 0 : existingSettings.favicon_key) || "";
    try {
        if (req.files && "logo" in req.files) {
            const logoImage = req.files["logo"][0];
            // Delete old logo from Spaces if it exists
            if (logo_key) {
                console.log("Deleting old logo from DigitalOcean Spaces...");
                yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces(logo_key);
            }
            // Upload new logo
            console.log("Uploading new logo...");
            const logoUpload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(logoImage);
            if (logoUpload) {
                logo = logoUpload === null || logoUpload === void 0 ? void 0 : logoUpload.Location;
                logo_key = logoUpload === null || logoUpload === void 0 ? void 0 : logoUpload.Key;
            }
        }
        if (req.files && "favicon" in req.files) {
            const faviconImage = req.files["favicon"][0];
            // Delete old favicon from Spaces if it exists
            if (favicon_key) {
                console.log("Deleting old favicon from DigitalOcean Spaces...");
                yield FileUploadHelper_1.FileUploadHelper.deleteFromSpaces(favicon_key);
            }
            // Upload new favicon
            console.log("Uploading new favicon...");
            const faviconUpload = yield FileUploadHelper_1.FileUploadHelper.uploadToSpaces(faviconImage);
            if (faviconUpload) {
                favicon = faviconUpload.Location;
                favicon_key = faviconUpload.Key;
            }
        }
        // Prepare updated data
        const updatedSettingsData = Object.assign({ logo,
            logo_key,
            favicon,
            favicon_key }, req.body);
        // console.log(updatedSettingsData, 'updatedSettingsData from controller');
        const result = yield webSettings_services_1.WebSettingsService.updateSettingsServices(updatedSettingsData);
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "Settings updated successfully",
            data: result,
        });
    }
    catch (error) {
        console.error("Error updating settings:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
}));
exports.WebSettingsController = {
    createSettings,
    getSettings,
    updateSettings
};
