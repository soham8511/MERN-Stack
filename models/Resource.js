// models/Resource.js
const mongoose = require("mongoose");

const ResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "general",
    },
    status: {
      type: String,
      enum: ["pending", "active", "done"],
      default: "pending",
    },
    amount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",          // link to the logged-in user
      required: true,
    },
  },
  { timestamps: true }      // adds createdAt, updatedAt
);

module.exports = mongoose.model("Resource", ResourceSchema);
