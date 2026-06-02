import express from "express";
import { FileUploadHelper } from "../../helpers/FileUploadHelper";
import { AddressController } from "./address.controller";
import { auth } from "../../middlewares/auth";

const router = express.Router();

// Create, Update, Get Address
router
    .route("/")
    .get(auth('user'), AddressController.getAddress)
    .post(auth('user'), AddressController.postAddress)
    .patch(AddressController.updateAddress
    )

router.route("/:user_id").get(AddressController.findAddressesByUserId)

router.route('/:_id').delete(AddressController.deleteAddress);

export const AddressRoutes = router;