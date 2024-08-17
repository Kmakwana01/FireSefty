const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const organization = new Schema(
{
    userId :{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    name : String,
    email: String,
    logo : String,
    station : String,
    contactName : String,
    contactNumber : String,
    subscriptionDate : String,
    expireDate : String,
    isDeleted: Boolean ,
    status : {
        type : String,
        validate: {
            validator: function (value) {
            const validStatus = ["green", "yellow", "red"];
            return validStatus.includes(value);
        },
        message: "Please provide a valid status.",
        },
    }
},
{ timestamps: true, versionKey: false }
);

const ORGANIZATION = mongoose.model("organization", organization);

module.exports = ORGANIZATION;
