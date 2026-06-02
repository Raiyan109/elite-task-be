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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchServices = void 0;
const search_model_1 = require("./search.model");
// POST: Create a new search entry
const postSearchService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield search_model_1.SearchModel.create(payload);
    return result;
});
// GET: Retrieve all search history by user
const getSearchesByUserService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield search_model_1.SearchModel.find({ user_id: userId }).sort({ searchedAt: -1 });
    return result;
});
exports.SearchServices = {
    postSearchService,
    getSearchesByUserService,
};
