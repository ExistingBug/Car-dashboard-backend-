import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

//used middle ware to handle file upload for profile picture, the field name in the form should be "profilePicture"
router.route("/register").post(upload.single("profilePicture"), registerUser);

export default router;