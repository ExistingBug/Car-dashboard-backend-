import {v2 as cloudinary} from "cloudinary";
import fs from "fs"; //manage file system

cloudinary.config({
    cloud_name: process.env.CLOUDNARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filePath) => {
    try {
        if (!filePath) return null;
        //upload file on cloudinary
         const response = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto", //detect file type automatically
        })
        //file has been successfully uploaded to cloudinary, we can remove it from our server
        console.log("File uploaded to Cloudinary:", response.secure_url);
        return response;
    } catch (error) {
        fs.unlink(filePath) ;
        //remove the locally saved temporary file as the operation got failed 
        return null;
    }
};

export { uploadOnCloudinary };