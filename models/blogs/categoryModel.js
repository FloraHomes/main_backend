import Joi from "joi";
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  image: { type: String, required: true },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  details: { type: String, required: true },
  color_code: { type: String, required: true },
  created_at: { type: Date, required: true, default: Date.now },
  updated_at: { type: Date, required: true, default: Date.now },
});

const validation = Joi.object({
  title: Joi.string().min(3).max(255).trim(true).required(),
  details: Joi.string().min(8).trim(true).required(),
  image: Joi.string().min(8).trim(true).required(),
  color_code: Joi.string().required(),
}).options({ abortEarly: false });

const Category = mongoose.model("Category", categorySchema);
export default { Category, CategoryValidations: validation };
