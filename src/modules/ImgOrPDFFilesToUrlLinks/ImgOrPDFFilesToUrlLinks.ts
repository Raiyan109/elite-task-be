import AppError from "../../errors/AppError";
import { FileUploadHelper } from "../../helpers/FileUploadHelper";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

const uploadFiles = catchAsync(async (req, res) => {
    let big_picture = "";
    let big_picture_key = "";

    if (req.files && "big_picture" in req.files) {
        const filesToUpload = (req.files as any)["big_picture"][0];
        const uploaded = await FileUploadHelper.uploadToSpaces(filesToUpload);

        big_picture = uploaded.Location;
        big_picture_key = uploaded.Key;
    } else {
        throw new AppError(400, "certificate file is required.");
    }

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Certificate uploaded successfully",
        data: {
            big_picture,
            big_picture_key,
        },
    });
});

export const ImgOrPDFFilesToUrlLinksController = {
    uploadFiles,
};