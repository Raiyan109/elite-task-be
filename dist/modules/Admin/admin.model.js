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
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const index_1 = __importDefault(require("../../config/index"));
// admin Schema
const adminSchema = new mongoose_1.Schema({
    admin_password: {
        type: String,
    },
    admin_name: {
        type: String,
    },
    admin_phone: {
        type: String,
    },
    admin_address: {
        type: String,
    },
    admin_role_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "roles",
    },
    admin_profile: {
        type: String,
    },
    admin_profile_key: {
        type: String,
    },
    admin_status: {
        type: String,
        enum: ["active", "in-active"],
        default: "active",
    },
    admin_publisher_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "admins",
    },
    admin_updated_by: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "admins",
    },
}, {
    timestamps: true,
});
adminSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        if (!this.isModified('admin_password')) {
            return next();
        }
        const admin = this; // doc
        // hashing password and save into DB
        admin.admin_password = yield bcrypt_1.default.hash(admin.admin_password, Number(index_1.default.bcrypt_salt_rounds));
        next();
    });
});
// set '' after saving password
adminSchema.post('save', function (doc, next) {
    doc.admin_password = '';
    next();
});
adminSchema.statics.isAdminExistsByPhone = function (admin_phone) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield AdminModel.findOne({ admin_phone, isDeleted: { $ne: true } });
    });
};
adminSchema.statics.isPasswordMatched = function (plainTextPassword, hashedPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(plainTextPassword, hashedPassword);
    });
};
const AdminModel = (0, mongoose_1.model)("admins", adminSchema);
exports.default = AdminModel;
