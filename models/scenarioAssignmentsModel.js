const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const scenarioAssignment = new Schema(
  {
    responseTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "responseType",
      required: true,
    },
    incidentTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "incidentType",
      required: true,
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "assignment",
      required: true,
    },
    scenarioId: {
      type: mongoose.Schema.Types.Mixed,
      ref: "scenario",
      // required: true,
    },
    apparatusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "apparatus",
      required: true,
    },
    organizationId : {
      type: mongoose.Schema.Types.Mixed,
      ref: 'organization'
      },
    parentId: String,
    audio: String,
    video: String,
    gameFromTDG: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tdgLibrary",
      required: true,
    },
    gameInfo: String,
    goalObjective: String,
    missionBriefing: String,
    targetAudience: {
      type: [String],
      // validate: {
      //   validator: function (value) {
      //     const validStatus = [
      //       "fireFighter",
      //       "officer",
      //       "chiefOfficer",
      //       "combinations",
      //     ];
      //     return validStatus.includes(value);
      //   },
      //   message: "Please provide a valid targetAudience.",
      // },
    },
    isDeleted: Boolean,
  },
  { timestamps: true, versionKey: false }
);

const SCENARIO_ASSIGNMENT = mongoose.model("scenarioAssignment", scenarioAssignment);

module.exports = SCENARIO_ASSIGNMENT;
