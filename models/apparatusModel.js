
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const apparatus = new Schema(
{
    organizationId : {
        type: mongoose.Schema.Types.Mixed,
        ref: 'organization'
    },
    parentId: String,
    station: String,
    totalApparatus: String,
    apparatusName: String,
    isDeleted : Boolean,
},
{ timestamps: true, versionKey: false }
);

const APPARATUS = mongoose.model("apparatus", apparatus);

module.exports = APPARATUS;
