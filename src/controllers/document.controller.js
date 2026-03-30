import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Document from "../models/document.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const uploadDocument = asyncHandler(async (req, res) => {
    const { car, documentType, issueDate, expiryDate, notes } = req.body;

    if (!car || !documentType) {
        throw new ApiError(400, "Required fields missing");
    }

    const fileLocalPath = req.files?.fileImage?.[0]?.path;

    if (!fileLocalPath) {
        throw new ApiError(400, "Document file required");
    }

    // ✅ Upload to Cloudinary
    const fileUrl = await uploadOnCloudinary(fileLocalPath);

    if (!fileUrl) {
        throw new ApiError(500, "Failed to upload document");
    }

    const fileImage = fileUrl.url;

    const document = await Document.create({
        user: req.user._id,
        car,
        documentType,
        fileImage,
        issueDate,
        expiryDate,
        notes
    });

    return res.status(201).json(
        new ApiResponse(201, "Document uploaded successfully", document)
    );
});

const getDocuments = asyncHandler(async (req, res) => {
    const documents = await Document.find({ user: req.user._id }).populate("car");

    return res.status(200).json(
        new ApiResponse(200, "Documents fetched", documents)
    );
});

const deleteDocument = asyncHandler(async (req, res) => {
    const { documentId } = req.params;

    const document = await Document.findById(documentId);

    if (!document) {
        throw new ApiError(404, "Document not found");
    }

    await document.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, "Document deleted successfully")
    );
});

export {
    uploadDocument,
    getDocuments,
    deleteDocument
};