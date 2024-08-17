const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const thinkingPlanning = new Schema(
  {
    responseTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "responseType",
      required: true,
    },
    incidentPrioritiesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "incidentPriorities",
      required: true,
    },
    objectivesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "assignment",
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'organization'
    },
    parentId: String,
    selectAnswerType: {
      type: String,
      validate: {
        validator: function (value) {
          const validStatus = ["list", "ratingScale"];
          return validStatus.includes(value);
        },
        message: "Please provide a valid selectAnswerType.",
      },
    },
    selectSliderType: String,
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
    name: String,
    minimumValue: String,
    maximumValue: String,
    minimumValue1: String,
    maximumValue1: String,
    publish: Boolean,
    isDeleted: Boolean,
    isPriorityType: {
      type: Boolean,
      default: false
    },
    originalDataId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'thinkingPlanning'
    },
    isUpdated : Boolean
  },
  { timestamps: true, versionKey: false }
);

const THINKING_PLANNING = mongoose.model("thinkingPlanning", thinkingPlanning);

module.exports = THINKING_PLANNING;
