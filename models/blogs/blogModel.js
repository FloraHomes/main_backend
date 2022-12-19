import mongoose from "mongoose";
import Joi from "joi";

const blogSchema = new mongoose.Schema({
  title: { type: String, unique: true },
  slug: { type: String, unique: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  categories: { type: Array, required: true },
  details: { type: String, required: true },
  image: { type: String, required: true },
  comment: { type: Number },
  created_at: { type: Date, required: true, default: Date.now },
  updated_at: { type: Date, required: true, default: Date.now },
});

const validation = Joi.object({
  title: Joi.string().min(3).max(255).trim(true).required(),
  categories: Joi.array().required(),
  details: Joi.string().min(8).trim(true).required(),
  image: Joi.string().min(8).trim(true).required(),
}).options({ abortEarly: false });

const Blog = mongoose.model("Blog", blogSchema);
export default { Blog, BlogValidations: validation };
