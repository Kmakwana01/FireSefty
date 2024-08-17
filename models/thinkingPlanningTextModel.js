const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const thinkingPlanningText = new Schema(
{
    thinkingPlanningId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "thinkingPlanning",
    required: true,
    },
    text: String,
    slider : String,
    position : Number,
    isDeleted: Boolean,
},
{ timestamps: true, versionKey: false }
);

const THINKING_PLANNING_TEXT = mongoose.model("thinkingPlanningText", thinkingPlanningText);

module.exports = THINKING_PLANNING_TEXT;
