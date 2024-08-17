const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const objectives = new Schema(
    {
        incidentPrioritiesId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "incidentPriorities",
            required: true,
        },
        responseTypeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "responseType",
            required: true,
        },
        organizationId: {
            type: mongoose.Schema.Types.Mixed,
            ref: 'organization'
        },
        index: Number,
        parentId: String,
        name: String,
        isDeleted: Boolean,
        originalDataId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'objectives'
        },
        isUpdated : Boolean
    },
    { timestamps: true, versionKey: false }
);

const OBJECTIVES = mongoose.model("objectives", objectives);

module.exports = OBJECTIVES;
