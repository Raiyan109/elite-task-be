"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressRoutes = void 0;
const express_1 = __importDefault(require("express"));
const address_controller_1 = require("./address.controller");
const auth_1 = require("../../middlewares/auth");
const router = express_1.default.Router();
// Create, Update, Get Address
router
    .route("/")
    .get((0, auth_1.auth)('user'), address_controller_1.AddressController.getAddress)
    .post((0, auth_1.auth)('user'), address_controller_1.AddressController.postAddress)
    .patch(address_controller_1.AddressController.updateAddress);
router.route("/:user_id").get(address_controller_1.AddressController.findAddressesByUserId);
router.route('/:_id').delete(address_controller_1.AddressController.deleteAddress);
exports.AddressRoutes = router;
