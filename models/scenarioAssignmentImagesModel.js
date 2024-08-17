const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const scenarioAssignmentImage = new Schema(
{
    scenarioAssignmentId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "scenarioAssignment",
        required: true,
    },
    image : String,
    isDeleted : Boolean,
},
{ timestamps: true, versionKey: false }
);

const SCENARIO_ASSIGNMENT_IMAGES = mongoose.model("scenarioAssignmentImage", scenarioAssignmentImage);

module.exports = SCENARIO_ASSIGNMENT_IMAGES;
