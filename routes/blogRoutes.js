import express from "express";
import expressAsyncHandler from "express-async-handler";
import BlogModel from "../models/blogs/blogModel.js";
import { v2 as cloudinary } from "cloudinary";
import imageUpload from "../configurations/imageUpload.js";
import { cloudinaryConfig } from "../configurations/cloudinaryConfig.js";
import slugify from "slugify";
import { uploadImageCloudinary } from "../configurations/uploadCloudinary.js";

const blogRoutes = express.Router();

blogRoutes.post(
  "/new",
  imageUpload().single("image"),
  expressAsyncHandler(async (req, res) => {
    cloudinaryConfig();
    const { title, categories, details, author } = req?.body;

    const alreadyExist = await BlogModel.Blog.findOne({ title: title });
    if (!req?.file) {
      res.status(400).send({ error: "Please upload cover image" });
    }
    if (alreadyExist) {
      return res
        .status(400)
        .send({ message: "Blog with this name already exists." });
    }
    const slug = slugify(title);

    const imageUploadResult = await uploadImageCloudinary(req);

    console.log({ imageUploadResult });

    if (!imageUploadResult?.secure_url) {
      res.status(400).send({ error: "Image upload failed" });
    }

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
      slug,
      title,
      categories,
      details,
      image: imageUploadResult.secure_url,
      author,
    });
    try {
      const blog = await newBlog.save();
      res.status(201).send({
        status: true,
        message: "New blog added successfully",
        data: blog,
      });
    } catch (error) {
      res
        .status(400)
        .send({ status: false, error: "Blog not added", data: error });
    }
  })
);

blogRoutes.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const currentPage = req.query.currentpage;
    const perPage = req.query.perpage;
    if (!currentPage) {
      return res.status(400).send({ error: "please send page num" });
    }
    if (!perPage) {
      return res.status(400).send({ error: "please send blogs per page" });
    }
    const blogCount = await BlogModel.Blog.find().countDocuments();
    const blogs = await BlogModel.Blog.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    if (!blogs) {
      return res.status(400).send({ error: "Something went wrong" });
    }
    return res.status(200).send({
      message: "success",
      blogs,
      totalPages: Math.ceil(blogCount / perPage),
    });
  })
);

blogRoutes.get(
  "/details",
  expressAsyncHandler(async (req, res) => {
    const slug = req.query.slug;
    if (!slug) {
      return res.status(404).send({ error: "Page not found" });
    }
    const data = await BlogModel.Blog.findOne({ slug: slug });
    if (!data) {
      return res.status(404).send({ error: "Page not found" });
    }
    return res.status(200).send({ message: "success", data });
  })
);
blogRoutes.put(
  "/update",
  imageUpload().single("image"),
  expressAsyncHandler(async (req, res) => {
    cloudinaryConfig();
    const { id, title, categories, details } = req?.body;
    const data = await BlogModel.Blog.findOne({ _id: id });
    if (!data) {
      return res
        .status(400)
        .send({ error: "Blog with this id does not exist", data: { id } });
    }

    let newImageURL = {};
    if (req?.file !== undefined) {
      newImageURL = await uploadImageCloudinary(req);
    }
    const options = { upsert: false };
    const slug = slugify(title);

    const updateDoc = {
      $set: {
        title,
        slug,
        categories,
        details,
        image: newImageURL?.secure_url ? newImageURL.secure_url : data.image,
        updated_at: Date.now(),
      },
    };
    const result = await BlogModel.Blog.updateOne(
      { _id: id },
      updateDoc,
      options
    );
    console.log(result);
    if (result.matchedCount === 1) {
      return res.status(200).send({ message: "Blog updated successfully." });
    } else
      return res
        .status(400)
        .send({ error: "Something went wrong please try again." });
  })
);

blogRoutes.delete(
  "/delete",
  imageUpload().single("image"),
  expressAsyncHandler(async (req, res) => {
    cloudinaryConfig();
    const { id } = req?.body;
    const data = await BlogModel.Blog.findOne({ _id: id });
    if (!data) {
      return res.status(400).send({ error: "Blog not found" });
    }
    let del = await cloudinary.uploader.destroy(
      data.image.split("/")[data.image.split("/").length - 1].split(".")[0]
    );
    if (del?.result !== "ok")
      return res.status(400).send({ error: "Failed to delete" });

    const query = { _id: id };

    const result = await BlogModel.Blog.deleteOne(query);
    if (result.deletedCount === 1) {
      return res.status(200).send({ message: "Blog deleted successfully" });
    } else {
      return res.status(400).send({ error: "Failed to delete" });
    }
  })
);

export default blogRoutes;
