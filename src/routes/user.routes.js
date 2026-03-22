import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//used middle ware to handle file upload for profile picture, the field name in the form should be "profilePicture"
// user.routes.js mein
router.route("/register").post(
    upload.fields([
        {
            name: "profilePicture", // Yeh naam aur controller ka naam match hona chahiye
            maxCount: 1
        }
    ]),
    registerUser
);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

export default router;