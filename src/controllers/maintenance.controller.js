import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import MaintenanceRecord from "../models/maintenance.models.js";
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const addMaintenanceRecord = asyncHandler(async (req, res) => {
    const {
        car,
        serviceType,
        serviceCenter,
        serviceDate,
        mileageAtService,
        cost,
        description,
        nextServiceDue
    } = req.body;

    if (!car || !serviceType || !serviceDate) {
        throw new ApiError(400, "Required fields missing");
    }

    const invoiceLocalPath = req.files?.invoiceUrl?.[0]?.path;

    if (!invoiceLocalPath) {
        throw new ApiError(400, "Invoice file is required");
    }

    const invoice = await uploadOnCloudinary(invoiceLocalPath);

    if (!invoice) {
        throw new ApiError(500, "Failed to upload invoice");
    }

    const invoiceUrl = invoice.url;

    const record = await MaintenanceRecord.create({
        car,
        serviceType,
        serviceCenter,
        serviceDate,
        mileageAtService,
        cost,
        description,
        nextServiceDue
    });

    return res.status(201).json(
        new ApiResponse(201, "Maintenance record added", record)
    );
});

const getMaintenanceRecords = asyncHandler(async (req, res) => {
    const { carId } = req.query;

    const records = await MaintenanceRecord.find({ car: carId });
    if (!records.length) {
        throw new ApiError(404, "No maintenance records found for this car");
    };

    return res.status(200).json(
        new ApiResponse(200, "Maintenance records fetched", records)
    );
});

const deleteMaintenanceRecord = asyncHandler(async (req, res) => {
    const { recordId } = req.params;

    const record = await MaintenanceRecord.findById(recordId);

    if (!record) {
        throw new ApiError(404, "Record not found");
    }

    await record.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, "Record deleted successfully")
    );
});

export {
    addMaintenanceRecord,
    getMaintenanceRecords,
    deleteMaintenanceRecord
};