const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const actionKey = new Schema(
{
    responseTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "responseType",
        required: true,
    },
    organizationId : {
        type: mongoose.Schema.Types.Mixed,
        ref: 'organization',
    },
    index : Number,
    parentId: String,
    name: String,
    icon : String,
    color : String,
    isDeleted: Boolean,
    originalDataId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'actionKey'
    },
    isUpdated : Boolean,
},
{ timestamps: true, versionKey: false }
);

const ACTION_KEYS = mongoose.model("actionKey", actionKey);

module.exports = ACTION_KEYS;
