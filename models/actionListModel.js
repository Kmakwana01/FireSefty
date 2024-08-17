
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const actionList = new Schema(
{
    actionKeysId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "actionKey",
        required: true,
    },
    organizationId : {
        type: mongoose.Schema.Types.Mixed,
        ref: 'organization'
    },
    index : Number,
    parentId: String,
    name: String,
    isDeleted: Boolean,
    originalDataId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'responseType'
    },
    isUpdated : Boolean,
},
{ timestamps: true, versionKey: false }
);

const ACTION_LIST = mongoose.model("actionList", actionList);

module.exports = ACTION_LIST;
