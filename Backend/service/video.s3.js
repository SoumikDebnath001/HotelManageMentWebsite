require("dotenv").config();
const aws = require("aws-sdk");
const multer = require("multer");
var express = require("express");
var router = express.Router();
var fs = require("fs");
var path = require("path");
const uuidv1 = require("uuid").v1;


const storage = multer.memoryStorage();
const limitsMulter = {
  files: 1,
  fileSize: 9000 * 1024 * 1024, // 9GB max size
};
const upload = multer({
  storage: storage,
  limits: limitsMulter,
});

const awsConfig = {
  region: process.env.AWS_REGION,
  bucket: process.env.AWS_BUCKET,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};

const s3 = new aws.S3({
  accessKeyId: awsConfig.accessKeyId,
  secretAccessKey: awsConfig.secretAccessKey,
  region: awsConfig.region,
});

const uploadParams = {
  Bucket: awsConfig.bucket,
  Key: "",
  Body: null,
};

async function uploadToS3(fileName, fileBuffer, folder = "video") {
  if (!fileName || !fileBuffer) {
    throw new Error("File name or file buffer is missing");
  }

  const fileKey = `${folder}/${fileName}`;
  console.info(`Uploading file: ${fileKey}`);

  try {
    const params = {
      ...uploadParams,
      Key: fileKey,
      Body: fileBuffer,
    };

    const result = await s3.upload(params).promise();
    console.info(`File uploaded successfully: ${result.Location}`);
    return {
      status: true,
      url: result.Location,
      fileName: fileName,
    };
  } catch (error) {
    console.error(`Error uploading file: ${error.message}`);
    throw error;
  }
}



async function doUpload(req, folder = "video") {
  if (!req.file) {
    return {
      status: false,
      message: "No file provided in the request",
    };
  }

  const uniqueFileName = `video-${uuidv1()}${path.extname(req.file.originalname)}`;
  const fileBuffer = req.file.buffer;

  try {
    const uploadResponse = await uploadToS3(uniqueFileName, fileBuffer, folder);
    return uploadResponse;
  } catch (error) {
    console.error(`Error during file upload: ${error.message}`);
    return {
      status: false,
      message: "File upload failed",
      error: error.message,
    };
  }
}

async function doFolder(folderName) {
  if (!folderName) {
    return { status: false, message: "Folder name is required" };
  }

  try {
    const params = {
      Bucket: awsConfig.bucket,
      Key: `${folderName}/`,
      Body: "",
      ACL: "public-read",
    };

    const result = await s3.putObject(params).promise();
    console.info(`Folder created: ${folderName}`);
    return {
      status: true,
      message: "Folder created successfully",
      folderName: folderName,
    };
  } catch (error) {
    console.error(`Error creating folder: ${error.message}`);
    return {
      status: false,
      message: "Folder creation failed",
      error: error.message,
    };
  }
}

module.exports = {
  uploadToS3,
  doUpload,
  doFolder
};