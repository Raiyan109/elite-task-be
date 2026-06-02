// import { NextFunction, Request, Response } from "express";
// import bkashConfig from "../config/bkashConfig.json";


// import httpStatus from 'http-status'
// import sendResponse from "./sendResponse";
// import tokenHeaders from '../config/tokenHeaders'
// import { setGlobalIdToken } from "../config/setGlobaIdToken";

// const grantToken = async (req: Request, res: Response, next: NextFunction) => {
//     console.log("Grant Token API Start !!");
//     try {
//         const tokenResponse = await fetch(bkashConfig.grant_token_url, {
//             method: "POST",
//             headers: tokenHeaders(),
//             body: JSON.stringify({
//                 app_key: bkashConfig.app_key,
//                 app_secret: bkashConfig.app_secret,
//             }),
//         });
//         const tokenResult = await tokenResponse.json();

//         setGlobalIdToken(tokenResult?.id_token);

//         next();
//     } catch (e) {
//         return sendResponse(res, {
//             success: true,
//             statusCode: httpStatus.UNAUTHORIZED,
//             message: "You are not authorized to access this resource",
//             // data: result,
//         });
//     }
// };

// export default grantToken;