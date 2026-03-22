import { asyncHandler } from '../utils/asyncHandler.js'; 
import { ApiError } from '../utils/ApiError.js';
import User from '../models/user.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

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

const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
        
    } catch (error) {
    console.log("TOKEN ERROR:", error); 
    throw new ApiError(error.message || "Failed to generate tokens", 500);
    }
};

//  LOGIN USER
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

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

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


//  LOGOUT USER
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

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

export { registerUser, loginUser, logoutUser, refreshAccessToken };

/* important things to remember:
jaha pe bhi db se  baat ho waha await lagana hai taki promise resolve hone ke baad hi aage ka code execute ho.
1. Always validate user input and handle errors using try-catch blocks and custom error classes like ApiError.
2. Use asyncHandler to wrap asynchronous route handlers and avoid unhandled promise rejections.
3. When handling file uploads, ensure that you validate the presence of the file and handle any errors that may occur during the upload process.
4. When generating access and refresh tokens, ensure that you securely store the refresh token in the database and set appropriate cookie options for security.
5. Always return consistent API responses using a standardized format like ApiResponse to improve client-side handling of responses.
6. When logging out a user, ensure that you clear the relevant cookies and remove the refresh token from the database to prevent unauthorized access.
7. Always exclude sensitive information like passwords and refresh tokens from API responses to enhance security.
8. difference between user and User is that user is an instance of the User model, while User is the model itself.
 The User model provides methods for creating, querying, and manipulating user documents in the database, 
 while a user instance represents a specific user document with its own properties and methods.
*/