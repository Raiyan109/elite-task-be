"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.FileUploadHelper = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const multer_1 = __importDefault(require("multer"));
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const AppError_1 = __importDefault(require("../errors/AppError"));
// Set up AWS configuration
const region = "ap-south-1";
const endpoint = "https://blr1.digitaloceanspaces.com";
const s3 = new client_s3_1.S3Client({
    region,
    endpoint,
    credentials: {
        accessKeyId: "DO003NGNH3Z8U72AGPHW",
        secretAccessKey: "y05jtj5lb1CGu9XxZMCYVggZSTNhaQuukluw+AuCuME",
    },
});
const SpaceName = "cit-node";
const storage = multer_1.default.diskStorage({
    destination: "uploads/",
    filename: function (req, file, cb) {
        const uniqueSuffix = (0, uuid_1.v4)();
        cb(null, uniqueSuffix + "-" + file.originalname);
    },
});
const ImageUpload = (0, multer_1.default)({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const supportedImage = /png|jpg|webp|jpeg|gif|PNG|JPG|WEBP|JPEG|GIF|pdf|PDF/; // Added gif and GIF
        const extension = path_1.default.extname(file.originalname);
        if (supportedImage.test(extension)) {
            cb(null, true);
        }
        else {
            cb(new Error("Must be a png|jpg|webp|jpeg|gif image"));
        }
    },
    limits: {
        fileSize: 5000000, // 5MB limit
    },
});
// Function to determine content type based on file extension
const getContentType = (filename) => {
    const extension = path_1.default.extname(filename).toLowerCase();
    switch (extension) {
        case ".webp":
            return "image/webp";
        case ".png":
            return "image/png";
        case ".jpg":
            return "image/jpg";
        case ".jpeg":
            return "image/jpeg";
        case ".gif":
            return "image/gif";
        case ".WEBP":
            return "image/WEBP";
        case ".PNG":
            return "image/PNG";
        case ".JPG":
            return "image/JPG";
        case ".JPEG":
            return "image/JPEG";
        case ".GIF":
            return "image/GIF";
        case ".pdf":
            return "application/pdf";
        case ".PDF":
            return "application/PDF";
        default:
            return "application/octet-stream";
    }
};
// Upload image to DigitalOcean Spaces
const uploadToSpaces = (file) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const fileStream = fs.createReadStream(file.path);
    const contentType = getContentType(file.filename);
    const uploadParams = {
        Bucket: SpaceName,
        Key: `foodplus_image/${file.filename}`,
        Body: fileStream,
        ACL: "public-read",
        ContentType: contentType,
    };
    try {
        const data = yield s3.send(new client_s3_1.PutObjectCommand(uploadParams));
        const httpStatusCode = (_a = data === null || data === void 0 ? void 0 : data.$metadata) === null || _a === void 0 ? void 0 : _a.httpStatusCode;
        const { Bucket, Key } = uploadParams;
        const Location = `https://cit-node.blr1.cdn.digitaloceanspaces.com/${Key}`;
        // const Location = `https://blr1.digitaloceanspaces.com/${Bucket}/${Key}`;
        const sendData = {
            Location,
            Key,
        };
        // Normalize the file path to ensure cross-platform compatibility
        const normalizedPath = path_1.default.normalize(file.path);
        fs.unlinkSync(normalizedPath);
        if (httpStatusCode == 200)
            return sendData;
        else
            throw new AppError_1.default(400, "Image upload failed");
    }
    catch (error) {
        throw error;
    }
});
const deleteFromSpaces = (key) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const deleteParams = {
        Bucket: SpaceName,
        Key: key,
    };
    try {
        const data = yield s3.send(new client_s3_1.DeleteObjectCommand(deleteParams));
        const httpStatusCode = (_a = data === null || data === void 0 ? void 0 : data.$metadata) === null || _a === void 0 ? void 0 : _a.httpStatusCode;
        if (httpStatusCode == 204)
            return true;
        else
            throw new AppError_1.default(400, "Image Delete failed");
    }
    catch (error) {
        throw error;
    }
});
// Initialize multer with the storage settings
const VideoUpload = (0, multer_1.default)({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const supportedVideo = /mp4/;
        const extension = path_1.default.extname(file.originalname);
        // Check if the file extension is mp4
        if (supportedVideo.test(extension)) {
            cb(null, true);
        }
        else {
            cb(new Error("Must be an MP4 video"));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB limit
    },
});
const VideoUploader = (file) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const fileStream = fs.createReadStream(file.path); // Assuming file is a multer file object
    const uploadParams = {
        Bucket: SpaceName,
        Key: `foodplus_video/${file.filename}`,
        Body: fileStream,
        ACL: "public-read",
    };
    try {
        const data = yield s3.send(new client_s3_1.PutObjectCommand(uploadParams));
        const httpStatusCode = (_a = data === null || data === void 0 ? void 0 : data.$metadata) === null || _a === void 0 ? void 0 : _a.httpStatusCode;
        const { Bucket, Key } = uploadParams;
        const Location = `https://cit-node.blr1.cdn.digitaloceanspaces.com/${Key}`;
        fs.unlinkSync(file.path);
        const sendData = {
            Location,
            Key,
        };
        if (httpStatusCode == 200)
            return sendData;
        else
            throw new AppError_1.default(400, "Image upload failed");
    }
    catch (error) {
        throw error; // Rethrow the error to handle it further up the call stack
    }
});
exports.FileUploadHelper = {
    ImageUpload,
    uploadToSpaces,
    deleteFromSpaces,
    VideoUploader,
    VideoUpload,
};
