const mongoose = require("mongoose");

const Diagnostic = mongoose.model("Diagnostic", {
  name: {
    type: String,
    maxLength: 50,
  },
  description: {
    type: String,
    maxLength: 500,
  },
  category: String, // "eczéma" or "redness"
  images: { type: mongoose.Schema.Types.Mixed, default: {} },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = Diagnostic;
