import { asyncHandler } from '../utils/asyncHandler.js'; 
import { ApiError } from '../utils/ApiError.js';
import User from '../models/user.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;//collecting data
    console.log("email" , email);

    //checking if all required fields are present
    if (!name || !email || !password || !phone) {
        throw new ApiError("All fields are required", 400);
    }

    //check vid 13 for how to add multiple fields in findOne op using $or operator
    //checking if user with the same email or phone already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
        throw new ApiError("User with email or phone already exists", 409);
    }

    //file upload handling.
    const profilePictureLocalPath = req.files?.profilePicture[0]?.path;
    if (!profilePictureLocalPath) {
        throw new ApiError("Profile picture is required", 400);
    }

    //upload image to cloudinary and get the URL
    const profilePicture = await uploadOnCloudinary(profilePictureLocalPath);

    if (!profilePicture) {
        throw new ApiError("Failed to upload profile picture", 500);
    }

    //creating new user and enter in db
    const newUser = await User.create({
        name,
        email,
        password,
        phone,
        profilePicture: profilePicture.secure_url, 
    });
    
    //checking if user is registered.
    const createdUser = await User.findById(newUser._id).select(
        "-password -refreshToken -__v"
    )
    if (!createdUser) {
        throw new ApiError("Failed to create user", 500);
    }

    //returnign success response with created user data except password and refresh token.
    return res.status(201).json(
        new ApiResponse(
            201, 
            "User registered successfully", 
            createdUser
        ));
}); 


// ✅ LOGIN USER
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError("Email and password are required", 400);
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError("User not found", 404);
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError("Invalid credentials", 401);
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -__v"
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                "User logged in successfully",
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                }
            )
        );
});


// ✅ LOGOUT USER
const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                "User logged out successfully"
            )
        );
});


export { registerUser, loginUser, logoutUser };