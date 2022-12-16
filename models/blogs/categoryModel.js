import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  title: { type: String, unique: true },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  details: { type: String, required: true },
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
