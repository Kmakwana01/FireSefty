const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const scenario = new Schema(
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
    organizationId : {
      type: mongoose.Schema.Types.Mixed,
      ref: 'organization'
    },
    parentId: String,
    scenarioProjectLead: String,
    goal: String,
    incidentAddress: String,
    occupantStatus: String,
    locationAndExtentOfTheFire: String,
    burningRegimeAndExposures: String,
    building: String,
    weather: String,
    narrative: String,
    communicationDispatch: String,
    resources: String,
    selectApparatus: String,
    missionBriefing: String,
    publish: Boolean,
    isDeleted: Boolean,
  },
  { timestamps: true, versionKey: false }
);

const SCENARIO = mongoose.model("scenario", scenario);

module.exports = SCENARIO;
