
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const group = new Schema(
{
    name : String,
    isDeleted : Boolean,
},
{ timestamps: true, versionKey: false }
);

const GROUP = mongoose.model("group", group);

module.exports = GROUP;
