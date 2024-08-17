const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const scenarioAssignmentBestPractices = new Schema(
{
    scenarioAssignmentId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "scenarioAssignment",
        required: true,
    },
    name : String,
    isDeleted : Boolean,
},
{ timestamps: true, versionKey: false }
);

const SCENARIO_ASSIGNMENT_BEST_PRACTICES = mongoose.model("scenarioAssignmentBestPractices", scenarioAssignmentBestPractices);

module.exports = SCENARIO_ASSIGNMENT_BEST_PRACTICES;
