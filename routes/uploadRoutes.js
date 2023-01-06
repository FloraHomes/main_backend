import express from "express";
import { v2 as cloudinary } from "cloudinary";
import { isAuth } from "../utils.js";

const uploadRoutes = express.Router();

uploadRoutes.post("/", isAuth, async (req, res) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    await cloudinary.uploader.upload(
      req.body.b64,
      {
        folder: req.body.folderName,
        width: req.body.width,
        crop: "scale",
      },

      function (error, result) {
        res.send({ status: true, message: "Upload Successful", data: result });
      }
    );
  } catch (error) {
    res.send({ status: false, message: "Upload Failed", data: error });
  }
});

export default uploadRoutes;
