const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const incidentPriorities = new Schema(
{
    responseTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "responseType",
        required: true,
    },
    organizationId : {
        type: mongoose.Schema.Types.Mixed,
        ref: 'organization'
    },
    parentId: String,
    index : Number,
    name: String,
    icon: String,
    color: String,
    isDeleted: Boolean,
    originalDataId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'incidentPriorities'
    },
    isUpdated : Boolean
},
{ timestamps: true, versionKey: false }
);

const INCIDENT_PRIORITIES = mongoose.model("incidentPriorities", incidentPriorities);

module.exports = INCIDENT_PRIORITIES;
