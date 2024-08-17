const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FORGET = new Schema(
  {
    email: {
      type: String,
      ref: "user",
    },
    verificationCode: Number,
    expiresAt: String,
    resetMethod: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true, versionKey: false }
);

const RESET = mongoose.model("forgetPassword", FORGET);

module.exports = RESET;
