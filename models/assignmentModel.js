const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const assignment = new Schema(
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
    index: {
      type: Number,
    },
    organizationId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'organization'
    },
    parentId: String,
    name: String,
    isDeleted: Boolean,
    originalDataId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'assignment'
    },
    isUpdated : Boolean
  },
  { timestamps: true, versionKey: false }
);

const ASSIGNMENT = mongoose.model("assignment", assignment);

module.exports = ASSIGNMENT;
