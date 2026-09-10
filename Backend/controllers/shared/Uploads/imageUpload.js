const S3 = require("../../../service/s3");
const videos3 = require("../../../service/video.s3");



const ImageUpload = async (req, res) => {
  let uploadDAta = await S3.doUpload(req, "image");
  console.log("uploadDAta..", uploadDAta);
  res.status(200).json({
    status: true,
    image: uploadDAta.url,
  });
};

const videoUpload = async (req, res) => {
  let uploadDAta = await videos3.doUpload(req, "video");
  console.log("uploadDAta..", uploadDAta);
  res.status(200).json({
    status: true,
    image: uploadDAta.url,
  });
};
const MultipleImageUpload = async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ status: false, message: "No files uploaded" });
    }

    let uploadedImages = [];

    for (const file of files) {
      const uploadData = await S3.doUpload({ ...req, file }, "image"); // Add `file` manually to mimic single upload
      uploadedImages.push(uploadData.url);
    }

    return res.status(200).json({
      status: true,
      images: uploadedImages,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to upload images",
      error: error.message,
    });
  }
};

const profileImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: false, message: "No file uploaded" });
    }
    let uploadData = await S3.doUpload(req, "profile_images");
    return res.status(200).json({
      status: true,
      url: uploadData.url,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to upload profile image",
      error: error.message,
    });
  }
};

const hotelImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: false, message: "No file uploaded" });
    }
    let uploadData = await S3.doUpload(req, "hotel_images");
    return res.status(200).json({
      status: true,
      url: uploadData.url,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to upload hotel image",
      error: error.message,
    });
  }
};

const hotelVideoUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: false, message: "No file uploaded" });
    }
    let uploadData = await videos3.doUpload(req, "hotel_videos");
    return res.status(200).json({
      status: true,
      url: uploadData.url,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to upload hotel video",
      error: error.message,
    });
  }
};

module.exports={
    ImageUpload,
    videoUpload,
    MultipleImageUpload,
    profileImageUpload,
    hotelImageUpload,
    hotelVideoUpload
}