import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import { v2 as cloudinary } from 'cloudinary';


// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
      folder: "blog_images", // Folder in Cloudinary
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

// Extract Cloudinary Public ID from URL
export const getPublicIdFromUrl = (url) => {
  try {
    const parts = url.split('/');
    const fileName = parts.pop();
    const folder = parts.slice(parts.indexOf("blog_images")).join('/'); // Get "blog_images"
    const publicId = `${folder}/${fileName.split('.')[0]}`; // Combine folder & ID

    return publicId;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
};


// Delete old image function
export const deleteOldImage = async (imageUrl) => {
  if (!imageUrl) return;
  const publicId = getPublicIdFromUrl(imageUrl);
  
  if (!publicId) {
    console.error("No valid Public ID. Skipping delete.");
    return;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting old image:', error);
  }
};
  
export const upload = multer({ storage });