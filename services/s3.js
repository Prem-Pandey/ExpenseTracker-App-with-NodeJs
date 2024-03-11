const AWS = require('aws-sdk');
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
// const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");


exports.uploadToS3 = async (data, filename) => {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET;
    const REGION = "ap-south-1"

    // const s3Bucket = new AWS.S3({
    //     accessKeyId: IAM_USER_KEY,
    //     secretAccessKey: IAM_USER_SECRET
    // });

    // const params = {
    //     Bucket: BUCKET_NAME,
    //     Key: filename,
    //     Body: data,
    //     ACL: 'public-read'
    // };

    // return new Promise((resolve, reject) => {
    //     s3Bucket.upload(params, (err, s3Response) => {
    //         if(err){
    //             console.log('S3 UPLOAD ERROR');
    //             reject(err);
    //             return;
    //         }
    //         resolve(s3Response.Location);
    //     });
    // });

    const s3Client = new S3Client({
        region: "ap-south-1",
        credentials: {
          accessKeyId: IAM_USER_KEY ,
          secretAccessKey: IAM_USER_SECRET,
        },
      });
      
      // Define parameters for the PutObjectCommand
      const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
      };
      
      // Create a PutObjectCommand and execute it
      
      // const putObjectCommand = new PutObjectCommand(params);
      // s3Client.send(putObjectCommand)
      //   .then(() => {
      //     console.log("Object uploaded successfully");
      //     const fileURL = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${filename}`;
      //     console.log(fileURL);
      //     console.log("type: "+typeof(fileURL))
      //   return fileURL;
      //   })
      
      //   .catch((err) => {
      //     console.error("Error uploading object:", err);
      //   });

      try {
        // Create a PutObjectCommand and execute it
        const putObjectCommand = new PutObjectCommand(params);
        const response = await s3Client.send(putObjectCommand);
        console.log("Object uploaded successfully");
        // const fileURL = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${filename}`;
        // console.log(fileURL);
        // return fileURL;

        const getObjectCommand = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: filename,
      });
      const url = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 60 }); // 1 hour expiration
      
      console.log("Pre-signed URL:", url);
      return url;
    } catch (err) {
        console.error("Error uploading object:", err);
        throw err; // Reject the promise with the error
    }
}