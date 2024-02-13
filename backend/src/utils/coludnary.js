import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: `${process.env.CLOUDINARY_CLOUD_NAME}`,
  api_key: `${process.env.CLOUDINARY_CLOUD_KEY}`,
  api_secret: `${process.env.CLOUDINARY_CLOUD_SECRET}`,
});
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload the file
    const response = await cloudinary.uploader.upload(
      localFilePath,
      { public_id: "olympic_flag" },
      {
        resource_type: "auto",
      }
    );
    conslog.log(response.url);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove the locally saved temparary file as the upload operation got failed4
    return null
  }
};

export {uploadOnCloudinary}