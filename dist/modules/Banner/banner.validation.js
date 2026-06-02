"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsValidation = exports.updateSettingsSchema = exports.createSettingsSchema = void 0;
const zod_1 = require("zod");
exports.createSettingsSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    favicon: zod_1.z.string().optional(),
    logo: zod_1.z.string().optional(),
});
exports.updateSettingsSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    favicon: zod_1.z.string().optional(),
    logo: zod_1.z.string().optional(),
});
exports.SettingsValidation = {
    createSettingsSchema: exports.createSettingsSchema,
    updateSettingsSchema: exports.updateSettingsSchema
};
