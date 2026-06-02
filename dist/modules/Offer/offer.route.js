"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferRoutes = void 0;
const express_1 = __importDefault(require("express"));
const offer_controller_1 = require("./offer.controller");
const FileUploadHelper_1 = require("../../helpers/FileUploadHelper");
const router = express_1.default.Router();
// get user active category and post update delete category
router.route("/")
    .get(offer_controller_1.OfferController.findAllOffer)
    .post(FileUploadHelper_1.FileUploadHelper.ImageUpload.fields([{ name: "offer_image", maxCount: 1 }]), offer_controller_1.OfferController.createOffer);
// .patch(FileUploadHelper.ImageUpload.fields([
//     { name: "offer_image", maxCount: 1 },
// ]),
//     OfferController.updateOffer)
// .delete(OfferController.deleteOfferInfo)
// router.route('/:_id').delete(OfferController.deleteOfferInfo)
// get all active inactive category for dashboard
router.route("/dashboard").get(offer_controller_1.OfferController.findDashboardOffer);
// GET all weekday offers
router.route("/weekday").get(offer_controller_1.OfferController.findAllWeekdayOffer);
// get offers by ids
router.route('/ids').post(offer_controller_1.OfferController.findOffersByIds);
router.route('/:id').get(offer_controller_1.OfferController.findSingleOffer);
exports.OfferRoutes = router;
