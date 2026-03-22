import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Car from "../models/car.models.js";
import mongoose from "mongoose";

const addCar = asyncHandler(async (req, res) => {

   // if (!req.user) {
       // throw new ApiError(401, "Unauthorized");
   // }

    const {
        brand,
        model,
        year,
        registrationNumber,
        fuelType,
        mileage,
        purchaseDate
    } = req.body;

    if (!brand || !model || !year || !registrationNumber || !fuelType) {
        throw new ApiError(400, "Required fields missing");
    }

    if (isNaN(year)) {
        throw new ApiError(400, "Invalid year");
    }

    const existingCar = await Car.findOne({
        registrationNumber: registrationNumber.toUpperCase()
    });

    if (existingCar) {
        throw new ApiError(409, "Car already registered");
    }

    const car = await Car.create({
        user: req.user._id,
        brand,
        model,
        year,
        registrationNumber: registrationNumber.toUpperCase(),
        fuelType,
        mileage,
        purchaseDate
    });

    return res.status(201).json(
        new ApiResponse(201, "Car added successfully", car)
    );
});



const getUserCars = asyncHandler(async (req, res) => {
    const cars = await Car.find({ user: req.user._id });
    if (!cars.length) {
    return res.status(200).json(
        new ApiResponse(200, "No cars found", [])
    );
    }
    else{
    return res.status(200).json(
        new ApiResponse(200, "Cars fetched successfully", cars)
    );
}
});


const deleteCar = asyncHandler(async (req, res) => {
    const { carId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(carId)) {
        throw new ApiError(400, "Invalid car ID");
    }

    const car = await Car.findById(carId); // ✅ missing step

    if (!car) {
        throw new ApiError(404, "Car not found");
    }

    if (car.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized action");
    }

    await car.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, "Car deleted successfully")
    );
});




export {
    addCar,
    getUserCars,
    deleteCar
};