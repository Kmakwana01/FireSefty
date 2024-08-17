const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const FunctionKeyAnswer = new Schema(
    {
    tacticalDecisionGameId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tacticalDecisionGame',
        require : true
    },
    thinkingPlanningId:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'thinkingPlanning',
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
    thinkingPlanningAnswerType : {
        type: String,
        validate: {
            validator: function (value) {
            const validStatus = ["list", "ratingScale"];
            return validStatus.includes(value);
        },
        message: "Please provide a valid answerType.",
        },
    },
    ratingScale1: String,
    ratingScale2: String,
    isDeleted: Boolean,
    },
    { timestamps: true, versionKey: false }
);





const FUNCTION_KEY_ANSWER = mongoose.model("FunctionKeyAnswer", FunctionKeyAnswer);

module.exports = FUNCTION_KEY_ANSWER;


