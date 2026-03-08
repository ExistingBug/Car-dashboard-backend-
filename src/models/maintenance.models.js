import mongoose from "mongoose";

const maintenanceRecordSchema = new mongoose.Schema(
  {
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    serviceType: {
      type: String,
      enum: [
        "Oil Change",
        "Brake Service",
        "Tire Rotation",
        "General Service",
        "Battery Replacement",
        "Other",
      ],
      required: true,
    },
    serviceCenter: {
      type: String,
      trim: true,
    },
    serviceDate: {
      type: Date,
      required: true,
    },
    mileageAtService: {
      type: Number,
    },
    cost: {
      type: Number,
    },
    description: {
      type: String,
      trim: true,
    },
    nextServiceDue: {
      type: Date,
    },
    invoiceUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("MaintenanceRecord", maintenanceRecordSchema);