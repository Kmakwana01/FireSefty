const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const demo = new Schema(
{
    image : String,
    name: String,
    isDeleted: Boolean,
},
{ timestamps: true, versionKey: false }
);

const DEMO = mongoose.model("demo", demo);

module.exports = DEMO;
