import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Reminder from "../models/reminder.model.js";

const createReminder = asyncHandler(async (req, res) => {
    const {
        car,
        title,
        type,
        description,
        reminderDate,
        priority,
        repeat
    } = req.body;

    if (!car || !title || !reminderDate) {
        throw new ApiError(400, "Required fields missing");
    }

    const reminder = await Reminder.create({
        user: req.user._id,
        car,
        title,
        type,
        description,
        reminderDate,
        priority,
        repeat
    });

    return res.status(201).json(
        new ApiResponse(201, "Reminder created successfully", reminder)
    );
});

const getReminders = asyncHandler(async (req, res) => {
    const reminders = await Reminder.find({ user: req.user._id }).populate("car");

    return res.status(200).json(
        new ApiResponse(200, "Reminders fetched", reminders)
    );
});

const updateReminder = asyncHandler(async (req, res) => {
    const { reminderId } = req.params;

    const reminder = await Reminder.findByIdAndUpdate(
        reminderId,
        req.body,
        { new: true }
    );

    if (!reminder) {
        throw new ApiError(404, "Reminder not found");
    }

    return res.status(200).json(
        new ApiResponse(200, "Reminder updated", reminder)
    );
});

const deleteReminder = asyncHandler(async (req, res) => {
    const { reminderId } = req.params;

    const reminder = await Reminder.findById(reminderId);

    if (!reminder) {
        throw new ApiError(404, "Reminder not found");
    }

    await reminder.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, "Reminder deleted successfully")
    );
});

export {
    createReminder,
    getReminders,
    updateReminder,
    deleteReminder
};