"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSettingsModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const WebSettingsSchema = new mongoose_1.default.Schema({
    title: { type: String },
    favicon: { type: String },
    favicon_key: { type: String },
    logo: { type: String },
    logo_key: { type: String },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    app_link_playstore: { type: String },
    app_link_ios: { type: String },
    facebook_link: { type: String },
    instagram_link: { type: String },
    twitter_link: { type: String },
    youtube_link: { type: String },
    whatsapp_link: { type: String },
    grocery_dynamic_section_name: { type: String },
    welcome_message: { type: String },
    privacy_policy: { type: String },
    terms: { type: String },
    demand_charge: { type: Number },
    delivery_charge: { type: Number },
    vat: { type: Number }, // percent
    upper_nav: { type: [String] },
}, {
    timestamps: true,
});
exports.WebSettingsModel = mongoose_1.default.model('webSettings', WebSettingsSchema);
