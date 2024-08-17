
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const groupPLayer = new Schema(
{
    groupId : {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'group',
        required: true
    },
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user',
        required: true
    },
    isDeleted : Boolean,
},
{ timestamps: true, versionKey: false }
);

const GROUP_PLAYER = mongoose.model("groupPLayer",groupPLayer);

module.exports = GROUP_PLAYER;
