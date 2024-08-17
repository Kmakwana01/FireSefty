const mongoose = require('mongoose')
const Schema = mongoose.Schema

const playerRequest = new Schema({
    groupId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'group',
        required : true
    },
    tdgLibraryId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'tdgLibrary',
        required : true
    },
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user',
        required : true
    },
    tacticalDecisionGameId:{
        type : mongoose.Schema.Types.ObjectId,
        ref :'tacticalDecisionGame',
        required :true
    },
    groupPlayId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'groupPlay',
        required :true
    },
    playLaterTime : String,
    status : {
        type : String,
        validate : {
            validator: function(value){
                const validStatus =["pending", "accept", "decline"];
                return validStatus.includes(value);
            },
            message : "Please provide a valid status."
        },
    },
    sendBy : String,
    isDeleted : Boolean,
},{timestamps : true, versionKey : false})

const PLAYER_REQUEST = mongoose.model("playerRequest",playerRequest);
module.exports = PLAYER_REQUEST