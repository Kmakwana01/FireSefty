const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const tacticalDecisionGameRatingScaleText = new Schema(
    {
    tacticalDecisionGameId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tacticalDecisionGame',
        required: true
    },
    ratingScaleText : String,
    isDeleted: Boolean,
    actualPriority : Number,
    position : Number,
    slider : String,
    },
    { timestamps: true, versionKey: false }
);

const TACTICAL_DECISION_GAME_RATING_SCALE_TEXT = mongoose.model("tacticalDecisionGameRatingScaleText", tacticalDecisionGameRatingScaleText);

module.exports = TACTICAL_DECISION_GAME_RATING_SCALE_TEXT;
