const cloudinary = require("cloudinary").v2;

exports.uploadImage = async function (imageFile) {
  try {
    if (typeof imageFile !== "string" || imageFile.trim() === "")
      return "Image data is inappropriate";

    const fileMimeType = imageFile.substring(5, imageFile.indexOf(";"));

    if (
      fileMimeType !== "image/png" &&
      fileMimeType !== "image/jpg" &&
      fileMimeType !== "image/jpeg"
    )
      return "Wrong image format";

    const result = await cloudinary.uploader.upload(imageFile, {
      folder: "SayHi/profile-images",
      crop: "scale",
    });

    return result;
  } catch (error) {
    return "Image upload failed";
  }
};

// i may include public id here stored in db
exports.deleteImage = async function (publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);

    return result;
  } catch (error) {
    return "Image delete failed";
  }
};
