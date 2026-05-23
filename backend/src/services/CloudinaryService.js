const fs = require('fs/promises');
const { v2: cloudinary } = require('cloudinary');

function hasCloudinaryConfig() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME
      && process.env.CLOUDINARY_API_KEY
      && process.env.CLOUDINARY_API_SECRET
  );
}

async function uploadImage(file) {
  if (!file || !hasCloudinaryConfig()) {
    return null;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'catalogo7/filmes',
      resource_type: 'image'
    });

    return result.secure_url;
  } finally {
    await fs.unlink(file.path).catch(() => null);
  }
}

module.exports = {
  uploadImage
};
