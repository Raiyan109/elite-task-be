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
exports.generateQRCode = exports.deleteAllFilesInDirectory = void 0;
exports.generateRandomString = generateRandomString;
exports.generateUniqueSlug = generateUniqueSlug;
const product_model_1 = __importDefault(require("./product.model"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Function to delete all files in the upload folder
const deleteAllFilesInDirectory = (directoryPath) => {
    fs_1.default.readdir(directoryPath, (err, files) => {
        if (err) {
            // console.error("Error reading the upload directory:", err);
            return;
        }
        // Loop over each file in the directory
        files.forEach((file) => {
            const filePath = path_1.default.join(directoryPath, file);
            fs_1.default.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                    // console.error(`Error deleting file ${file}:`, unlinkErr);
                }
                else {
                    // console.log(`File deleted: ${file}`);
                }
            });
        });
    });
};
exports.deleteAllFilesInDirectory = deleteAllFilesInDirectory;
const generateQRCode = () => __awaiter(void 0, void 0, void 0, function* () {
    let isUnique = false;
    let uniqueBarcode;
    while (!isUnique) {
        // Generate a random alphanumeric string of length 8
        uniqueBarcode = Array.from({ length: 8 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(Math.floor(Math.random() * 62))).join("");
        // Check if the generated barcode is unique in the database
        const existingOrder = yield product_model_1.default.findOne({
            barcode: uniqueBarcode,
        });
        // If no existing order found, mark the barcode as unique
        if (!existingOrder) {
            isUnique = true;
        }
    }
    return uniqueBarcode;
});
exports.generateQRCode = generateQRCode;
// Helper function to generate a random string
function generateRandomString(length) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
// Function to generate a unique slug
function generateUniqueSlug(productName) {
    return __awaiter(this, void 0, void 0, function* () {
        const sanitizedProductName = productName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        let uniqueSlug = `${sanitizedProductName}-${generateRandomString(5)}`;
        let slugExists = yield product_model_1.default.findOne({ product_slug: uniqueSlug });
        while (slugExists) {
            uniqueSlug = `${sanitizedProductName}-${generateRandomString(5)}`;
            slugExists = yield product_model_1.default.findOne({ product_slug: uniqueSlug });
        }
        return uniqueSlug;
    });
}
