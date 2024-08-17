const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const tacticalDecisionGameAddAnswer = new Schema(
    {
    tacticalDecisionGameId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tacticalDecisionGame',
        required: true
    },
    answer : String,
    position : Number,
    isDeleted: Boolean,
    },
    { timestamps: true, versionKey: false }
);

const TACTICAL_DECISION_GAME_ADD_ANSWER = mongoose.model("tacticalDecisionGameAddAnswer", tacticalDecisionGameAddAnswer);

module.exports = TACTICAL_DECISION_GAME_ADD_ANSWER;
