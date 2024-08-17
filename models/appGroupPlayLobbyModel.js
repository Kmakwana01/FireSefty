const mongoose = require('mongoose')
const Schema = mongoose.Schema

const groupPlayLobby = new Schema({
    file : String,
    type : {
        type : String,
        validate : {
            validator: function(value){
                const validStatus =["image", "video", "audio"];
                return validStatus.includes(value);
            },
            message : "Please provide a valid type."
        },
    },
    isDeleted : Boolean,
},{timestamps : true, versionKey : false})

const GROUP_PLAY_LOBBY = mongoose.model("groupPlayLobby",groupPlayLobby);
module.exports = GROUP_PLAY_LOBBY