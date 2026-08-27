const AWS = require('aws-sdk');
const uuidv1 = require('uuid').v1;
var path = require('path');

let awsConfig = {
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_BUCKET,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};

const cartifig = {
    accessKeyId: awsConfig.accessKeyId,
    secretAccessKey: awsConfig.secretAccessKey,
    region: awsConfig.region
};

const uploadParams = {
    Bucket: awsConfig.bucket,
    Key: '', // pass key
    Body: null // pass file body
};

async function doUpload(req, folder = null) {
    console.log('mimetype....', req.file);

    let uni = uuidv1();

    const params = uploadParams;

    // If a folder is specified, prepend the folder name to the key
    if (folder !== null) {
        params.Key = folder + "/" + uni + path.extname(req.file.originalname);
    } else {
        params.Key = uni + path.extname(req.file.originalname);
    }
    console.log('params.Key....', params.Key);

    let originalName = req.file.originalname;
    params.Body = req.file.buffer;

    try {
        // Upload file to S3
        let s3Get = await new AWS.S3(cartifig).putObject(params).promise();
        console.log("s3Get", s3Get);

        let data = {
            status: true,
            "originalname": originalName,
            url: "https://" + params.Bucket + ".s3." + awsConfig.region + ".amazonaws.com/" + params.Key,
            data: {
                url: "https://" + params.Bucket + ".s3." + awsConfig.region + ".amazonaws.com/" + params.Key,
                s3Get
            }
        };
        console.log("Successfully uploaded data to bucket", data);
        return data;

    } catch (e) {
        console.log("Error uploading data: ", e);
        return {
            status: false,
            e
        };
    }
}

async function multipleUpload(req, folder = null, callback) {
    const files = req.files;
    let dataReturn = [];
    let sendData = { status: true, data: [] };
    let completedCount = 0;

    // Iterate over each file and upload
    for (let i = 0; i < files.length; i++) {
        let item = files[i];
        let uni = uuidv1();
        let params = uploadParams;

        // If a folder is specified, prepend the folder name to the key
        if (folder !== null) {
            params.Key = folder + "/" + uni + path.extname(item.originalname);
        } else {
            params.Key = uni + path.extname(item.originalname);
        }
        params.Body = item.buffer;

        try {
            let s3Get = await new AWS.S3(cartifig).putObject(params).promise();
            let data = {
                url: "https://" + params.Bucket + ".s3." + awsConfig.region + ".amazonaws.com/" + params.Key,
                data: s3Get
            };
            sendData.data.push(data);
            console.log("Successfully uploaded data to bucket", data);

            // Increment the count when a file is successfully uploaded
            completedCount++;

            // Check if all files are uploaded
            if (completedCount === files.length) {
                callback(null, sendData);
            }
        } catch (e) {
            console.log("Error uploading file:", e);
            // Handle individual file upload failure here if needed
            sendData.status = false;
            sendData.error = e;
            callback(e, sendData);
            return;
        }
    }
}

module.exports = {
    doUpload,
    multipleUpload
};