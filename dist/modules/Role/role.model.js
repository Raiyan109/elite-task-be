"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const RoleSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        enum: ["admin", "project_manager", "team_member"],
    },
    description: {
        type: String,
    },
    permissions: {
        project: {
            create: { type: Boolean, default: false },
            read: { type: Boolean, default: false },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false },
        },
        task: {
            create: { type: Boolean, default: false },
            read: { type: Boolean, default: false },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false },
            assign: { type: Boolean, default: false },
            status_change: { type: Boolean, default: false },
        },
        team: {
            add_member: { type: Boolean, default: false },
            view_members: { type: Boolean, default: false },
        },
        dashboard: {
            view: { type: Boolean, default: false },
        },
        activity_log: {
            view: { type: Boolean, default: false },
        },
    },
}, {
    timestamps: true,
});
exports.RoleModel = mongoose_1.default.model("roles", RoleSchema);
