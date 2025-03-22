import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (file: File) => {
  try {
    if (!file) return null;

    // Convert the File object to a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const response = await new Promise<any>((resolve, reject) =>
      cloudinary.uploader
        .upload_stream(
          {
            folder: "budegtracker",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        )
        .end(buffer)
    );

    return response;
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
};
export { uploadOnCloudinary };
