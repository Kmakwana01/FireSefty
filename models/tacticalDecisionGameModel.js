const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const tacticalDecisionGame = new Schema(
    {
        tdgLibraryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'tdgLibrary',
            required: true
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'organization'
        },
        parentId: String,
        text: String,
        selectTargetAudience: {
            type: [String],
        },
        timeLimit: String,
        selectAnswerType: {
            type: String,
            validate: {
                validator: function (value) {
                    const validStatus = ["list", "ratingScale", "voiceToText", "functionKeys"];
                    return validStatus.includes(value);
                },
                message: "Please provide a valid selectAnswerType.",
            },
        },
        numeric: String,
        texting: String,
        minimumValue: String,
        maximumValue: String,
        correctAnswer: String,
        minimumValue1: String,
        maximumValue1: String,
        isVoiceToText: Boolean,
        selectLine: String,
        selectPosition: String,
        selectGoals: String,
        selectCategory: String,
        selectDecisivePointName: String,
        selectNumberOfSliders: {
            type: String,
            validate: {
                validator: function (value) {
                    const validStatus = ["singleSlider", "twoSlider"];
                    return validStatus.includes(value);
                },
                message: "Please provide a valid selectNumberOfSliders.",
            },
        },
        isPriorityType: {
            type: Boolean,
            default: false
        },
        originalDataId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'tdgLibrary'
        },
        publish: Boolean,
        isDeleted: Boolean,
        isUpdated : Boolean
    },
    { timestamps: true, versionKey: false }
);

const TACTICAL_DECISION_GAME = mongoose.model("tacticalDecisionGame", tacticalDecisionGame);

module.exports = TACTICAL_DECISION_GAME;
