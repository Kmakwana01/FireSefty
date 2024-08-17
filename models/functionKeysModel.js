const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const functionKey = new Schema(
{
    incidentPrioritiesId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "incidentPriorities",
        required: true,
    },
    actionKeysId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "actionKey",
        required: true,
    },
    isDeleted: Boolean,
},
{ timestamps: true, versionKey: false }
);

const FUNCTION_KEYS = mongoose.model("functionKey", functionKey);

module.exports = FUNCTION_KEYS;