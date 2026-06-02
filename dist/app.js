"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const globalErrorhandler_1 = __importDefault(require("./middlewares/globalErrorhandler"));
const app = (0, express_1.default)();
//parsers
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
const corsOptions = {
    origin: [
        "http://192.168.0.169:3000",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:3001",
        "http://192.168.0.232:5173",
        "http://192.168.0.231:5173",
        "https://foodplus.classicecommerce.com",
        "https://foodplusadmin.classicecommerce.com",
        "http://192.168.0.137:5173",
        "http://192.168.0.137:3000",
        "http://192.168.0.136:3000",
        "http://192.168.0.232:3000",
        "http://192.168.0.231:3000"
    ], // Allow only this origin
    credentials: true, // Allow credentials
};
app.use((0, cors_1.default)(corsOptions));
//file retrieve
app.use(express_1.default.static('uploads'));
// ✅ Also parse URL-encoded form data, in case SSLCommerz sends as form
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api/v1', routes_1.default);
app.get('/', (req, res) => {
    res.send('Foodplus Backend');
});
app.use(globalErrorhandler_1.default);
//not found route
// app.use(notFound)
exports.default = app;
