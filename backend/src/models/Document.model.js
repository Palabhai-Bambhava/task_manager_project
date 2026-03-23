const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: String,

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    type: {
      type: String,
      enum: ["file", "text"],
      required: true,
    },

    fileUrl: String,

    editorContent: String,
    pages: [{ type: mongoose.Schema.Types.ObjectId, ref: "DocumentPage" }],

    access: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        canView: { type: Boolean, default: true },
        canEdit: { type: Boolean, default: false },
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },

    autoSave: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Document", documentSchema);
