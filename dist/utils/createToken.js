"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createToken = (jwtPayload, secret) => {
    // const signOptions: SignOptions = {
    //     expiresIn, // now it's typed correctly
    //   };
    // return jwt.sign(jwtPayload, secret, {
    //     expiresIn: expiresIn as string | number,
    // });
    return jsonwebtoken_1.default.sign(jwtPayload, secret);
};
exports.createToken = createToken;
