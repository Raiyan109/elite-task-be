"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createToken = (jwtPayload, secret) => {
    return jsonwebtoken_1.default.sign(jwtPayload, secret);
};
exports.createToken = createToken;
// export const createToken = (
//     jwtPayload: { _id?: string; user_phone?: string; user_email?: string; roleId?: ObjectId | IRole | undefined; },
//     secret: string,
//     // expiresIn: string | number,
//     //expiresIn: SignOptions['expiresIn']
// ) => {
//     // const signOptions: SignOptions = {
//     //     expiresIn, // now it's typed correctly
//     //   };
//     // return jwt.sign(jwtPayload, secret, {
//     //     expiresIn: expiresIn as string | number,
//     // });
//     return jwt.sign(jwtPayload, secret, /*signOptions*/);
// };
