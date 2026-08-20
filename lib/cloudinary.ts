import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dhqskqkeb",
  api_key: process.env.CLOUDINARY_API_KEY || "372917197797679",
  api_secret: process.env.CLOUDINARY_API_SECRET || "HckeHLZNi7IZnca8kaxGTVmUQbs",
  secure: true,
});

export interface CloudinaryUploadResult {
  url: string;
  public_id: string;
  secure_url: string;
}

/**
 * Uploads a base64 or buffer image string to Cloudinary in the chatbot_im_products folder
 */
export async function uploadImageToCloudinary(
  fileBase64: string,
  folder = "chatbot_im_products"
): Promise<CloudinaryUploadResult> {
  try {
    const result = await cloudinary.uploader.upload(fileBase64, {
      folder,
      resource_type: "image",
      transformation: [
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ],
    });

    return {
      url: result.url,
      public_id: result.public_id,
      secure_url: result.secure_url,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Error al subir la imagen a Cloudinary");
  }
}

/**
 * Deletes an image from Cloudinary using its public_id
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<boolean> {
  if (!publicId) return true;

  try {
    const res = await cloudinary.uploader.destroy(publicId);
    console.log(`Cloudinary image deleted [${publicId}]:`, res);
    return res.result === "ok" || res.result === "not found";
  } catch (error) {
    console.error(`Error deleting image from Cloudinary [${publicId}]:`, error);
    return false;
  }
}

export default cloudinary;
