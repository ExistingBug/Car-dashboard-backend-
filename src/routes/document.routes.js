import { Router } from "express";
import {
  uploadDocument,
  getDocuments,
  deleteDocument
} from "../controllers/document.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();


router.route("/upload").post(
    upload.fields([
        {
            name: "fileImage", // Yeh naam aur controller ka naam match hona chahiye
            maxCount: 1
        }
    ]),
    verifyJWT,uploadDocument
);

// 🔹 Get all documents of logged-in user
router.route("/getdocs").get(
  verifyJWT,
  getDocuments
);

// 🔹 Delete a document
router.route("/:documentId").delete(
  verifyJWT,
  deleteDocument
);

export default router;