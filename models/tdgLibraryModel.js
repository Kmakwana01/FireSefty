const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const tdgLibrary = new Schema(
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'organization'
    },
    parentId: String,
    name: String,
    goalObjective: String,
    missionBriefing: String,
    text: String,
    audio: String,
    image: String,
    publish : Boolean,
    targetAudience: {
      type: [String],
      // validate: {
      //   validator: function (value) {
      //     const validStatus = ["fireFighter", "officer", "chiefOfficer", "combinations"];
      //     return validStatus.includes(value)
      //   },
      //   message: "Please provide a valid targetAudience.",
      // },
    },
    originalDataId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'tdgLibrary'
    },
    isDeleted: Boolean,
    isUpdated : Boolean
  },
  { timestamps: true, versionKey: false }
);

const TDG_LIBRARY = mongoose.model("tdgLibrary", tdgLibrary);

module.exports = TDG_LIBRARY;
