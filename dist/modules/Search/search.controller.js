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
exports.getSearchesByUser = exports.postSearch = void 0;
const http_status_1 = __importDefault(require("http-status"));
const search_service_1 = require("./search.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
// POST: Create a new search
const postSearch = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    console.log(user, 'user from search controller');
    const payload = Object.assign(Object.assign({}, req.body), { user_id: user._id });
    const result = yield search_service_1.SearchServices.postSearchService(payload);
    return (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: 'Search entry created successfully',
        data: result,
    });
});
exports.postSearch = postSearch;
// GET: Get search history for a user
const getSearchesByUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id } = req.params;
    const result = yield search_service_1.SearchServices.getSearchesByUserService(user_id);
    return (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Search history fetched successfully',
        data: result,
    });
});
exports.getSearchesByUser = getSearchesByUser;
