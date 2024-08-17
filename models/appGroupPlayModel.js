const mongoose = require('mongoose')
const Schema = mongoose.Schema

const groupPlay = new Schema({
    tdgLibraryId : {
        type : mongoose.Schema.Types.ObjectId,
        ref :'tdgLibrary',
        required : true,
    },
    groupId :{
        type : mongoose.Schema.Types.ObjectId,
        ref :'group',
        required : true,
    },
    hostId : {
        type : mongoose.Schema.Types.ObjectId,
        ref :'user',
        required : true,
    },
    groupPlayLobbyId : {
        type : mongoose.Schema.Types.ObjectId,
        ref :'groupPlayLobby',
        
    },
    tacticalDecisionGameId:{
        type : mongoose.Schema.Types.ObjectId,
        ref :'tacticalDecisionGame',
        required :true
    },
    conferencing : String,
    text : String,
    playLaterTime : String,
    gameStatus : {
        type : String,
        validate : {
            validator: function(value){
                const validStatus =["running", "upComing", "complete"];     //-----upComing means game is not played by any user----------
                return validStatus.includes(value);
            },
            message : "Please provide a valid gameStatus."
        },
    },
    playType : {
        type : String,
        validate : {
            validator: function(value){
                const validStatus =["playNow", "playLater"];
                return validStatus.includes(value);
            },
            message : "Please provide a valid playType."
        },
    },
    isDeleted : Boolean
},{timestamps : true, versionKey : false})

const GROUP_PLAY = mongoose.model("groupPlay",groupPlay)
module.exports = GROUP_PLAY
