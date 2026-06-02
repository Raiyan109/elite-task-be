"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRoutes = void 0;
const express_1 = __importDefault(require("express"));
const review_controller_1 = require("./review.controller");
const auth_1 = require("../../middlewares/auth");
const router = express_1.default.Router();
// get user active category and post update delete category
router.route("/")
    .get(review_controller_1.ReviewController.findReviews)
    .post((0, auth_1.auth)('user'), review_controller_1.ReviewController.createReview)
    .patch(review_controller_1.ReviewController.updateReview);
// get all active inactive category for dashboard
router.route("/dashboard").get(review_controller_1.ReviewController.findAllDashboardReviews);
router.route("/:review_product_id").get(review_controller_1.ReviewController.findReviewsByProductId);
router.route('/:_id').delete(review_controller_1.ReviewController.deleteReviewInfo);
// router.post('/create', fileUploadHandler(), validateRequest(createSettingsSchema), SettingsController.createSettings);
// router.get('/', SettingsController.getSettings);
// router.patch('/', fileUploadHandler(), SettingsController.updateSettings)
exports.ReviewRoutes = router;
