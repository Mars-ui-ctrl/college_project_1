const cloudinary = require('cloudinary').v2;
const logger = require('./logger');

// Check credentials
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  logger.warn('Cloudinary credentials are not completely defined in environment variables. Uploads will fail.');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer directly to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from Multer memoryStorage
 * @param {string} folder - Destination folder on Cloudinary
 * @param {string} resourceType - Type of resource ('raw' for PDF, 'image' for avatar)
 * @returns {Promise<Object>} Cloudinary upload response
 */
const uploadFromBuffer = (fileBuffer, folder = 'research_nexus', resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          logger.error(`Cloudinary Upload Failure: ${error.message}`);
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

module.exports = {
  cloudinary,
  uploadFromBuffer,
};
