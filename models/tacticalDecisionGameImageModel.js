const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const tacticalDecisionGameImage = new Schema(
    {
    tacticalDecisionGameId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tacticalDecisionGame',
        required: true
    },
    image : String,
    audio : String,
    answer : String,
    isDeleted: Boolean,
    },
    { timestamps: true, versionKey: false }
);

const TACTICAL_DECISION_GAME_IMAGE = mongoose.model("tacticalDecisionGameImage", tacticalDecisionGameImage);

module.exports = TACTICAL_DECISION_GAME_IMAGE;
