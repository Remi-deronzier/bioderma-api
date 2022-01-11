const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: {
    unique: true,
    type: String,
  },
  account: {
    username: {
      required: true,
      type: String,
    },
    avatar: Object, // to upload a picture
    description: String,
  },
  token: String,
  hash: String,
  salt: String,
  is_professional: Boolean,
  is_patient: Boolean,
  is_writer: Boolean,
});

module.exports = User;
