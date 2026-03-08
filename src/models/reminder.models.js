import mongoose, {Sch} from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["Service", "Insurance", "PUC", "Oil Change", "Custom"],
      default: "Custom",
    },
    description: {
      type: String,
      trim: true,
    },
    reminderDate: {
      type: Date,
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    repeat: {
      type: String,
      enum: ["None", "Monthly", "Yearly", "Custom"],
      default: "None",
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Reminder", reminderSchema);