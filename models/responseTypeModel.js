const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const responseType = new Schema(
{
    organizationId : {
        type: mongoose.Schema.Types.Mixed,
        ref: 'organization'
    },
    parentId: String,
    name : String,
    isDeleted : Boolean,
    index :{
        type: Number,
    },
    originalDataId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'responseType'
    },
    isUpdated : Boolean
},
{ timestamps: true, versionKey: false }
);

const RESPONSE_TYPE = mongoose.model("responseType", responseType);

module.exports = RESPONSE_TYPE;
