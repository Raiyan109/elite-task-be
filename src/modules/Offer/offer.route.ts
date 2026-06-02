import express from 'express';
import { OfferController } from './offer.controller';
import { FileUploadHelper } from '../../helpers/FileUploadHelper';


const router = express.Router();

// get user active category and post update delete category
router.route("/")
    .get(OfferController.findAllOffer)
    .post(FileUploadHelper.ImageUpload.fields([{ name: "offer_image", maxCount: 1 }]), OfferController.createOffer)
// .patch(FileUploadHelper.ImageUpload.fields([
//     { name: "offer_image", maxCount: 1 },
// ]),
//     OfferController.updateOffer)
// .delete(OfferController.deleteOfferInfo)

// router.route('/:_id').delete(OfferController.deleteOfferInfo)

// get all active inactive category for dashboard
router.route("/dashboard").get(OfferController.findDashboardOffer)

// GET all weekday offers
router.route("/weekday").get(OfferController.findAllWeekdayOffer)

// get offers by ids
router.route('/ids').post(OfferController.findOffersByIds)

router.route('/:id').get(OfferController.findSingleOffer)


export const OfferRoutes = router;