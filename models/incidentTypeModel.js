const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const incidentType = new Schema(
  {
    responseTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "responseType",
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'organization'
    },
    index: {
      type: Number,
    },
    parentId: String,
    name: String,
    isDeleted: Boolean,
    originalDataId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'incidentType'
    },
    isUpdated : Boolean
  },
  { timestamps: true, versionKey: false }
);

const INCIDENT_TYPE = mongoose.model("incidentType", incidentType);

module.exports = INCIDENT_TYPE;
