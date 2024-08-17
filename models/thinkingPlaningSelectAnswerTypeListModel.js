const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const thinkingPlaningSelectAnswerTypeList = new Schema(
    {
        thinkingPlanningId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "thinkingPlanning",
            required: true,
        },
        name: String,
        position: Number,
        actualPriority: Number,
        isDeleted: Boolean,
    },
    { timestamps: true, versionKey: false }
);

const SELECT_ANSWER_TYPE_LIST = mongoose.model("thinkingPlaningSelectAnswerTypeList", thinkingPlaningSelectAnswerTypeList);

module.exports = SELECT_ANSWER_TYPE_LIST;
