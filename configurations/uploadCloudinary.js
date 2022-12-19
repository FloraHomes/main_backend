import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

export const uploadImageCloudinary = async (req) => {
  let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
      let stream = cloudinary.uploader.upload_stream((error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      });

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
  };

  let result = await streamUpload(req);
  return result;
};
