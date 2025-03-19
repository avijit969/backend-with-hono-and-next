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
    const buffer = await file.arrayBuffer();
    const tempFilePath = `./${file.name}`;

    // Write buffer to a temporary file
    await fs.writeFile(tempFilePath, new Uint8Array(buffer));
    // Upload file from the temp path
    const response = await cloudinary.uploader.upload(tempFilePath, {
      resource_type: "auto",
      folder: "hono-backend",
    });

    // Delete the temp file
    await fs.unlink(tempFilePath);

    return response;
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
};
export { uploadOnCloudinary };
