import express from 'express';
import { ReviewController } from './review.controller';
import { auth } from '../../middlewares/auth';

const router = express.Router();

// get user active category and post update delete category
router.route("/")
    .get(ReviewController.findReviews)
    .post(auth('user'), ReviewController.createReview)
    .patch(ReviewController.updateReview)

// get all active inactive category for dashboard
router.route("/dashboard").get(ReviewController.findAllDashboardReviews)

router.route("/:review_product_id").get(ReviewController.findReviewsByProductId)

router.route('/:_id').delete(ReviewController.deleteReviewInfo)


// router.post('/create', fileUploadHandler(), validateRequest(createSettingsSchema), SettingsController.createSettings);
// router.get('/', SettingsController.getSettings);
// router.patch('/', fileUploadHandler(), SettingsController.updateSettings)

export const ReviewRoutes = router;