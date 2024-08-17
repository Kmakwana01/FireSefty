const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const profile = new Schema(
{
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "organization",
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    rank: {
        type: String,
        validate: {
        validator: function (value) {
            const validStatus = ["fireFighter", "officer", "chiefOfficer", "Combinations"];
            return validStatus.includes(value); 
        },
        message: "Please provide a valid rank.",
        },
    },
    shift : {
        type: String,
        validate: {
        validator: function (value) {
            const validStatus = ["day", "night","A" ,"B" , "C" , "D"];
            return validStatus.includes(value);
        },
        message: "Please provide a valid shift.",
        },
    },
    profileName: String,
    profileImage : String,
    station: String,
    isDeleted: Boolean,
},
{ timestamps: true, versionKey: false }
);

const PROFILE = mongoose.model("profile", profile);

module.exports = PROFILE;
