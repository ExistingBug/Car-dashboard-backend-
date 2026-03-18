import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Document from "../models/document.model.js";

const uploadDocument = asyncHandler(async (req, res) => {
    const { car, documentType, issueDate, expiryDate, notes } = req.body;

    if (!car || !documentType) {
        throw new ApiError(400, "Required fields missing");
    }

    const fileUrl = req.file?.path;

    if (!fileUrl) {
        throw new ApiError(400, "Document file required");
    }

    const document = await Document.create({
        user: req.user._id,
        car,
        documentType,
        fileUrl,
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