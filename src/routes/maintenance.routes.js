import { Router } from "express";
import {
  addMaintenanceRecord,
  getMaintenanceRecords,
  deleteMaintenanceRecord
} from "../controllers/maintenance.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/add").post(
  upload.fields([
    { name: "invoiceUrl", maxCount: 1 }
  ]),
  verifyJWT,
  addMaintenanceRecord
);

router.route("/records").get(verifyJWT, getMaintenanceRecords);

router.route("/delete/:recordId").delete(verifyJWT, deleteMaintenanceRecord);

export default router;