const mongoose = require("mongoose");

const documentPageSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    }, // link to parent document
    pageNumber: { type: Number, required: true },
    content: { type: String, required: true },
    filePath: String, // optional: file saved in uploads/docs
  },
  { timestamps: true },
);

module.exports = mongoose.model("DocumentPage", documentPageSchema);
