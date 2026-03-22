import { Router } from "express";
import { addCar, getUserCars, deleteCar } from "../controllers/car.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Add car
router.route("/add").post(
    upload.fields([
        {
            name: "carImage", // Yeh naam aur controller ka naam match hona chahiye
            maxCount: 1
        }
    ]),
    verifyJWT,addCar 
);

// Get all cars of logged-in user
router.route("/my-cars").get(verifyJWT, getUserCars);

// Delete car
router.route("/delete/:carId").delete(verifyJWT, deleteCar);

export default router;