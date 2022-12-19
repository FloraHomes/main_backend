import express from "express";
import expressAsyncHandler from "express-async-handler";
import { v2 as cloudinary } from "cloudinary";
import imageUpload from "../configurations/imageUpload.js";
import { cloudinaryConfig } from "../configurations/cloudinaryConfig.js";
import slugify from "slugify";
import CategoryModel from "../models/blogs/categoryModel.js";
import { uploadImageCloudinary } from "../configurations/uploadCloudinary.js";

const categoryRoutes = express.Router();

categoryRoutes.post(
  "/new",
  imageUpload().single("image"),
  expressAsyncHandler(async (req, res) => {
    cloudinaryConfig();
    const { title, details, addedBy, colorCode } = req?.body;
    if (!req?.file) {
      res.status(400).send({ error: "Please upload cover image" });
    }
    const alreadyExist = await CategoryModel.Category.findOne({ title: title });
    if (alreadyExist) {
      return res
        .status(400)
        .send({ message: "Category with this name already exists." });
    }
    const slug = slugify(title);

    const imageUploadResult = await uploadImageCloudinary(req);

    if (!imageUploadResult?.secure_url) {
      res.status(400).send({ error: "Image upload failed" });
    }

    const { error } = CategoryModel.CategoryValidations.validate({
      title,
      details,
      image: imageUploadResult.secure_url,
      color_code: colorCode,
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

    const newCategory = new CategoryModel.Category({
      slug,
      title,
      details,
      image: imageUploadResult.secure_url,
      addedBy,
      color_code: colorCode,
    });
    try {
      const category = await newCategory.save();
      res.status(201).send({
        status: true,
        message: "New category added successfully",
        data: category,
      });
    } catch (error) {
      res
        .status(400)
        .send({ status: false, error: "Category not added", data: error });
    }
  })
);

categoryRoutes.get(
  "/all",
  expressAsyncHandler(async (req, res) => {
    const categories = await CategoryModel.Category.find();

    if (!categories) {
      return res.status(400).send({ error: "Something went wrong" });
    }
    return res.status(200).send({
      message: "success",
      categories,
    });
  })
);

categoryRoutes.put(
  "/update",
  imageUpload().single("image"),
  expressAsyncHandler(async (req, res) => {
    cloudinaryConfig();
    const { id, title, addedBy, colorCode, details } = req?.body;
    const data = await CategoryModel.Category.findOne({ _id: id });
    if (!data) {
      return res
        .status(400)
        .send({ error: "Category with this id does not exist", data: { id } });
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
        color_code: colorCode,
        details,
        image: newImageURL?.secure_url ? newImageURL.secure_url : data.image,
        updated_at: Date.now(),
      },
    };
    const result = await CategoryModel.Category.updateOne(
      { _id: id },
      updateDoc,
      options
    );
    console.log(result);
    if (result.matchedCount === 1) {
      return res
        .status(200)
        .send({ message: "Category updated successfully." });
    } else
      return res
        .status(400)
        .send({ error: "Something went wrong please try again." });
  })
);

categoryRoutes.delete(
  "/delete",
  imageUpload().single("image"),
  expressAsyncHandler(async (req, res) => {
    cloudinaryConfig();
    const { id } = req?.body;
    const data = await CategoryModel.Category.findOne({ _id: id });
    if (!data) {
      return res.status(400).send({ error: "Category not found" });
    }
    let del = await cloudinary.uploader.destroy(
      data.image.split("/")[data.image.split("/").length - 1].split(".")[0]
    );
    if (del?.result !== "ok")
      return res.status(400).send({ error: "Failed to delete" });

    const query = { _id: id };

    const result = await CategoryModel.Category.deleteOne(query);
    if (result.deletedCount === 1) {
      return res.status(200).send({ message: "Category deleted successfully" });
    } else {
      return res.status(400).send({ error: "Failed to delete" });
    }
  })
);

export default categoryRoutes;
