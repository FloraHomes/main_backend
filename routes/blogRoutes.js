import express from "express";
import expressAsyncHandler from "express-async-handler";
import BlogModel from "../models/blogs/blogModel.js";
import { v2 as cloudinary } from "cloudinary";
import imageUpload from "../configurations/imageUpload.js";
import { cloudinaryConfig } from "../configurations/cloudinaryConfig.js";
import streamifier from "streamifier";

const blogRoutes = express.Router();

blogRoutes.post(
  "/new-blog",
  imageUpload().single("image"),
  expressAsyncHandler(async (req, res) => {
    if (req.method !== "POST") {
      return res
        .status(401)
        .send({ message: `Method ${req.method} not allowed` });
    }

    cloudinaryConfig();

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

    async function upload(req) {
      let result = await streamUpload(req);
      return result;
    }

    const imageUploadResult = await upload(req);

    if (!imageUploadResult?.secure_url) {
      res.status(400).send({ message: "Image upload failed" });
    }
    const { title, categories, details, author } = req?.body;
    console.log({ title, categories, details, author });

    const { error } = BlogModel.BlogValidations.validate({
      title,
      categories,
      details,
      image: imageUploadResult.secure_url,
    });

    if (error?.details?.length > 0) {
      let tempErrors = [];
      error?.details.forEach(
        (err) => (tempErrors = [...tempErrors, err.message])
      );
      return res
        .status(400)
        .send({ message: "Please send valid data", errors: tempErrors });
    }

    const newBlog = new BlogModel.Blog({
      title,
      categories,
      details,
      image: imageUploadResult.secure_url,
      author,
    });
    try {
      const blog = await newBlog.save();
      res
        .status(200)
        .send({ status: true, message: "goal recorded", data: blog });
    } catch (error) {
      res
        .status(400)
        .send({ status: false, message: "goal not recorded", data: error });
    }
  })
);

export default blogRoutes;
