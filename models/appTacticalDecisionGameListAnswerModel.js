const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const tacticalDecisionGameListAnswer = new Schema(
    {
    tacticalDecisionGameId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tacticalDecisionGame',
        require : true
    },
    tdgLibraryId:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'tdgLibrary',
        require : true,
    },
    imageId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'tacticalDecisionGameImage',
        require : true,
    },
    answerId :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'tacticalDecisionGameAddAnswer',
        require : true,
    },
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user',
        require : true,
    },
    groupPlayId :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'groupPlay'
    },
    answerType : {
        type: String,
        validate: {
            validator: function (value) {
            const validStatus = ["list", "ratingScale", "voiceToText", "functionKeys"];
            return validStatus.includes(value);
        },
        message: "Please provide a valid answerType.",
        },
    },
    ratingScale1: String,
    ratingScale2: String,
    answer: String,
    isDeleted: Boolean,
    },
    { timestamps: true, versionKey: false }
);

const TACTICAL_DECISION_GAME_LIST_ANSWER = mongoose.model("tacticalDecisionGameListAnswer", tacticalDecisionGameListAnswer);

module.exports = TACTICAL_DECISION_GAME_LIST_ANSWER;
