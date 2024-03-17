const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

// user schema
const UserSchema = new mongoose.Schema({
  // email field
  email: {
    type: String,
    required: [true, "Please provide an Email!"],
    unique: [true, "Email Exist"],
  },

  //   password field
  password: {
    type: String,
    required: [true, "Please provide a password!"],
    unique: false,
  },

  uuid: {
    type: String,
    default: uuidv4,
    index: true,
  },
});

// export Schema
module.exports = mongoose.model.Users || mongoose.model("Users", UserSchema);
