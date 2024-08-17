const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bestPracticesTdg = new Schema(
  {
    tdgLibraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tdgLibrary",
      required: true,
    },
    name: String,
    isDeleted: Boolean,
  },
  { timestamps: true, versionKey: false }
);

const BEST_PRACTICES_TDG = mongoose.model("bestPracticesTdg", bestPracticesTdg);

module.exports = BEST_PRACTICES_TDG;
