const mongoose = require("mongoose");

const notesSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required:true
    },
    note: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
      maxLength: 50,
    },
    category: {
      type: String,
      required: true,
      enum: ["Personal", "Business", "Other"],
      default: "Personal",
    },
    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

const NOTE = mongoose.model("note", notesSchema);

module.exports = NOTE;
