import express from 'express'
import { FileUploadHelper } from '../../helpers/FileUploadHelper';
import { ImgOrPDFFilesToUrlLinksController } from './ImgOrPDFFilesToUrlLinks';

const router = express.Router();

router.route('/').post(
  FileUploadHelper.ImageUpload.fields([{ name: "big_picture", maxCount: 1 }]),
  ImgOrPDFFilesToUrlLinksController.uploadFiles
);

export const ImgOrPDFFilesToUrlLinksRoutes = router;