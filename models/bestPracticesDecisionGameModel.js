const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bestPracticesDecisionGame = new Schema(
  {
    tacticalDecisionGameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tacticalDecisionGame",
      required: true,
    },
    name: String,
    isDeleted: Boolean,
  },
  { timestamps: true, versionKey: false }
);

const BEST_PRACTICES_DECISION_GAME = mongoose.model("bestPracticesDecisionGame", bestPracticesDecisionGame);

module.exports = BEST_PRACTICES_DECISION_GAME;
