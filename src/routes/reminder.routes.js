import { Router } from "express";
import {
  createReminder,
  getReminders,
  updateReminder,
  deleteReminder
} from "../controllers/reminder.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//  Add Reminder
router.route("/add").post(
  verifyJWT,
  createReminder
);

//  Get All Reminders
router.route("/records").get(
  verifyJWT,
  getReminders
);

//  Update Reminder
router.route("/update/:reminderId").patch(
  verifyJWT,
  updateReminder
);

// Delete Reminder
router.route("/delete/:reminderId").delete(
  verifyJWT,
  deleteReminder
);

export default router;