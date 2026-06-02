"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchRoutes = void 0;
const express_1 = __importDefault(require("express"));
const search_controller_1 = require("./search.controller");
const auth_1 = require("../../middlewares/auth");
const router = express_1.default.Router();
router
    .route("/")
    .post((0, auth_1.auth)('user'), search_controller_1.postSearch);
router.get('/:user_id', (0, auth_1.auth)('user'), search_controller_1.getSearchesByUser);
exports.SearchRoutes = router;
