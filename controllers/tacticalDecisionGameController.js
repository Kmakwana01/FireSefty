const TACTICAL_DECISION_GAME = require("../models/tacticalDecisionGameModel");
const TACTICAL_DECISION_GAME_IMAGE = require("../models/tacticalDecisionGameImageModel");
const TACTICAL_DECISION_GAME_ADD_ANSWER = require("../models/tacticalDecisionGameAddAnswerModel");
const BEST_PRACTICES_DECISION_GAME = require("../models/bestPracticesDecisionGameModel")
const TACTICAL_DECISION_GAME_RATING_SCALE_TEXT = require("../models/tacticalDecisionGameRatingScaleTextModel");
const ORGANIZATION = require("../models/organizationModel");
const TDG_LIBRARY = require("../models/tdgLibraryModel");
const TACTICAL_FUNCTION = require("../models/tacticalFunctionModel");
const OBJECTIVES = require("../models/objectivesModel");
const INCIDENT_PRIORITIES = require("../models/incidentPrioritiesModel")
var ACTION_KEYS = require('../models/actionKeysModel');
var ACTION_LIST = require('../models/actionListModel');
var GROUP_PLAY = require('../models/appGroupPlayModel');
var HOST_REQUEST = require('../models/appHostRequestModel');
var PLAYER_REQUEST = require('../models/appPlayerRequestModel');
const { isBoolean, compareObjects } = require("../utility/date");
const PROFILE = require('../models/profileModel')

// const allowedAudioFormats = [
//   "audio/mpeg",
//   "audio/wav",
//   "audio/aac",
//   "audio/mp3",
// ];

const allowedAudioFormats = [
  "audio/mpeg",
  "audio/wav",
  "audio/aac",
  "audio/mp3",
];

const allowedImageFormats = [
  "image/jpeg", // JPEG
  "image/png",  // Portable Network Graphics
  "image/gif",  // Graphics Interchange Format
  "image/webp", // WebP image format
];


exports.createTacticalDecisionGame = async function (req, res, next) {
  try {

    var tdgLibraryId = req.body.tdgLibraryId;
    if (!tdgLibraryId) {
      throw new Error('tdgLibraryId is required.')
    } else if (!req.body.text) {
      throw new Error('text is required.')
    } else if (!req.body.timeLimit) {
      throw new Error('timeLimit is required.')
    } else if (!req.body.text) {
      throw new Error('text is required.')
    }
    let { selectNumberOfSliders, maximumValue, minimumValue, maximumValue1, minimumValue1, correctAnswer } = req.body;

    if (req.body.selectAnswerType === "ratingScale") {
      if (!selectNumberOfSliders) {
        throw new Error("please enter a selectNumberOfSliders")
      }
      if (req.body.numeric === "false" && req.body.texting === "false") {
        throw new Error("Both numeric and texting are false. Specify at least one as required.");
      }
      if (req.body.numeric === "true") {
        if (selectNumberOfSliders !== "singleSlider" && selectNumberOfSliders !== 'twoSlider') {
          throw new Error('please enter valid selectNumberOfSliders.')
        }
        if (selectNumberOfSliders === 'singleSlider') {
          if (!minimumValue || minimumValue === ("null" || null)) {
            throw new Error("minimumValue is required.")
          } else if (!maximumValue || maximumValue === ("null" || null)) {
            throw new Error("maximumValue is required.")
          } 
        } else if (selectNumberOfSliders === 'twoSlider') {
          if (!minimumValue) {
            throw new Error("Please enter a minimum value.")
          } else if (!maximumValue) {
            throw new Error("Please enter a maximum value.")
          } else if (!minimumValue1) {
            throw new Error("Please enter a minimum1 value.")
          } else if (!maximumValue1) {
            throw new Error("Please enter a maximum1 value.")
          }
        }
      } else if (req.body.texting === "true") {
        if (selectNumberOfSliders !== "singleSlider" && selectNumberOfSliders !== 'twoSlider') {
          throw new Error('please enter valid selectNumberOfSliders.')
        }
        if (!req.body.texts) {
          throw new Error("Please enter the texts.")
        }
        if (selectNumberOfSliders === 'twoSlider') {
          if (!req.body.texts1) {
            throw new Error('Please enter the texts1.');
          }
        }
      }
    }

    var tdgLibrary = await TDG_LIBRARY.findOne({ _id: tdgLibraryId })
    if (!tdgLibrary) {
      throw new Error('tdg library is not found')
    } else if (tdgLibrary.isDeleted === true) {
      throw new Error('tdg library is already deleted')
    }
    // const audioFile = req.files.filter(file => file.fieldname.startsWith('audio'));
    // const imageFile = req.files.filter(file => file.fieldname.startsWith('image'));

    // if (imageFile.length < 1) {
    //   throw new Error("'image' file is required.");
    // }

    let pairs = [];

    for (let i = 0; i < req.files.length; i++) {
      const currentFile = req.files[i];
      if (currentFile.fieldname.startsWith('image')) {
        const fileIndex = parseInt(currentFile.fieldname.split('.')[1], 10);
        console.log(fileIndex, "fileIndex");
        const imageFile = currentFile.filename;
        console.log(imageFile, "imageFile");
        let audioFile = null;

        if (i < req.files.length - 1 && req.files[i + 1].fieldname === `image.${fileIndex}.audio`) {
          const nextFile = req.files[i + 1];

          const maxSize = 10 * 1024 * 1024; // 10MB
          if (nextFile.size > maxSize) {
            throw new Error("Audio file size exceeds the maximum allowed size.");
          }

          if (allowedAudioFormats.includes(nextFile.mimetype)) {
            audioFile = nextFile.filename;
            i++;
          }
        }

        pairs.push({
          image: req.protocol + "://" + req.get("host") + "/images/" + imageFile,
          audio: audioFile ? req.protocol + "://" + req.get("host") + "/images/" + audioFile : null,
        });
      }
    }

    // for (let index = 0; index < req.files.length; index++) {
    //   const audioField = req.files.find(file => file.fieldname === `audio${index}`);
    //   const imageField = req.files.find(file => file.fieldname === `image${index}`);

    //   const url1 = audioField ? req.protocol + "://" + req.get("host") + "/" + "images/" + audioField.filename : null;
    //   const url = imageField ? req.protocol + "://" + req.get("host") + "/" + "images/" + imageField.filename : null;

    //   if (url1 != null || url != null) {
    //     pairs.push({ audio: url1, image: url });
    //   }
    // }
    // console.log("^^^^^ " + pairs.length);

    // if (audioFile.length > 0) {
    //   for (let index = 0; index < audioFile?.length; index++) {
    //     const element = audioFile[index];
    //     if (!allowedAudioFormats.includes(element?.mimetype)) {
    //       throw new Error("Invalid audio format. Allowed formats are: " + allowedAudioFormats.join(", "));
    //     }

    //     const maxSize = 10 * 1024 * 1024; // 10MB
    //     if (element.size > maxSize) {
    //       throw new Error("Audio file size exceeds the maximum allowed size.");
    //     }
    //   }
    // }

    if (req.role === "superAdmin") {

      var selectedAudience;

      if (typeof req.body.selectTargetAudience === "string") {
        selectedAudience = JSON.parse(req.body.selectTargetAudience);
      } else {
        selectedAudience = req.body.selectTargetAudience;
      }

      var tacticalDecisionGame = await TACTICAL_DECISION_GAME.create({
        tdgLibraryId: tdgLibraryId,
        organizationId: null,
        parentId: null,
        text: req.body.text,
        selectTargetAudience: selectedAudience || [],
        timeLimit: req.body.timeLimit,
        selectAnswerType: req.body.selectAnswerType,
        publish: req.body.publish || false,
        correctAnswer: req.body.correctAnswer || null,
        selectLine: null,
        selectPosition: null,
        selectGoals: null,
        selectCategory: null,
        selectDecisivePointName: null,
        numeric: req.body.numeric,
        texting: req.body.texting,
        isPriorityType: req.body.priorityType,
        isDeleted: false,
        isUpdated: false
      });

      if (pairs.length > 0) {
        for (let i = 0; i < pairs.length; i++) {
          const pair = pairs[i];
          let tact_Game = await TACTICAL_DECISION_GAME_IMAGE.create({
            tacticalDecisionGameId: tacticalDecisionGame.id,
            image: pair.image ? pair.image : null,
            audio: pair.audio ? pair.audio : null,
            answer: req.body[`image.${i}.answer`],
            isDeleted: false
          });
          console.log(`Index: ${i}, ID: ${tact_Game._id}`);
        }
      }

      const bestNames = req.body.bestNames || [];
      const bestPracticesArray = [];
      for (const bestName of bestNames) {
        const bestPracticesDecisionGame = await BEST_PRACTICES_DECISION_GAME.create({
          tacticalDecisionGameId: tacticalDecisionGame.id,
          name: bestName,
          isDeleted: false,
        });
        bestPracticesArray.push(bestPracticesDecisionGame);
      }

      //console.log("bestPracticesArray",bestPracticesArray);
      if (req.body.selectAnswerType === "list") {
        var addAnswerTypesArray = [];

        let addAnswerTypes;
        if (Array.isArray(req.body.addAnswerType)) {
          addAnswerTypes = req.body.addAnswerType;
        } else {
          addAnswerTypes = JSON.parse(req.body.addAnswerType);
        }
        if (!addAnswerTypes || addAnswerTypes.length === 0 || addAnswerTypes[0] === "" || addAnswerTypes[1] === "") {
          throw new Error("addAnswer is required.")
        }

        if (addAnswerTypes.length < 2) {
          throw new Error("At least two addAnswerTypes are required.");
        }

        if (addAnswerTypes && addAnswerTypes.length > 0) {
          const promises = addAnswerTypes.map(async (item) => {
            const { answer, position } = item;
            return await TACTICAL_DECISION_GAME_ADD_ANSWER.create({
              tacticalDecisionGameId: tacticalDecisionGame.id,
              answer: answer,
              position: position || 0,
              isDeleted: false,
            });
          });
          await Promise.all(promises);
        }
      } else if (req.body.selectAnswerType === "ratingScale") {
        if (req.body.numeric === "true") {
          if (req.body.selectNumberOfSliders === 'singleSlider') {
            var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
              minimumValue: req.body.minimumValue || null,
              maximumValue: req.body.maximumValue || null,
              correctAnswer: req.body.correctAnswer || null,
              selectNumberOfSliders: req.body.selectNumberOfSliders || null
            }, { new: true })
          }

          else if (req.body.selectNumberOfSliders === 'twoSlider') {
            var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
              minimumValue: req.body.minimumValue || null,
              maximumValue: req.body.maximumValue || null,
              minimumValue1: req.body.minimumValue1 || null,
              maximumValue1: req.body.maximumValue1 || null,
              correctAnswer: req.body.correctAnswer || null,
              selectNumberOfSliders: req.body.selectNumberOfSliders || null
            }, { new: true })
          }
        } else if (req.body.texting === "true") {

          var texts;
          if (typeof req.body.texts === 'string') {
            texts = req.body.texts ? JSON.parse(req.body.texts) : [];
          } else {
            texts = req.body.texts ? req.body.texts : [];
          }

          if (req.body.selectNumberOfSliders === 'singleSlider') {

            var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
              selectNumberOfSliders: req.body.selectNumberOfSliders || null
            }, { new: true })

            var ratingTexts = [];
            for (let index = 0; index < texts.length; index++) {
              const element = texts[index];
              var ratingText = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.create({
                tacticalDecisionGameId: tacticalDecisionGame.id,
                slider: element.slider,
                position: element.position,
                actualPriority: element.actualPriority,
                ratingScaleText: element.text,
                isDeleted: false,
              });
              ratingTexts.push(ratingText);
            }

          } else if (req.body.selectNumberOfSliders === 'twoSlider') {

            var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
              selectNumberOfSliders: req.body.selectNumberOfSliders
            }, { new: true })

            var ratingTexts = [];

            if (typeof req.body.texts1 === 'string') {
              texts1 = req.body.texts1 ? JSON.parse(req.body.texts1) : [];
            } else {
              texts1 = req.body.texts1 ? req.body.texts1 : [];
            }

            for (let index = 0; index < texts1.length; index++) {
              const element = texts1[index];
              var ratingText = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.create({
                tacticalDecisionGameId: tacticalDecisionGame.id,
                slider: element.slider,
                position: element.position,
                actualPriority: element.actualPriority,
                ratingScaleText: element.text,
                isDeleted: false,
              });
              ratingTexts.push(ratingText);
            }
            for (let index = 0; index < texts.length; index++) {
              const element = texts[index];
              var ratingText = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.create({
                tacticalDecisionGameId: tacticalDecisionGame.id,
                slider: element.slider,
                position: element.position,
                actualPriority: element.actualPriority,
                ratingScaleText: element.text,
                isDeleted: false,
              });
              ratingTexts.push(ratingText);
            }

          } else {
            throw new Error('please provide valid selectNumberOfSliders.')
          }
        }
      } else if (req.body.selectAnswerType === "voiceToText") {
        console.log("voiceToText");

        var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
          isVoiceToText: req.body.isVoiceToText,
        }, { new: true })
        // console.log(tacticalDecisionGame);

      } else if (req.body.selectAnswerType === "functionKeys") {
        // console.log("functionKeys", req.body);

        var incidentPrioritiesIds = req.body.incidentPrioritiesId || [];
        var actionKeyIds = req.body.actionKeyId || [];

        if (!incidentPrioritiesIds || incidentPrioritiesIds.length === 0 || [0].some(index => incidentPrioritiesIds[index] === '')) {
          throw new Error('incidentPrioritiesId is required.');
        }
        if (!actionKeyIds || actionKeyIds.length === 0 || [0].some(index => actionKeyIds[index] === '')) {
          throw new Error('actionKeyId is required.');
        }

        // Create a new TACTICAL_FUNCTION entry with the same tacticalDecisionGameId for each incidentPrioritiesId
        for (let i = 0; i < incidentPrioritiesIds.length; i++) {
          const tacticalFunctionIncident = await TACTICAL_FUNCTION.create({
            tacticalDecisionGameId: tacticalDecisionGame.id,
            idType: 'incidentPriorities',
            incidentPrioritiesId: incidentPrioritiesIds[i] || null,
          });
          console.log("Created Tactical Function with Incident Priorities: ", tacticalFunctionIncident);
        }

        // Create a new TACTICAL_FUNCTION entry with the same tacticalDecisionGameId for each actionKeyId
        for (let i = 0; i < actionKeyIds.length; i++) {
          const tacticalFunctionAction = await TACTICAL_FUNCTION.create({
            tacticalDecisionGameId: tacticalDecisionGame.id,
            idType: 'actionKeys',
            actionKeysId: actionKeyIds[i] || null,
          });
          console.log("Created Tactical Function with Action Key: ", tacticalFunctionAction);
        }
      }
    }

    else if (req.role === "organization") {

      var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
      var tdg = await TDG_LIBRARY.findOne({ _id: tdgLibraryId, organizationId: organizationFind._id })

      if (!tdg) {
        throw new Error("TDG not created by your organization.")
      } else if (tdg.isDeleted === true) {
        throw new Error("This TDG is already deleted.")
      }

      var selectedAudience;
      if (typeof req.body.selectTargetAudience === "string") {
        selectedAudience = JSON.parse(req.body.selectTargetAudience);
      } else {
        selectedAudience = req.body.selectTargetAudience;
      }

      var tacticalDecisionGame = await TACTICAL_DECISION_GAME.create({
        tdgLibraryId: tdgLibraryId,
        organizationId: organizationFind.id,
        parentId: null,
        text: req.body.text,
        selectTargetAudience: selectedAudience || [],
        timeLimit: req.body.timeLimit,
        selectAnswerType: req.body.selectAnswerType,
        numeric: req.body.numeric,
        texting: req.body.texting,
        publish: req.body.publish || false,
        isPriorityType: req.body.priorityType || false,
        isDeleted: false,
        correctAnswer: req.body.correctAnswer || null,
        selectLine: null,
        selectPosition: null,
        selectGoals: null,
        selectCategory: null,
        selectDecisivePointName: null,
        numeric: req.body.numeric,
        texting: req.body.texting,
        isPriorityType: req.body.priorityType,
        isDeleted: false,
        isUpdated: false
      });
      // console.log("tacticalDecisionGame", tacticalDecisionGame);

      // if (pairs.length > 0) {
      //   for (const pair of pairs) {
      //     await TACTICAL_DECISION_GAME_IMAGE.create({
      //       tacticalDecisionGameId: tacticalDecisionGame.id,
      //       image: pair.image ? pair.image : null,
      //       audio: pair.audio ? pair.audio : null,
      //       isDeleted: false
      //     });
      //   }
      // }
      if (pairs.length > 0) {
        for (let i = 0; i < pairs.length; i++) {
          const pair = pairs[i];
          let tact_Game = await TACTICAL_DECISION_GAME_IMAGE.create({
            tacticalDecisionGameId: tacticalDecisionGame.id,
            image: pair.image ? pair.image : null,
            audio: pair.audio ? pair.audio : null,
            answer: req.body[`image.${i}.answer`],
            isDeleted: false
          });
          console.log(`Index: ${i}, ID: ${tact_Game._id}`);
        }
      }

      const bestNames = req.body.bestNames || [];
      const bestPracticesArray = [];
      for (const bestName of bestNames) {
        const bestPracticesDecisionGame = await BEST_PRACTICES_DECISION_GAME.create({
          tacticalDecisionGameId: tacticalDecisionGame.id,
          name: bestName,
          isDeleted: false,
        });
        bestPracticesArray.push(bestPracticesDecisionGame);
      }
      //console.log("bestPracticesArray",bestPracticesArray);
      if (req.body.selectAnswerType === "list") {
        let addAnswerTypes;

        if (Array.isArray(req.body.addAnswerType)) {
          addAnswerTypes = req.body.addAnswerType;
        } else {
          addAnswerTypes = JSON.parse(req.body.addAnswerType);
        }
        if (!addAnswerTypes || addAnswerTypes.length === 0 || addAnswerTypes[0] === "" || addAnswerTypes[1] === "") {
          throw new Error("addAnswer is required.")
        }

        if (addAnswerTypes.length < 2) {
          throw new Error("At least two addAnswerTypes are required.");
        }

        if (addAnswerTypes && addAnswerTypes.length > 0) {
          const promises = addAnswerTypes.map(async (item) => {
            const { answer, position } = item;
            return await TACTICAL_DECISION_GAME_ADD_ANSWER.create({
              tacticalDecisionGameId: tacticalDecisionGame.id,
              answer: answer,
              position: position || 0,
              isDeleted: false,
            });
          });
          await Promise.all(promises);
        }

      } else if (req.body.selectAnswerType === "ratingScale") {
        if (req.body.numeric === "true") {
          if (req.body.selectNumberOfSliders === 'singleSlider') {
            var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
              minimumValue: req.body.minimumValue || null,
              maximumValue: req.body.maximumValue || null,
              correctAnswer: req.body.correctAnswer || null,
              selectNumberOfSliders: req.body.selectNumberOfSliders
            }, { new: true })
          }

          else if (req.body.selectNumberOfSliders === 'twoSlider') {
            var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
              minimumValue: req.body.minimumValue || null,
              maximumValue: req.body.maximumValue || null,
              minimumValue1: req.body.minimumValue1 || null,
              maximumValue1: req.body.maximumValue1 || null,
              correctAnswer: req.body.correctAnswer || null,
              selectNumberOfSliders: req.body.selectNumberOfSliders
            }, { new: true })
          }
        } else if (req.body.texting === "true") {

          var texts;
          if (typeof req.body.texts === 'string') {
            texts = req.body.texts ? JSON.parse(req.body.texts) : [];
          } else {
            texts = req.body.texts ? req.body.texts : [];
          }

          if (req.body.selectNumberOfSliders === 'singleSlider') {

            var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
              selectNumberOfSliders: req.body.selectNumberOfSliders
            }, { new: true })

            var ratingTexts = [];
            for (let index = 0; index < texts.length; index++) {
              const element = texts[index];
              var ratingText = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.create({
                tacticalDecisionGameId: tacticalDecisionGame.id,
                slider: element.slider,
                position: element.position,
                actualPriority: element.actualPriority,
                ratingScaleText: element.text,
                isDeleted: false,
              });
              ratingTexts.push(ratingText);
            }

          } else if (req.body.selectNumberOfSliders === 'twoSlider') {

            var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
              selectNumberOfSliders: req.body.selectNumberOfSliders
            }, { new: true })

            var ratingTexts = [];

            var texts1;
            if (typeof req.body.texts1 === 'string') {
              texts1 = req.body.texts1 ? JSON.parse(req.body.texts1) : [];
            } else {
              texts1 = req.body.texts1 ? req.body.texts1 : [];
            }
            for (let index = 0; index < texts1.length; index++) {
              const element = texts1[index];
              var ratingText = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.create({
                tacticalDecisionGameId: tacticalDecisionGame.id,
                slider: element.slider,
                position: element.position,
                actualPriority: element.actualPriority,
                ratingScaleText: element.text,
                isDeleted: false,
              });
              ratingTexts.push(ratingText);
            }
            for (let index = 0; index < texts.length; index++) {
              const element = texts[index];
              var ratingText = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.create({
                tacticalDecisionGameId: tacticalDecisionGame.id,
                slider: element.slider,
                position: element.position,
                actualPriority: element.actualPriority,
                ratingScaleText: element.text,
                isDeleted: false,
              });
              ratingTexts.push(ratingText);
            }

          } else {
            throw new Error('please provide valid selectNumberOfSliders.')
          }
        }
      } else if (req.body.selectAnswerType === "voiceToText") {
        console.log("voiceToText");

        var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
          isVoiceToText: req.body.isVoiceToText,
        }, { new: true })

      } else if (req.body.selectAnswerType === "functionKeys") {
        console.log("functionKeys");

        var incidentPrioritiesIds = req.body.incidentPrioritiesId || [];
        var actionKeyIds = req.body.actionKeyId || [];

        if (!incidentPrioritiesIds || incidentPrioritiesIds.length === 0 || [0].some(index => incidentPrioritiesIds[index] === '')) {
          throw new Error('incidentPrioritiesId is required.');
        }
        if (!actionKeyIds || actionKeyIds.length === 0 || [0].some(index => actionKeyIds[index] === '')) {
          throw new Error('actionKeyId is required.');
        }


        // Create a new TACTICAL_FUNCTION entry with the same tacticalDecisionGameId for each incidentPrioritiesId
        for (let i = 0; i < incidentPrioritiesIds.length; i++) {
          const tacticalFunctionIncident = await TACTICAL_FUNCTION.create({
            tacticalDecisionGameId: tacticalDecisionGame.id,
            idType: 'incidentPriorities',
            incidentPrioritiesId: incidentPrioritiesIds[i] || null,
          });
        }

        // Create a new TACTICAL_FUNCTION entry with the same tacticalDecisionGameId for each actionKeyId
        for (let i = 0; i < actionKeyIds.length; i++) {
          const tacticalFunctionAction = await TACTICAL_FUNCTION.create({
            tacticalDecisionGameId: tacticalDecisionGame.id,
            idType: 'actionKeys',
            actionKeysId: actionKeyIds[i] || null,
          });
          console.log("Created Tactical Function with Action Key: ", tacticalFunctionAction);
        }
      }
    }
    else {
      throw new Error("You can not access.");
    }

    var FIND = await TACTICAL_DECISION_GAME.findById(tacticalDecisionGame.id);
    var findImage = await TACTICAL_DECISION_GAME_IMAGE.find({ tacticalDecisionGameId: tacticalDecisionGame.id });
    var findAddAnswerType = await TACTICAL_DECISION_GAME_ADD_ANSWER.find({ tacticalDecisionGameId: tacticalDecisionGame.id });
    // console.log("findAddAnswerType", findAddAnswerType);
    var findBestPractices = await BEST_PRACTICES_DECISION_GAME.find({ tacticalDecisionGameId: tacticalDecisionGame.id });
    // console.log("findBestPractices", findBestPractices);
    var findRatingScaleText = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.find({ tacticalDecisionGameId: tacticalDecisionGame.id });
    // console.log("findRatingScaleText", findRatingScaleText);
    // var findTacticalFunction = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: tacticalDecisionGame.id })
    var findTacticalFunctionIncident = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: tacticalDecisionGame.id, idType: 'incidentPriorities' })
    // console.log("findTacticalFunctionIncident", findTacticalFunctionIncident);
    var findTacticalFunctionAction = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: tacticalDecisionGame.id, idType: 'actionKeys' })
    // console.log("findTacticalFunctionAction", findTacticalFunctionAction);

    var objectivesPromisesIncident = findTacticalFunctionIncident.map(async (o) => {
      var incidentPriorities = await INCIDENT_PRIORITIES.findOne(({ _id: o.incidentPrioritiesId }))

      if (incidentPriorities) {
        if (incidentPriorities.icon || incidentPriorities.icon !== "" || incidentPriorities.icon !== null) {
          incidentPriorities.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + incidentPriorities.icon;
        }
      }

      var actionKeys = await ACTION_KEYS.findOne({ _id: o.actionKeysId })

      if (actionKeys) {
        if (actionKeys.icon || actionKeys.icon !== "" || actionKeys.icon !== null) {
          actionKeys.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + actionKeys.icon;
        }
      }

      var objectivesFind = await OBJECTIVES.find({ incidentPrioritiesId: o.incidentPrioritiesId });
      var actionListFind = await ACTION_LIST.find({ actionKeysId: o.actionKeysId });
      return {
        actionLists: actionListFind || null,
        incidentPrioritiesId: o.incidentPrioritiesId || null,
        incidentPrioritiesName: incidentPriorities || null,
        tacticalDecisionGameId: o.tacticalDecisionGameId || null,
        idType: o.idType || null,
        objectives: objectivesFind || null,
      };
    });

    var objectivesPromisesAction = findTacticalFunctionAction.map(async (o) => {
      var incidentPriorities = await INCIDENT_PRIORITIES.findOne(({ _id: o.incidentPrioritiesId }))
      if (incidentPriorities) {
        if (incidentPriorities.icon || incidentPriorities.icon !== "" || incidentPriorities.icon !== null) {
          incidentPriorities.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + incidentPriorities.icon;
        }
      }

      var actionKeys = await ACTION_KEYS.findOne({ _id: o.actionKeysId, isDeleted: false })
      if (actionKeys) {
        if (actionKeys.icon || actionKeys.icon !== "" || actionKeys.icon !== null) {
          actionKeys.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + actionKeys.icon;
        }
      }

      var objectivesFind = await OBJECTIVES.find({ incidentPrioritiesId: o.incidentPrioritiesId });
      var actionListFind = await ACTION_LIST.find({ actionKeysId: o.actionKeysId });
      return {
        actionKeyId: o.actionKeysId || null,
        actionKeyName: actionKeys || null,
        actionLists: actionListFind || null,
        tacticalDecisionGameId: o.tacticalDecisionGameId || null,
        idType: o.idType || null,
        objectives: objectivesFind || null,
      };
    });
    var objectivesDataIncident = await Promise.all(objectivesPromisesIncident);
    var objectivesDataAction = await Promise.all(objectivesPromisesAction);

    var object = [];
    if (findImage.length > 0) {
      for (let index = 0; index < findImage.length; index++) {
        const element = findImage[index];
        object.push({ 'image': element.image ? element.image : null, 'audio': element.audio ? element.audio : null ,  'answer' : element.answer  });
      }
    }


    var response = {
      tacticalDecisionGameId: FIND.id,
      tdgLibraryId: FIND.tdgLibraryId,
      organizationId: FIND.organizationId,
      parentId: FIND.parentId,
      text: FIND.text,
      image: object,
      addAnswerTypes: findAddAnswerType,
      selectNumberOfSliders: FIND.selectNumberOfSliders,
      bestNames: findBestPractices,
      Texts: findRatingScaleText,
      selectTargetAudience: FIND.selectTargetAudience,
      timeLimit: FIND.timeLimit,
      selectAnswerType: FIND.selectAnswerType,
      minimumValue: FIND.minimumValue,
      maximumValue: FIND.maximumValue,
      minimumValue1: FIND.minimumValue1,
      maximumValue1: FIND.maximumValue1,
      correctAnswer: FIND.correctAnswer,
      isVoiceToText: FIND.isVoiceToText,
      selectLine: FIND.selectLine,
      selectPosition: FIND.selectPosition,
      selectGoals: FIND.selectGoals,
      selectCategory: FIND.selectCategory,
      selectDecisivePointName: FIND.selectDecisivePointName,
      tacticalFunctionWithObjectivesIncident: objectivesDataIncident,
      tacticalFunctionWithObjectivesAction: objectivesDataAction,
      isDeleted: FIND.isDeleted,
      priorityType: FIND.isPriorityType,
      publish: FIND.publish,
      listAnswerType: addAnswerTypesArray,
      numeric: FIND.numeric,
      texting: FIND.texting,
      createdAt: FIND.createdAt,
      updatedAt: FIND.updatedAt,
    };
    //  listAnswerType: (addAnswerTypesArray.length > 0) ? addAnswerTypesArray : []

    res.status(200).json({
      status: "success",
      message: "Tactical Decision Game is now created successfully.",
      data: response
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

exports.getTacticalDecisionGame = async function (req, res, next) {
  try {

    var id = req.params.id;
    console.log("ROLE : -", req.role);
    if (req.role === "superAdmin") {
      var FIND = await TACTICAL_DECISION_GAME.find({ tdgLibraryId: id, isDeleted: false }).populate('tdgLibraryId')
      var response = await Promise.all(FIND.map(async (record) => {
        var findImage = await TACTICAL_DECISION_GAME_IMAGE.find({ tacticalDecisionGameId: record._id })
        //console.log("findImage",findImage);
        var findAddAnswerType = await TACTICAL_DECISION_GAME_ADD_ANSWER.find({ tacticalDecisionGameId: record._id })
        //console.log("findAddAnswerType",findAddAnswerType);
        var findBestPractices = await BEST_PRACTICES_DECISION_GAME.find({ tacticalDecisionGameId: record._id })
        //console.log("findBestPractices",findBestPractices);
        var findRatingScaleText = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.find({ tacticalDecisionGameId: record._id })
        //console.log("findRatingScaleText",findRatingScaleText);
        var findTacticalFunctionIncident = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: record._id, idType: 'incidentPriorities' })
        console.log("findTacticalFunctionIncident", findTacticalFunctionIncident);
        var findTacticalFunctionAction = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: record._id, idType: 'actionKeys' })
        // console.log("findTacticalFunctionAction", findTacticalFunctionAction);

        var objectivesPromisesIncident = findTacticalFunctionIncident.map(async (o) => {
          var incidentPriorities = await INCIDENT_PRIORITIES.findOne(({ _id: o.incidentPrioritiesId }))

          if (incidentPriorities) {
            if (incidentPriorities.icon || incidentPriorities.icon !== "" || incidentPriorities.icon !== null) {

              incidentPriorities.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + incidentPriorities.icon;
            }
          }


          var actionKeys = await ACTION_KEYS.findOne({ _id: o.actionKeysId })

          if (actionKeys) {
            if (actionKeys.icon || actionKeys.icon !== "" || actionKeys.icon !== null) {
              actionKeys.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + actionKeys.icon;
            }
          }

          var objectivesFind = await OBJECTIVES.find({ incidentPrioritiesId: o.incidentPrioritiesId });
          var actionListFind = await ACTION_LIST.find({ actionKeysId: o.actionKeysId });
          return {
            actionLists: actionListFind || null,
            incidentPrioritiesId: o.incidentPrioritiesId || null,
            incidentPrioritiesName: incidentPriorities || null,
            tacticalDecisionGameId: o.tacticalDecisionGameId || null,
            idType: o.idType || null,
            objectives: objectivesFind || null,
          };
        });

        var objectivesPromisesAction = findTacticalFunctionAction.map(async (o) => {
          var incidentPriorities = await INCIDENT_PRIORITIES.findOne(({ _id: o.incidentPrioritiesId }))
          if (incidentPriorities) {
            if (incidentPriorities.icon || incidentPriorities.icon !== "" || incidentPriorities.icon !== null) {
              incidentPriorities.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + incidentPriorities.icon;
            }
          }

          var actionKeys = await ACTION_KEYS.findOne({ _id: o.actionKeysId, isDeleted: false })
          if (actionKeys) {
            if (actionKeys.icon || actionKeys.icon !== "" || actionKeys.icon !== null) {
              actionKeys.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + actionKeys.icon;
            }
          }

          var objectivesFind = await OBJECTIVES.find({ incidentPrioritiesId: o.incidentPrioritiesId });
          var actionListFind = await ACTION_LIST.find({ actionKeysId: o.actionKeysId });
          return {
            actionKeyId: o.actionKeysId || null,
            actionKeyName: actionKeys || null,
            actionLists: actionListFind || null,
            tacticalDecisionGameId: o.tacticalDecisionGameId || null,
            idType: o.idType || null,
            objectives: objectivesFind || null,
          };
        });

        var objectivesDataIncident = await Promise.all(objectivesPromisesIncident);
        var objectivesDataAction = await Promise.all(objectivesPromisesAction);

        var object = [];

        if (findImage.length > 0) {
          for (let index = 0; index < findImage.length; index++) {
            const element = findImage[index];
            object.push({ 'image': element.image, 'audio': element.audio ? element.audio : null ,  'answer' : element.answer   })
          }
        }


        var obj = {
          tdgLibraryId: record.tdgLibraryId.id || null,
          tdgGameName: record.tdgLibraryId.name,
          goalObjective: record.tdgLibraryId.goalObjective || null,
          missionBriefing: record.tdgLibraryId.missionBriefing || null,
          tacticalDecisionGameId: record.id || null,
          text: record.text || null,
          image: object || null,
          addAnswerTypes: findAddAnswerType || null,
          bestNames: findBestPractices || null,
          texts: findRatingScaleText || null,
          selectTargetAudience: record.selectTargetAudience || null,
          timeLimit: record.timeLimit || null,
          selectAnswerType: record.selectAnswerType || null,
          selectNumberOfSliders: record.selectNumberOfSliders || null,
          numeric: record.numeric,
          texting: record.texting,
          publish: record.publish,
          minimumValue: record.minimumValue || null,
          maximumValue: record.maximumValue || null,
          minimumValue1: record.minimumValue1 || null,
          maximumValue1: record.maximumValue1 || null,
          correctAnswer: record.correctAnswer || null,
          isVoiceToText: record.isVoiceToText || null,
          selectLine: record.selectLine || null,
          selectPosition: record.selectPosition || null,
          selectGoals: record.selectGoals || null,
          selectCategory: record.selectCategory || null,
          selectDecisivePointName: record.selectDecisivePointName || null,
          priorityType: record.isPriorityType,
          tacticalFunctionWithObjectivesIncident: objectivesDataIncident,
          tacticalFunctionWithObjectivesAction: objectivesDataAction,
          isDeleted: record.isDeleted || null,
          createdAt: record.createdAt || null,
          updatedAt: record.updatedAt || null
        }
        return obj;
      }))
      //console.log("response ", response);
    } else if (req.role === "organization") {

      var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
      var tdg = await TDG_LIBRARY.findOne({ _id: id, organizationId: organizationFind.id })
      if (!tdg) {
        throw new Error("TDG not created by your organization.")
      } else if (tdg.isDeleted === true) {
        throw new Error("This tdg is already deleted.")
      }

      var FIND = await TACTICAL_DECISION_GAME.find({ tdgLibraryId: id, isDeleted: false }).populate('tdgLibraryId')
      console.log(FIND, "FIND")

      var response = await Promise.all(FIND.map(async (record) => {

        var findImage = await TACTICAL_DECISION_GAME_IMAGE.find({ tacticalDecisionGameId: record.id })
        //console.log("findImage",findImage);
        var findAddAnswerType = await TACTICAL_DECISION_GAME_ADD_ANSWER.find({ tacticalDecisionGameId: record.id })
        //console.log("findAddAnswerType",findAddAnswerType);
        var findBestPractices = await BEST_PRACTICES_DECISION_GAME.find({ tacticalDecisionGameId: record.id })
        //console.log("findBestPractices",findBestPractices);
        var findRatingScaleText = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.find({ tacticalDecisionGameId: record.id })
        //console.log("findRatingScaleText",findRatingScaleText);
        var findTacticalFunctionIncident = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: record._id, idType: 'incidentPriorities' })
        console.log("findTacticalFunctionIncident", findTacticalFunctionIncident);
        var findTacticalFunctionAction = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: record.id, idType: 'actionKeys' })

        var findTacticalFunction = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: record._id })

        var objectivesPromisesIncident = findTacticalFunctionIncident.map(async (o) => {
          var incidentPriorities = await INCIDENT_PRIORITIES.findOne(({ _id: o.incidentPrioritiesId }))

          if (incidentPriorities) {
            if (incidentPriorities.icon || incidentPriorities.icon !== "" || incidentPriorities.icon !== null) {

              incidentPriorities.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + incidentPriorities.icon;
            }
          }

          var actionKeys = await ACTION_KEYS.findOne({ _id: o.actionKeysId })

          if (actionKeys) {
            if (actionKeys.icon || actionKeys.icon !== "" || actionKeys.icon !== null) {
              actionKeys.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + actionKeys.icon;
            }
          }

          var objectivesFind = await OBJECTIVES.find({ incidentPrioritiesId: o.incidentPrioritiesId });
          var actionListFind = await ACTION_LIST.find({ actionKeysId: o.actionKeysId });
          return {
            actionLists: actionListFind || null,
            incidentPrioritiesId: o.incidentPrioritiesId || null,
            incidentPrioritiesName: incidentPriorities || null,
            tacticalDecisionGameId: o.tacticalDecisionGameId || null,
            idType: o.idType || null,
            objectives: objectivesFind || null,
          };
        });

        var objectivesPromisesAction = findTacticalFunctionAction.map(async (o) => {
          var incidentPriorities = await INCIDENT_PRIORITIES.findOne(({ _id: o.incidentPrioritiesId }))
          if (incidentPriorities) {
            if (incidentPriorities.icon || incidentPriorities.icon !== "" || incidentPriorities.icon !== null) {
              incidentPriorities.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + incidentPriorities.icon;
            }
          }

          var actionKeys = await ACTION_KEYS.findOne({ _id: o.actionKeysId, isDeleted: false })
          if (actionKeys) {
            if (actionKeys.icon || actionKeys.icon !== "" || actionKeys.icon !== null) {
              actionKeys.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + actionKeys.icon;
            }
          }

          var objectivesFind = await OBJECTIVES.find({ incidentPrioritiesId: o.incidentPrioritiesId });
          var actionListFind = await ACTION_LIST.find({ actionKeysId: o.actionKeysId });
          return {
            actionKeyId: o.actionKeysId || null,
            actionKeyName: actionKeys || null,
            actionLists: actionListFind || null,
            tacticalDecisionGameId: o.tacticalDecisionGameId || null,
            idType: o.idType || null,
            objectives: objectivesFind || null,
          };
        });

        var objectivesPromises = findTacticalFunction.map(async (o) => {
          var incidentPriorities = await INCIDENT_PRIORITIES.findOne(({ _id: o.incidentPrioritiesId }))

          if (incidentPriorities) {
            if (incidentPriorities.icon || incidentPriorities.icon !== "") {
              incidentPriorities.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + incidentPriorities.icon;
            }
          }

          console.log("incidentPrioritiesName ======>>>>", incidentPriorities);

          var actionKeys = await ACTION_KEYS.findOne({ _id: o.actionKeysId, isDeleted: false })

          if (actionKeys) {
            if (actionKeys.icon || actionKeys.icon !== "" || actionKeys.icon !== null) {
              actionKeys.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + actionKeys.icon;
            }
          }
          console.log("actionKeyName ======>>>>", actionKeys);
          var objectivesFind = await OBJECTIVES.find({ incidentPrioritiesId: o.incidentPrioritiesId });
          var actionListFind = await ACTION_LIST.find({ actionKeysId: o.actionKeysId });
          return {
            actionKeyId: o.actionKeysId || null,
            actionKeyName: actionKeys || null,
            actionLists: actionListFind || null,
            incidentPrioritiesId: o.incidentPrioritiesId || null,
            incidentPrioritiesName: incidentPriorities || null,
            tacticalDecisionGameId: o.tacticalDecisionGameId || null,
            idType: o.idType || null,
            objectives: objectivesFind || null,
          };
        });
        
        var objectivesData = await Promise.all(objectivesPromises);

        var objectivesDataIncident = await Promise.all(objectivesPromisesIncident);
        var objectivesDataAction = await Promise.all(objectivesPromisesAction);

        var obj = {
          tdgLibraryId: record.tdgLibraryId._id || null,
          tdgGameName: record.tdgLibraryId.name,
          goalObjective: record.tdgLibraryId.goalObjective || null,
          missionBriefing: record.tdgLibraryId.missionBriefing || null,
          tacticalDecisionGameId: record._id || null,
          text: record.text || null,
          image: findImage || null,
          addAnswerTypes: findAddAnswerType || null,
          bestNames: findBestPractices || null,
          texts: findRatingScaleText || null,
          selectTargetAudience: record.selectTargetAudience || null,
          timeLimit: record.timeLimit || null,
          selectAnswerType: record.selectAnswerType || null,
          selectNumberOfSliders: record.selectNumberOfSliders || null,
          numeric: record.numeric,
          texting: record.texting,
          publish: record.publish,
          minimumValue: record.minimumValue || null,
          maximumValue: record.maximumValue || null,
          minimumValue1: record.minimumValue1 || null,
          maximumValue1: record.maximumValue1 || null,
          correctAnswer: record.correctAnswer || null,
          isVoiceToText: record.isVoiceToText || null,
          selectLine: record.selectLine || null,
          selectPosition: record.selectPosition || null,
          selectGoals: record.selectGoals || null,
          selectCategory: record.selectCategory || null,
          selectDecisivePointName: record.selectDecisivePointName || null,
          priorityType: record.isPriorityType,
          tacticalFunctionWithObjectivesIncident: objectivesDataIncident,
          tacticalFunctionWithObjectivesAction: objectivesDataAction,
          tacticalFunctionWithObjectives: objectivesData,
          isDeleted: record.isDeleted || null,
          createdAt: record.createdAt || null,
          updatedAt: record.updatedAt || null
        }

        if (record.originalDataId) {

          let originalTacticalGame = await TACTICAL_DECISION_GAME.findOne({ _id: record.originalDataId, isDeleted: false })

          if (originalTacticalGame) {

            let findImage = await TACTICAL_DECISION_GAME_IMAGE.find({ tacticalDecisionGameId: originalTacticalGame._id })
            //console.log("findImage",findImage);
            let findAddAnswerType = await TACTICAL_DECISION_GAME_ADD_ANSWER.find({ tacticalDecisionGameId: originalTacticalGame._id })
            //console.log("findAddAnswerType",findAddAnswerType);
            let findBestPractices = await BEST_PRACTICES_DECISION_GAME.find({ tacticalDecisionGameId: originalTacticalGame._id })
            //console.log("findBestPractices",findBestPractices);
            let findRatingScaleText = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.find({ tacticalDecisionGameId: originalTacticalGame._id })
            //console.log("findRatingScaleText",findRatingScaleText);
            let findTacticalFunctionIncident = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: originalTacticalGame._id, idType: 'incidentPriorities' })
            console.log("findTacticalFunctionIncident", findTacticalFunctionIncident);
            let findTacticalFunctionAction = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: originalTacticalGame._id, idType: 'actionKeys' })

            let objectivesPromisesIncident = findTacticalFunctionIncident.map(async (o) => {
              let incidentPriorities = await INCIDENT_PRIORITIES.findOne(({ _id: o.incidentPrioritiesId }))

              if (incidentPriorities) {
                if (incidentPriorities.icon || incidentPriorities.icon !== "" || incidentPriorities.icon !== null) {

                  incidentPriorities.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + incidentPriorities.icon;
                }
              }

              let actionKeys = await ACTION_KEYS.findOne({ _id: o.actionKeysId })

              if (actionKeys) {
                if (actionKeys.icon || actionKeys.icon !== "" || actionKeys.icon !== null) {
                  actionKeys.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + actionKeys.icon;
                }
              }

              let objectivesFind = await OBJECTIVES.find({ incidentPrioritiesId: o.incidentPrioritiesId });
              let actionListFind = await ACTION_LIST.find({ actionKeysId: o.actionKeysId });
              return {
                actionLists: actionListFind || null,
                incidentPrioritiesId: o.incidentPrioritiesId || null,
                incidentPrioritiesName: incidentPriorities || null,
                tacticalDecisionGameId: o.tacticalDecisionGameId || null,
                idType: o.idType || null,
                objectives: objectivesFind || null,
              };
            });

            let objectivesPromisesAction = findTacticalFunctionAction.map(async (o) => {
              let incidentPriorities = await INCIDENT_PRIORITIES.findOne(({ _id: o.incidentPrioritiesId }))
              if (incidentPriorities) {
                if (incidentPriorities.icon || incidentPriorities.icon !== "" || incidentPriorities.icon !== null) {
                  incidentPriorities.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + incidentPriorities.icon;
                }
              }

              let actionKeys = await ACTION_KEYS.findOne({ _id: o.actionKeysId, isDeleted: false })
              if (actionKeys) {
                if (actionKeys.icon || actionKeys.icon !== "" || actionKeys.icon !== null) {
                  actionKeys.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + actionKeys.icon;
                }
              }

              let objectivesFind = await OBJECTIVES.find({ incidentPrioritiesId: o.incidentPrioritiesId });
              let actionListFind = await ACTION_LIST.find({ actionKeysId: o.actionKeysId });
              return {
                actionKeyId: o.actionKeysId || null,
                actionKeyName: actionKeys || null,
                actionLists: actionListFind || null,
                tacticalDecisionGameId: o.tacticalDecisionGameId || null,
                idType: o.idType || null,
                objectives: objectivesFind || null,
              };
            });

           

            let objectivesDataIncident = await Promise.all(objectivesPromisesIncident);
            let objectivesDataAction = await Promise.all(objectivesPromisesAction);

            let originalDataResponse = {
              tdgLibraryId: originalTacticalGame.tdgLibraryId || null,
              tdgGameName: originalTacticalGame.tdgLibraryId.name,
              goalObjective: originalTacticalGame.tdgLibraryId.goalObjective || null,
              missionBriefing: originalTacticalGame.tdgLibraryId.missionBriefing || null,
              tacticalDecisionGameId: originalTacticalGame._id || null,
              text: originalTacticalGame.text || null,
              image: findImage || null,
              addAnswerTypes: findAddAnswerType || null,
              bestNames: findBestPractices || null,
              texts: findRatingScaleText || null,
              selectTargetAudience: originalTacticalGame.selectTargetAudience || null,
              timeLimit: originalTacticalGame.timeLimit || null,
              selectAnswerType: originalTacticalGame.selectAnswerType || null,
              selectNumberOfSliders: originalTacticalGame.selectNumberOfSliders || null,
              numeric: originalTacticalGame.numeric,
              texting: originalTacticalGame.texting,
              publish: originalTacticalGame.publish,
              minimumValue: originalTacticalGame.minimumValue || null,
              maximumValue: record.maximumValue || null,
              minimumValue1: originalTacticalGame.minimumValue1 || null,
              maximumValue1: originalTacticalGame.maximumValue1 || null,
              correctAnswer: originalTacticalGame.correctAnswer || null,
              isVoiceToText: originalTacticalGame.isVoiceToText || null,
              selectLine: originalTacticalGame.selectLine || null,
              selectPosition: originalTacticalGame.selectPosition || null,
              selectGoals: originalTacticalGame.selectGoals || null,
              selectCategory: originalTacticalGame.selectCategory || null,
              selectDecisivePointName: originalTacticalGame.selectDecisivePointName || null,
              priorityType: originalTacticalGame.isPriorityType,
              tacticalFunctionWithObjectivesIncident: objectivesDataIncident,
              tacticalFunctionWithObjectivesAction: objectivesDataAction,
              isDeleted: originalTacticalGame.isDeleted || null,
              createdAt: originalTacticalGame.createdAt || null,
              updatedAt: originalTacticalGame.updatedAt || null
            }

            const keysToIgnore = ["_id", "tacticalDecisionGameId", "tdgLibraryId", "originalDataId", "createdAt", "updatedAt", "isUpdated", "imageId", "answerId", "userId", "actionKeyId", "incidentPrioritiesId"];

            console.log(record, 'record')
            console.log(originalDataResponse, 'originalGame')

            const areEqual = await compareObjects(originalDataResponse, obj, keysToIgnore);
            let isMatch = areEqual ? true : false;

            console.log(isMatch, 'isMatch')

            if (isBoolean(isMatch) && record.isUpdated === true) {
              record.isMatch = isMatch
            } else {
              record.isMatch = true
            }
          }
        }
        obj.isMatch = record.isMatch
        return obj;
      }))
    } else if (req.role === "fireFighter") {
      
      let findProfile = await PROFILE.findOne({ userId : req.userId })
      var FindTDGLibrary = await TDG_LIBRARY.findOne({ _id: id, publish: true , organizationId : findProfile.organizationId });
      console.log("FindTDGLibrary ==>>", FindTDGLibrary);
      var FIND = await TACTICAL_DECISION_GAME.find({ tdgLibraryId: FindTDGLibrary._id, publish: true, isDeleted: false }).populate("tdgLibraryId")
      console.log("FIND ===>>>", FIND);
      console.log('first')

      var response = await Promise.all(FIND.map(async (record) => {
        var findImage = await TACTICAL_DECISION_GAME_IMAGE.find({ tacticalDecisionGameId: record._id })
        //console.log("findImage",findImage);
        var findAddAnswerType = await TACTICAL_DECISION_GAME_ADD_ANSWER.find({ tacticalDecisionGameId: record._id })
        //console.log("findAddAnswerType",findAddAnswerType);
        var findBestPractices = await BEST_PRACTICES_DECISION_GAME.find({ tacticalDecisionGameId: record._id })
        //console.log("findBestPractices",findBestPractices);
        var findRatingScaleText = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.find({ tacticalDecisionGameId: record._id })
        //console.log("findRatingScaleText",findRatingScaleText);
        var findTacticalFunction = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: record._id })
        //console.log("findTacticalFunction",findTacticalFunction);

        var objectivesPromises = findTacticalFunction.map(async (o) => {
          var incidentPriorities = await INCIDENT_PRIORITIES.findOne(({ _id: o.incidentPrioritiesId }))

          if (incidentPriorities) {
            if (incidentPriorities.icon || incidentPriorities.icon !== "") {
              incidentPriorities.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + incidentPriorities.icon;
            }
          }

          console.log("incidentPrioritiesName ======>>>>", incidentPriorities);

          var actionKeys = await ACTION_KEYS.findOne({ _id: o.actionKeysId, isDeleted: false })

          if (actionKeys) {
            if (actionKeys.icon || actionKeys.icon !== "" || actionKeys.icon !== null) {
              actionKeys.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + actionKeys.icon;
            }
          }
          console.log("actionKeyName ======>>>>", actionKeys);
          var objectivesFind = await OBJECTIVES.find({ incidentPrioritiesId: o.incidentPrioritiesId });
          var actionListFind = await ACTION_LIST.find({ actionKeysId: o.actionKeysId });
          return {
            actionKeyId: o.actionKeysId || null,
            actionKeyName: actionKeys || null,
            actionLists: actionListFind || null,
            incidentPrioritiesId: o.incidentPrioritiesId || null,
            incidentPrioritiesName: incidentPriorities || null,
            tacticalDecisionGameId: o.tacticalDecisionGameId || null,
            idType: o.idType || null,
            objectives: objectivesFind || null,
          };
        });

        var findTacticalFunctionIncident = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: record._id, idType: 'incidentPriorities' })

        var findTacticalFunctionAction = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: record.id, idType: 'actionKeys' })


        var objectivesPromisesIncident = await Promise.all(findTacticalFunctionIncident.map(async (o) => {
          var incidentPriorities = await INCIDENT_PRIORITIES.findOne(({ _id: o.incidentPrioritiesId }))

          if (incidentPriorities) {
            if (incidentPriorities.icon || incidentPriorities.icon !== "" || incidentPriorities.icon !== null) {

              incidentPriorities.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + incidentPriorities.icon;
            }
          }

          var actionKeys = await ACTION_KEYS.findOne({ _id: o.actionKeysId })

          if (actionKeys) {
            if (actionKeys.icon || actionKeys.icon !== "" || actionKeys.icon !== null) {
              actionKeys.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + actionKeys.icon;
            }
          }

          var objectivesFind = await OBJECTIVES.find({ incidentPrioritiesId: o.incidentPrioritiesId });
          var actionListFind = await ACTION_LIST.find({ actionKeysId: o.actionKeysId });
          return {
            actionLists: actionListFind || null,
            incidentPrioritiesId: o.incidentPrioritiesId || null,
            incidentPrioritiesName: incidentPriorities || null,
            tacticalDecisionGameId: o.tacticalDecisionGameId || null,
            idType: o.idType || null,
            objectives: objectivesFind || null,
          };
        }));

        var objectivesPromisesAction = findTacticalFunctionAction.map(async (o) => {
          var incidentPriorities = await INCIDENT_PRIORITIES.findOne(({ _id: o.incidentPrioritiesId }))
          if (incidentPriorities) {
            if (incidentPriorities.icon || incidentPriorities.icon !== "" || incidentPriorities.icon !== null) {
              incidentPriorities.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + incidentPriorities.icon;
            }
          }

          var actionKeys = await ACTION_KEYS.findOne({ _id: o.actionKeysId, isDeleted: false })
          if (actionKeys) {
            if (actionKeys.icon || actionKeys.icon !== "" || actionKeys.icon !== null) {
              actionKeys.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + actionKeys.icon;
            }
          }

          var objectivesFind = await OBJECTIVES.find({ incidentPrioritiesId: o.incidentPrioritiesId });
          var actionListFind = await ACTION_LIST.find({ actionKeysId: o.actionKeysId });
          return {
            actionKeyId: o.actionKeysId || null,
            actionKeyName: actionKeys || null,
            actionLists: actionListFind || null,
            tacticalDecisionGameId: o.tacticalDecisionGameId || null,
            idType: o.idType || null,
            objectives: objectivesFind || null,
          };
        });

        var objectivesDataIncident = await Promise.all(objectivesPromisesIncident);
        var objectivesDataAction = await Promise.all(objectivesPromisesAction);


        var objectivesData = await Promise.all(objectivesPromises);
        var obj = {
          tdgLibraryId: record.tdgLibraryId.id || null,
          tdgGameName: record.tdgLibraryId.name,
          goalObjective: record.tdgLibraryId.goalObjective || null,
          missionBriefing: record.tdgLibraryId.missionBriefing || null,
          tacticalDecisionGameId: record._id || null,
          text: record.text || null,
          image: findImage || null,
          addAnswerTypes: findAddAnswerType || null,
          selectNumberOfSliders: record.selectNumberOfSliders || null,
          bestNames: findBestPractices || null,
          texts: findRatingScaleText || null,
          selectTargetAudience: record.selectTargetAudience || null,
          timeLimit: record.timeLimit || null,
          selectAnswerType: record.selectAnswerType || null,
          numeric: record.numeric,
          texting: record.texting,
          publish: record.publish,
          minimumValue: record.minimumValue || null,
          maximumValue: record.maximumValue || null,
          minimumValue1: record.minimumValue1 || null,
          maximumValue1: record.maximumValue1 || null,
          correctAnswer: record.correctAnswer || null,
          isVoiceToText: record.isVoiceToText || null,
          selectLine: record.selectLine || null,
          selectPosition: record.selectPosition || null,
          selectGoals: record.selectGoals || null,
          selectCategory: record.selectCategory || null,
          selectDecisivePointName: record.selectDecisivePointName || null,
          priorityType: record.isPriorityType,
          tacticalFunctionWithObjectivesIncident: objectivesDataIncident,
          tacticalFunctionWithObjectivesAction: objectivesDataAction,
          tacticalFunctionWithObjectives: objectivesData,
          isDeleted: record.isDeleted,
          createdAt: record.createdAt || null,
          updatedAt: record.updatedAt || null
        }
        return obj;
      }))

      console.log("response ", response);
    } else {
      throw new Error("You can not access.");
    }
    res.status(200).json({
      status: "success",
      message: "Tactical Decision Game get successfully.",
      data: response
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

exports.updateTacticalDecisionGame = async function (req, res, next) {
  try {
    console.log(req.files, req.body)
    var id = req.params.id

    const imageString = Object.keys(req.body).filter(key => key.startsWith('image'));

    let pairs = [];

    for (let index = 0; index < req.files.length + imageString.length; index++) {

      var imageUrl = null;
      var audioUrl = null;
      // console.log(req.body["image." + index + ".image"] ? true : false, "isImage")
      if (typeof req.body["image." + index + ".image"] === "string") {
        // console.log('string image', index)
        imageUrl = req.body["image." + index + ".image"] ? req.body["image." + index + ".image"] : null;
        // console.log(imageUrl, "imageURL")
      } else {
        // console.log('Original image')
        const imageField = req.files.find(file => file.fieldname === `image.${index}.image`);
        if (imageField) {
          console.log(imageField.filename, "image", index)
          imageUrl = req.protocol + "://" + req.get("host") + "/" + "images/" + imageField?.filename;
        }
      }

      if (typeof req.body["image." + index + ".audio"] === "string") {
        audioUrl = req.body["image." + index + ".audio"] ? req.body["image." + index + ".audio"] : null;
      } else {
        const audioField = req.files.find(file => file.fieldname === `image.${index}.audio`);
        if (audioField) {
          audioUrl = req.protocol + "://" + req.get("host") + "/" + "images/" + audioField.filename;
        }
      }

      if (imageUrl) {
        pairs.push({ audio: audioUrl, image: imageUrl ? imageUrl : null });
      }
    }

    console.log(pairs)

    let { selectNumberOfSliders, maximumValue, minimumValue, maximumValue1, minimumValue1, correctAnswer } = req.body;

    if (req.body.selectAnswerType === "ratingScale") {
      if (!selectNumberOfSliders) {
        throw new Error("please enter a selectNumberOfSliders")
      }
      if (req.body.numeric === "false" && req.body.texting === "false") {
        throw new Error("Both numeric and texting are false. Specify at least one as required.");
      }
      if (req.body.numeric === "true") {

        if (selectNumberOfSliders !== "singleSlider" && selectNumberOfSliders !== 'twoSlider') {
          throw new Error('please enter valid selectNumberOfSliders.')
        }
        if (selectNumberOfSliders === 'singleSlider') {
          if (!minimumValue || minimumValue === ("null" || null)) {
            throw new Error("minimumValue is required.")
          } else if (!maximumValue || maximumValue === ("null" || null)) {
            throw new Error("maximumValue is required.")
          } 
        } else if (selectNumberOfSliders === 'twoSlider') {
          if (!minimumValue) {
            throw new Error("Please enter a minimum value.")
          } else if (!maximumValue) {
            throw new Error("Please enter a maximum value.")
          } else if (!minimumValue1) {
            throw new Error("Please enter a minimum1 value.")
          } else if (!maximumValue1) {
            throw new Error("Please enter a maximum1 value.")
          }
        }
      } else if (req.body.texting === "true") {
        if (selectNumberOfSliders !== "singleSlider" && selectNumberOfSliders !== 'twoSlider') {
          throw new Error('please enter valid selectNumberOfSliders.')
        }
        if (!req.body.texts) {
          throw new Error("Please enter the texts.")
        }
        if (selectNumberOfSliders === 'twoSlider') {
          if (!req.body.texts1) {
            throw new Error('Please enter the texts1.');
          }
        }
      }
    }

    if (req.role === "superAdmin") {

      var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findOne({ '_id': id, 'isDeleted': false });

      if (!tacticalDecisionGame) {
        throw new Error("Tactical Decision Game not found.");
      }
      var selectedAudience;
      if (typeof req.body.selectTargetAudience === "string") {
        selectedAudience = JSON.parse(req.body.selectTargetAudience);
      } else {
        selectedAudience = req.body.selectTargetAudience;
      }
      if (selectedAudience.length > 0) {
        await TACTICAL_DECISION_GAME.findByIdAndUpdate(id, { 'selectTargetAudience': selectedAudience }, { new: true });
      }
      // var selectAnswerType = req.body.selectAnswerType || null;
      // if (selectAnswerType != null) {
      //   await TACTICAL_DECISION_GAME.findByIdAndUpdate(id, { 'selectAnswerType': selectAnswerType }, { new: true });
      // }
      if (req.body.priorityType !== tacticalDecisionGame.isPriorityType) {
        const data = await TACTICAL_DECISION_GAME.findByIdAndUpdate(id, { 'isPriorityType': req.body.priorityType }, { new: true });
      }

      // if (pairs.length > 0) {
      //   var deleteImage = await TACTICAL_DECISION_GAME_IMAGE.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id })
      //   for (const pair of pairs) {
      //     await TACTICAL_DECISION_GAME_IMAGE.create({
      //       tacticalDecisionGameId: tacticalDecisionGame.id,
      //       image: pair.image ? pair.image : null,
      //       audio: pair.audio ? pair.audio : null,
      //       isDeleted: false
      //     });
      //   }
      // }
      if (pairs.length > 0) {
        var deleteImage = await TACTICAL_DECISION_GAME_IMAGE.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id })
        for (let i = 0; i < pairs.length; i++) {
          const pair = pairs[i];
          let tact_Game = await TACTICAL_DECISION_GAME_IMAGE.create({
            tacticalDecisionGameId: tacticalDecisionGame.id,
            image: pair.image ? pair.image : null,
            audio: pair.audio ? pair.audio : null,
            answer: req.body[`image.${i}.answer`],
            isDeleted: false
          });
          console.log(`Index: ${i}, ID: ${tact_Game._id}`);
        }
      }

      if (req.body.text) {
        await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
          text: req.body.text,
        }, { new: true })
      }

      if (req.body.timeLimit) {
        var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
          timeLimit: req.body.timeLimit,
        }, { new: true })
      }

      if (req.body.publish) {
        var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
          publish: req.body.publish,
        }, { new: true })
      }

      if (req.body?.numeric?.length > 0) {
        var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
          numeric: req.body.numeric,
        }, { new: true })
      }


      if (req.body?.texting?.length > 0) {
        var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
          texting: req.body.texting,
        }, { new: true })
      }

      const bestNames = req.body.bestNames || [];
      const bestPracticesArray = [];

      if (bestNames.length > 0) {
        var delBestPractices = await BEST_PRACTICES_DECISION_GAME.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id })
        for (const bestName of bestNames) {
          const bestPracticesDecisionGame = await BEST_PRACTICES_DECISION_GAME.create({
            tacticalDecisionGameId: tacticalDecisionGame.id,
            name: bestName,
            isDeleted: false,
          });
          bestPracticesArray.push(bestPracticesDecisionGame);
        }
      }


      if (req.body.selectAnswerType != null) {
        if (req.body.selectAnswerType === "list") {

          let addAnswerTypes;

          if (Array.isArray(req.body.addAnswerType)) {
            addAnswerTypes = req.body.addAnswerType;
          } else {
            addAnswerTypes = JSON.parse(req.body.addAnswerType);
          }

          if (!addAnswerTypes || addAnswerTypes.length === 0 || addAnswerTypes[0] === "" || addAnswerTypes[0] === "") {
            throw new Error("addAnswer is required.")
          }

          if (addAnswerTypes.length < 2) {
            throw new Error("At least two addAnswerTypes are required.");
          }

          const tacticalDecisionGameInList = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
            minimumValue: null,
            maximumValue: null,
            minimumValue1: null,
            maximumValue1: null,
            correctAnswer: null,
            isVoiceToText: null,
            selectLine: null,
            selectPosition: null,
            selectGoals: null,
            selectCategory: null,
            selectDecisivePointName: null,
            selectAnswerType: req.body.selectAnswerType,
            correctAnswer: req.body.correctAnswer || null,
            selectNumberOfSliders: null,
          }, { new: true })

          await Promise.all([
            TACTICAL_FUNCTION.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id }),
            TACTICAL_DECISION_GAME_ADD_ANSWER.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id }),
            TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id })
          ]);

          if (addAnswerTypes && addAnswerTypes.length > 0) {
            const promises = addAnswerTypes.map(async (item) => {
              const { answer, position } = item;
              return await TACTICAL_DECISION_GAME_ADD_ANSWER.create({
                tacticalDecisionGameId: tacticalDecisionGame.id,
                answer: answer,
                position: position || 0,
                isDeleted: false,
              });
            });
            await Promise.all(promises);
          }

        } else if (req.body.selectAnswerType === "ratingScale") {

          await Promise.all([
            TACTICAL_FUNCTION.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id }),
            TACTICAL_DECISION_GAME_ADD_ANSWER.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id })
          ]);

          await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame._id, {
            isVoiceToText: null,
            selectLine: null,
            selectPosition: null,
            selectGoals: null,
            selectCategory: null,
            selectDecisivePointName: null,
          }, { new: true })

          if (req.body.numeric === "true") {
            if (req.body.selectNumberOfSliders === 'singleSlider') {
              var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
                minimumValue: req.body.minimumValue || null,
                maximumValue: req.body.maximumValue || null,
                correctAnswer: req.body.correctAnswer || null,
                selectNumberOfSliders: req.body.selectNumberOfSliders,
                selectAnswerType: req.body.selectAnswerType,
              }, { new: true })
            }

            else if (req.body.selectNumberOfSliders === 'twoSlider') {
              var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
                minimumValue: req.body.minimumValue || null,
                maximumValue: req.body.maximumValue || null,
                minimumValue1: req.body.minimumValue1 || null,
                maximumValue1: req.body.maximumValue1 || null,
                correctAnswer: req.body.correctAnswer || null,
                selectNumberOfSliders: req.body.selectNumberOfSliders,
                selectAnswerType: req.body.selectAnswerType,
              }, { new: true })
            }
          } else if (req.body.texting === "true") {

            var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
              selectNumberOfSliders: req.body.selectNumberOfSliders,
              selectAnswerType: req.body.selectAnswerType,
              correctAnswer: req.body.correctAnswer || null,
              minimumValue: null,
              maximumValue: null,
              minimumValue1: null,
              maximumValue1: null,
            }, { new: true })

            if (req.body.selectNumberOfSliders === 'singleSlider') {
              await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame._id })

              var ratingTexts = [];
              var texts;
              if (typeof req.body.texts === 'string') {
                texts = req.body.texts ? JSON.parse(req.body.texts) : [];
              } else {
                texts = req.body.texts ? req.body.texts : [];
              }
              for (let index = 0; index < texts.length; index++) {
                const element = texts[index];
                var ratingText = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.create({
                  tacticalDecisionGameId: tacticalDecisionGame.id,
                  slider: element.slider,
                  position: element.position,
                  actualPriority: element.actualPriority,
                  ratingScaleText: element.text,
                  isDeleted: false,
                });
                ratingTexts.push(ratingText);
              }

            } else if (req.body.selectNumberOfSliders === 'twoSlider') {
              await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame._id })

              var ratingTexts = [];
              var texts1;
              if (typeof req.body.texts1 === 'string') {
                texts1 = req.body.texts1 ? JSON.parse(req.body.texts1) : [];
              } else {
                texts1 = req.body.texts1 ? req.body.texts1 : [];
              }

              for (let index = 0; index < texts1.length; index++) {
                const element = texts1[index];
                var ratingText = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.create({
                  tacticalDecisionGameId: tacticalDecisionGame.id,
                  slider: element.slider,
                  position: element.position,
                  actualPriority: element.actualPriority,
                  ratingScaleText: element.text,
                  isDeleted: false,
                });
                ratingTexts.push(ratingText);
              }
              var texts;
              if (typeof req.body.texts === 'string') {
                texts = req.body.texts ? JSON.parse(req.body.texts) : [];
              } else {
                texts = req.body.texts ? req.body.texts : [];
              }

              for (let index = 0; index < texts.length; index++) {
                const element = texts[index];
                var ratingText = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.create({
                  tacticalDecisionGameId: tacticalDecisionGame.id,
                  slider: element.slider,
                  position: element.position,
                  actualPriority: element.actualPriority,
                  ratingScaleText: element.text,
                  isDeleted: false,
                });
                ratingTexts.push(ratingText);
              }

            }
          }
        } else if (req.body.selectAnswerType === "voiceToText") {

          await Promise.all([
            TACTICAL_FUNCTION.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id }),
            TACTICAL_DECISION_GAME_ADD_ANSWER.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id }),
            TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id })
          ]);

          const tacticalDecisionGameInRatingScale = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
            minimumValue: null,
            maximumValue: null,
            minimumValue1: null,
            maximumValue1: null,
            correctAnswer: null,
            selectLine: null,
            selectPosition: null,
            selectGoals: null,
            selectCategory: null,
            selectDecisivePointName: null,
            selectNumberOfSliders: req.body.selectNumberOfSliders,
            selectAnswerType: req.body.selectAnswerType,
            correctAnswer: req.body.correctAnswer || null,
            isVoiceToText: req.body.isVoiceToText
          }, { new: true })

        } else if (req.body.selectAnswerType === "functionKeys") {

          var incidentPrioritiesIds = req.body.incidentPrioritiesId || [];
          var actionKeyIds = req.body.actionKeyId || [];

          if (!incidentPrioritiesIds || incidentPrioritiesIds.length === 0 || [0].some(index => incidentPrioritiesIds[index] === '')) {
            throw new Error('incidentPrioritiesId is required.');
          }
          if (!actionKeyIds || actionKeyIds.length === 0 || [0].some(index => actionKeyIds[index] === '')) {
            throw new Error('actionKeyId is required.');
          }

          var tacticalFunctionDelete = await TACTICAL_FUNCTION.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id })
          const deleteAddAnswerType = await TACTICAL_DECISION_GAME_ADD_ANSWER.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id });
          var delRatingScaleTexts = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id })

          var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
            minimumValue: null,
            maximumValue: null,
            minimumValue1: null,
            maximumValue1: null,
            correctAnswer: null,
            isVoiceToText: null,
            correctAnswer: req.body.correctAnswer,
            selectLine: req.body.selectLine,
            selectPosition: req.body.selectPosition,
            selectGoals: req.body.selectGoals,
            selectCategory: req.body.selectCategory,
            selectDecisivePointName: req.body.selectDecisivePointName,
            selectAnswerType: req.body.selectAnswerType,
            selectNumberOfSliders: req.body.selectNumberOfSliders,
            selectAnswerType: req.body.selectAnswerType,
            correctAnswer: req.body.correctAnswer || null,
          }, { new: true })

          // Create a new TACTICAL_FUNCTION entry with the same tacticalDecisionGameId for each incidentPrioritiesId
          for (let i = 0; i < incidentPrioritiesIds.length; i++) {
            const tacticalFunctionIncident = await TACTICAL_FUNCTION.create({
              tacticalDecisionGameId: tacticalDecisionGame.id,
              idType: 'incidentPriorities',
              incidentPrioritiesId: incidentPrioritiesIds[i] || null,
            });
            console.log("Created Tactical Function with Incident Priorities: ", tacticalFunctionIncident);
          }

          // Create a new TACTICAL_FUNCTION entry with the same tacticalDecisionGameId for each actionKeyId
          for (let i = 0; i < actionKeyIds.length; i++) {
            const tacticalFunctionAction = await TACTICAL_FUNCTION.create({
              tacticalDecisionGameId: tacticalDecisionGame.id,
              idType: 'actionKeys',
              actionKeysId: actionKeyIds[i] || null,
            });
            console.log("Created Tactical Function with Action Key: ", tacticalFunctionAction);
          }
        }
      }

      var FIND = await TACTICAL_DECISION_GAME.findById(tacticalDecisionGame.id)
      var findImage = await TACTICAL_DECISION_GAME_IMAGE.find({ tacticalDecisionGameId: tacticalDecisionGame.id })
      var findAddAnswerType = await TACTICAL_DECISION_GAME_ADD_ANSWER.find({ tacticalDecisionGameId: tacticalDecisionGame.id })
      console.log("findAddAnswerType", findAddAnswerType);
      var findBestPractices = await BEST_PRACTICES_DECISION_GAME.find({ tacticalDecisionGameId: tacticalDecisionGame.id })
      console.log("findBestPractices", findBestPractices);
      var findRatingScaleText = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.find({ tacticalDecisionGameId: tacticalDecisionGame.id })
      console.log("findRatingScaleText", findRatingScaleText);
      var findTacticalFunctionIncident = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: tacticalDecisionGame.id, idType: 'incidentPriorities' })
      console.log("findTacticalFunctionIncident", findTacticalFunctionIncident);
      var findTacticalFunctionAction = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: tacticalDecisionGame.id, idType: 'actionKeys' })
      // console.log("findTacticalFunctionAction", findTacticalFunctionAction);

      var objectivesPromisesIncident = findTacticalFunctionIncident.map(async (o) => {
        var incidentPriorities = await INCIDENT_PRIORITIES.findOne(({ _id: o.incidentPrioritiesId }))

        if (incidentPriorities) {
          if (incidentPriorities.icon || incidentPriorities.icon !== "" || incidentPriorities.icon !== null) {
            incidentPriorities.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + incidentPriorities.icon;
          }
        }

        var actionKeys = await ACTION_KEYS.findOne({ _id: o.actionKeysId })

        if (actionKeys) {
          if (actionKeys.icon || actionKeys.icon !== "" || actionKeys.icon !== null) {
            actionKeys.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + actionKeys.icon;
          }
        }

        var objectivesFind = await OBJECTIVES.find({ incidentPrioritiesId: o.incidentPrioritiesId });
        var actionListFind = await ACTION_LIST.find({ actionKeysId: o.actionKeysId });
        return {
          actionLists: actionListFind || null,
          incidentPrioritiesId: o.incidentPrioritiesId || null,
          incidentPrioritiesName: incidentPriorities || null,
          tacticalDecisionGameId: o.tacticalDecisionGameId || null,
          idType: o.idType || null,
          objectives: objectivesFind || null,
        };
      });

      var objectivesPromisesAction = findTacticalFunctionAction.map(async (o) => {
        var incidentPriorities = await INCIDENT_PRIORITIES.findOne(({ _id: o.incidentPrioritiesId }))
        if (incidentPriorities) {
          if (incidentPriorities.icon || incidentPriorities.icon !== "" || incidentPriorities.icon !== null) {
            incidentPriorities.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + incidentPriorities.icon;
          }
        }

        var actionKeys = await ACTION_KEYS.findOne({ _id: o.actionKeysId, isDeleted: false })
        if (actionKeys) {
          if (actionKeys.icon || actionKeys.icon !== "" || actionKeys.icon !== null) {
            actionKeys.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + actionKeys.icon;
          }
        }
        var objectivesFind = await OBJECTIVES.find({ incidentPrioritiesId: o.incidentPrioritiesId });
        var actionListFind = await ACTION_LIST.find({ actionKeysId: o.actionKeysId });
        return {
          actionKeyId: o.actionKeysId || null,
          actionKeyName: actionKeys || null,
          actionLists: actionListFind || null,
          tacticalDecisionGameId: o.tacticalDecisionGameId || null,
          idType: o.idType || null,
          objectives: objectivesFind || null,
        };
      });


      var object = [];

      if (findImage.length > 0) {
        for (let index = 0; index < findImage.length; index++) {
          const element = findImage[index];
          object.push({ 'image': element.image, 'audio': element.audio , 'answer' : element.answer  });
        }
      }

      var objectivesDataIncident = await Promise.all(objectivesPromisesIncident);
      var objectivesDataAction = await Promise.all(objectivesPromisesAction);

      var response = {
        tdgLibraryId: FIND.tdgLibraryId,
        text: FIND.text,
        audio: FIND.audio,
        image: object,
        addAnswerTypes: findAddAnswerType,
        selectNumberOfSliders: FIND.selectNumberOfSliders,
        bestNames: findBestPractices,
        Texts: findRatingScaleText,
        selectTargetAudience: FIND.selectTargetAudience,
        timeLimit: FIND.timeLimit,
        selectAnswerType: FIND.selectAnswerType,
        minimumValue: FIND.minimumValue,
        maximumValue: FIND.maximumValue,
        minimumValue1: FIND.minimumValue1,
        maximumValue1: FIND.maximumValue1,
        correctAnswer: FIND.correctAnswer,
        isVoiceToText: FIND.isVoiceToText,
        selectLine: FIND.selectLine,
        selectPosition: FIND.selectPosition,
        selectGoals: FIND.selectGoals,
        selectCategory: FIND.selectCategory,
        selectDecisivePointName: FIND.selectDecisivePointName,
        priorityType: FIND.isPriorityType,
        publish: FIND.publish,
        numeric: FIND.numeric,
        texting: FIND.texting,
        isDeleted: FIND.isDeleted,
        tacticalFunctionWithObjectivesIncident: objectivesDataIncident,
        tacticalFunctionWithObjectivesAction: objectivesDataAction,
        createdAt: FIND.createdAt,
        updatedAt: FIND.updatedAt
      }

      await TACTICAL_DECISION_GAME.updateMany(
        { originalDataId: id },
        { $set: { isUpdated: true } }
      );

    }


    else if (req.role === "organization") {

      var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
      var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findOne({ _id: id, organizationId: organizationFind.id })

      if (!tacticalDecisionGame) {
        throw new Error("TDG not created by your organization.")
      } else if (tacticalDecisionGame.isDeleted === true) {
        throw new Error("This tactical is already deleted.")
      }

      var selectedAudience;
      if (typeof req.body.selectTargetAudience === "string") {
        selectedAudience = JSON.parse(req.body.selectTargetAudience);
      } else {
        selectedAudience = req.body.selectTargetAudience;
      }

      if (selectedAudience.length > 0) {
        await TACTICAL_DECISION_GAME.findByIdAndUpdate(id, { 'selectTargetAudience': selectedAudience }, { new: true });
      }

      var selectAnswerType = req.body.selectAnswerType || null;

      // if (selectAnswerType != null) {
      //   await TACTICAL_DECISION_GAME.findByIdAndUpdate(id, { 'selectAnswerType': selectAnswerType }, { new: true });
      // }
      if (req.body.priorityType !== tacticalDecisionGame.isPriorityType) {
        const data = await TACTICAL_DECISION_GAME.findByIdAndUpdate(id, { 'isPriorityType': req.body.priorityType }, { new: true });
      }

      // if (pairs.length > 0) {

      //   var deleteImage = await TACTICAL_DECISION_GAME_IMAGE.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id })

      //   for (const pair of pairs) {
      //     await TACTICAL_DECISION_GAME_IMAGE.create({
      //       tacticalDecisionGameId: tacticalDecisionGame.id,
      //       image: pair.image ? pair.image : null,
      //       audio: pair.audio ? pair.audio : null,
      //       isDeleted: false
      //     });
      //   }

      // }
      if (pairs.length > 0) {
        var deleteImage = await TACTICAL_DECISION_GAME_IMAGE.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id })
        for (let i = 0; i < pairs.length; i++) {
          const pair = pairs[i];
          let tact_Game = await TACTICAL_DECISION_GAME_IMAGE.create({
            tacticalDecisionGameId: tacticalDecisionGame.id,
            image: pair.image ? pair.image : null,
            audio: pair.audio ? pair.audio : null,
            answer: req.body[`image.${i}.answer`],
            isDeleted: false
          });
          console.log(`Index: ${i}, ID: ${tact_Game._id}`);
        }
      }
      if (req.body.text) {
        await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
          text: req.body.text,
        }, { new: true })
      }

      if (req.body.timeLimit) {
        var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
          timeLimit: req.body.timeLimit,
        }, { new: true })
      }

      if (req.body.publish) {
        var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
          publish: req.body.publish,
        }, { new: true })
      }
      if (req.body?.numeric?.length > 0) {
        var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
          numeric: req.body.numeric,
        }, { new: true })
      }

      if (req.body?.texting?.length > 0) {
        var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
          texting: req.body.texting,
        }, { new: true })
      }

      const bestNames = req.body.bestNames || [];
      const bestPracticesArray = [];

      if (bestNames.length > 0) {
        var delBestPractices = await BEST_PRACTICES_DECISION_GAME.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id })
        for (const bestName of bestNames) {
          const bestPracticesDecisionGame = await BEST_PRACTICES_DECISION_GAME.create({
            tacticalDecisionGameId: tacticalDecisionGame.id,
            name: bestName,
            isDeleted: false,
          });
          bestPracticesArray.push(bestPracticesDecisionGame);
        }
      }

      if (req.body.selectAnswerType != null) {
        if (req.body.selectAnswerType === "list") {

          let addAnswerTypes;
          let addAnswerTypesArray = [];

          if (Array.isArray(req.body.addAnswerType)) {
            addAnswerTypes = req.body.addAnswerType;
          } else {
            addAnswerTypes = JSON.parse(req.body.addAnswerType);
          }

          if (!addAnswerTypes || addAnswerTypes.length === 0 || addAnswerTypes[0] === "" || addAnswerTypes[0] === "") {
            throw new Error("addAnswer is required.")
          }

          if (addAnswerTypes.length < 2) {
            throw new Error("At least two addAnswerTypes are required.");
          }

          const tacticalDecisionGameInList = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
            minimumValue: null,
            maximumValue: null,
            minimumValue1: null,
            maximumValue1: null,
            correctAnswer: null,
            isVoiceToText: null,
            selectLine: null,
            selectPosition: null,
            selectGoals: null,
            selectCategory: null,
            selectDecisivePointName: null,
            selectAnswerType: req.body.selectAnswerType,
            correctAnswer: req.body.correctAnswer || null,
            selectNumberOfSliders: null,
          }, { new: true })

          await Promise.all([
            TACTICAL_FUNCTION.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id }),
            TACTICAL_DECISION_GAME_ADD_ANSWER.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id }),
            TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id })
          ]);

          if (addAnswerTypes && addAnswerTypes.length > 0) {
            const promises = addAnswerTypes.map(async (item) => {
              const { answer, position } = item;
              return await TACTICAL_DECISION_GAME_ADD_ANSWER.create({
                tacticalDecisionGameId: tacticalDecisionGame.id,
                answer: answer,
                position: position || 0,
                isDeleted: false,
              });
            });
            await Promise.all(promises);
          }

        } else if (req.body.selectAnswerType === "ratingScale") {

          await Promise.all([
            TACTICAL_FUNCTION.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id }),
            TACTICAL_DECISION_GAME_ADD_ANSWER.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id })
          ]);

          await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame._id, {
            isVoiceToText: null,
            selectLine: null,
            selectPosition: null,
            selectGoals: null,
            selectCategory: null,
            selectDecisivePointName: null,
          }, { new: true })

          if (req.body.numeric === "true") {
            if (req.body.selectNumberOfSliders === 'singleSlider') {
              var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
                minimumValue: req.body.minimumValue || null,
                maximumValue: req.body.maximumValue || null,
                correctAnswer: req.body.correctAnswer || null,
                selectNumberOfSliders: req.body.selectNumberOfSliders,
                selectAnswerType: req.body.selectAnswerType,
              }, { new: true })
            }

            else if (req.body.selectNumberOfSliders === 'twoSlider') {
              var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
                minimumValue: req.body.minimumValue || null,
                maximumValue: req.body.maximumValue || null,
                minimumValue1: req.body.minimumValue1 || null,
                maximumValue1: req.body.maximumValue1 || null,
                correctAnswer: req.body.correctAnswer || null,
                selectNumberOfSliders: req.body.selectNumberOfSliders,
                selectAnswerType: req.body.selectAnswerType,
              }, { new: true })
            }
          } else if (req.body.texting === "true") {

            var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
              selectNumberOfSliders: req.body.selectNumberOfSliders,
              selectAnswerType: req.body.selectAnswerType,
              correctAnswer: req.body.correctAnswer || null,
              minimumValue: null,
              maximumValue: null,
              minimumValue1: null,
              maximumValue1: null,
            }, { new: true })

            var texts;
            if (typeof req.body.texts === 'string') {
              texts = req.body.texts ? JSON.parse(req.body.texts) : [];
            } else {
              texts = req.body.texts ? req.body.texts : [];
            }

            if (req.body.selectNumberOfSliders === 'singleSlider') {
              await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame._id })

              var ratingTexts = [];

              for (let index = 0; index < texts.length; index++) {
                const element = texts[index];
                var ratingText = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.create({
                  tacticalDecisionGameId: tacticalDecisionGame.id,
                  slider: element.slider,
                  position: element.position,
                  actualPriority: element.actualPriority,
                  ratingScaleText: element.text,
                  isDeleted: false,
                });
                ratingTexts.push(ratingText);
              }
            } else if (req.body.selectNumberOfSliders === 'twoSlider') {

              await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame._id })

              var ratingTexts = [];
              var texts1;
              if (typeof req.body.texts1 === 'string') {
                texts1 = req.body.texts1 ? JSON.parse(req.body.texts1) : [];
              } else {
                texts1 = req.body.texts1 ? req.body.texts1 : [];
              }
              for (let index = 0; index < texts1.length; index++) {
                const element = texts1[index];
                var ratingText = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.create({
                  tacticalDecisionGameId: tacticalDecisionGame.id,
                  slider: element.slider,
                  position: element.position,
                  actualPriority: element.actualPriority,
                  ratingScaleText: element.text,
                  isDeleted: false,
                });
                ratingTexts.push(ratingText);
              }

              for (let index = 0; index < texts.length; index++) {
                const element = texts[index];
                var ratingText = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.create({
                  tacticalDecisionGameId: tacticalDecisionGame.id,
                  slider: element.slider,
                  position: element.position,
                  actualPriority: element.actualPriority,
                  ratingScaleText: element.text,
                  isDeleted: false,
                });
                ratingTexts.push(ratingText);
              }

            }
          }
        } else if (req.body.selectAnswerType === "voiceToText") {

          await Promise.all([
            TACTICAL_FUNCTION.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id }),
            TACTICAL_DECISION_GAME_ADD_ANSWER.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id }),
            TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id })
          ]);

          const tacticalDecisionGameInRatingScale = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
            minimumValue: null,
            maximumValue: null,
            minimumValue1: null,
            maximumValue1: null,
            correctAnswer: null,
            selectLine: null,
            selectPosition: null,
            selectGoals: null,
            selectCategory: null,
            selectDecisivePointName: null,
            selectNumberOfSliders: req.body.selectNumberOfSliders,
            selectAnswerType: req.body.selectAnswerType,
            correctAnswer: req.body.correctAnswer || null,
            isVoiceToText: req.body.isVoiceToText
          }, { new: true })



        } else if (req.body.selectAnswerType === "functionKeys") {

          var incidentPrioritiesIds = req.body.incidentPrioritiesId || [];
          var actionKeyIds = req.body.actionKeyId || [];

          if (!incidentPrioritiesIds || incidentPrioritiesIds.length === 0 || [0].some(index => incidentPrioritiesIds[index] === '')) {
            throw new Error('incidentPrioritiesId is required.');
          }
          if (!actionKeyIds || actionKeyIds.length === 0 || [0].some(index => actionKeyIds[index] === '')) {
            throw new Error('actionKeyId is required.');
          }

          var tacticalFunctionDelete = await TACTICAL_FUNCTION.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id })
          const deleteAddAnswerType = await TACTICAL_DECISION_GAME_ADD_ANSWER.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id });
          var delRatingScaleTexts = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id })

          var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
            minimumValue: null,
            maximumValue: null,
            minimumValue1: null,
            maximumValue1: null,
            correctAnswer: null,
            isVoiceToText: null,
            correctAnswer: req.body.correctAnswer,
            selectLine: req.body.selectLine,
            selectPosition: req.body.selectPosition,
            selectGoals: req.body.selectGoals,
            selectCategory: req.body.selectCategory,
            selectDecisivePointName: req.body.selectDecisivePointName,
            selectAnswerType: req.body.selectAnswerType,
            selectNumberOfSliders: req.body.selectNumberOfSliders,
            selectAnswerType: req.body.selectAnswerType,
            correctAnswer: req.body.correctAnswer || null,
          }, { new: true })

          for (let i = 0; i < incidentPrioritiesIds.length; i++) {
            const tacticalFunctionIncident = await TACTICAL_FUNCTION.create({
              tacticalDecisionGameId: tacticalDecisionGame.id,
              idType: 'incidentPriorities',
              incidentPrioritiesId: incidentPrioritiesIds[i] || null,
            });
            console.log("Created Tactical Function with Incident Priorities: ", tacticalFunctionIncident);
          }

          // Create a new TACTICAL_FUNCTION entry with the same tacticalDecisionGameId for each actionKeyId
          for (let i = 0; i < actionKeyIds.length; i++) {
            const tacticalFunctionAction = await TACTICAL_FUNCTION.create({
              tacticalDecisionGameId: tacticalDecisionGame.id,
              idType: 'actionKeys',
              actionKeysId: actionKeyIds[i] || null,
            });
            console.log("Created Tactical Function with Action Key: ", tacticalFunctionAction);
          }
        }
      }

      var FIND = await TACTICAL_DECISION_GAME.findById(tacticalDecisionGame._id)
      var findImage = await TACTICAL_DECISION_GAME_IMAGE.find({ tacticalDecisionGameId: tacticalDecisionGame._id })
      var findAddAnswerType = await TACTICAL_DECISION_GAME_ADD_ANSWER.find({ tacticalDecisionGameId: tacticalDecisionGame._id })
      console.log("findAddAnswerType", findAddAnswerType);
      var findBestPractices = await BEST_PRACTICES_DECISION_GAME.find({ tacticalDecisionGameId: tacticalDecisionGame._id })
      console.log("findBestPractices", findBestPractices);
      var findRatingScaleText = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.find({ tacticalDecisionGameId: tacticalDecisionGame._id })
      console.log("findRatingScaleText", findRatingScaleText);
      var findTacticalFunctionIncident = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: tacticalDecisionGame._id, idType: 'incidentPriorities' })
      console.log("findTacticalFunctionIncident", findTacticalFunctionIncident);
      var findTacticalFunctionAction = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: tacticalDecisionGame._id, idType: 'actionKeys' })
      // console.log("findTacticalFunctionAction", findTacticalFunctionAction);
      var objectivesPromisesIncident = findTacticalFunctionIncident.map(async (o) => {
        var incidentPriorities = await INCIDENT_PRIORITIES.findOne(({ _id: o.incidentPrioritiesId }))

        if (incidentPriorities) {
          if (incidentPriorities.icon || incidentPriorities.icon !== "" || incidentPriorities.icon !== null) {
            incidentPriorities.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + incidentPriorities.icon;
          }
        }

        var actionKeys = await ACTION_KEYS.findOne({ _id: o.actionKeysId })

        if (actionKeys) {
          if (actionKeys.icon || actionKeys.icon !== "" || actionKeys.icon !== null) {
            actionKeys.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + actionKeys.icon;
          }
        }

        var objectivesFind = await OBJECTIVES.find({ incidentPrioritiesId: o.incidentPrioritiesId });
        var actionListFind = await ACTION_LIST.find({ actionKeysId: o.actionKeysId });
        return {
          actionLists: actionListFind || null,
          incidentPrioritiesId: o.incidentPrioritiesId || null,
          incidentPrioritiesName: incidentPriorities || null,
          tacticalDecisionGameId: o.tacticalDecisionGameId || null,
          idType: o.idType || null,
          objectives: objectivesFind || null,
        };
      });

      var objectivesPromisesAction = findTacticalFunctionAction.map(async (o) => {
        var incidentPriorities = await INCIDENT_PRIORITIES.findOne(({ _id: o.incidentPrioritiesId }))
        if (incidentPriorities) {
          if (incidentPriorities.icon || incidentPriorities.icon !== "" || incidentPriorities.icon !== null) {
            incidentPriorities.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + incidentPriorities.icon;
          }
        }

        var actionKeys = await ACTION_KEYS.findOne({ _id: o.actionKeysId, isDeleted: false })
        if (actionKeys) {
          if (actionKeys.icon || actionKeys.icon !== "" || actionKeys.icon !== null) {
            actionKeys.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + actionKeys.icon;
          }
        }
        var objectivesFind = await OBJECTIVES.find({ incidentPrioritiesId: o.incidentPrioritiesId });
        var actionListFind = await ACTION_LIST.find({ actionKeysId: o.actionKeysId });
        return {
          actionKeyId: o.actionKeysId || null,
          actionKeyName: actionKeys || null,
          actionLists: actionListFind || null,
          tacticalDecisionGameId: o.tacticalDecisionGameId || null,
          idType: o.idType || null,
          objectives: objectivesFind || null,
        };
      });

      var objectivesDataIncident = await Promise.all(objectivesPromisesIncident);
      var objectivesDataAction = await Promise.all(objectivesPromisesAction);

      var object = [];

      if (findImage.length > 0) {
        for (let index = 0; index < findImage.length; index++) {
          const element = findImage[index];
          object.push({ 'image': element.image, 'audio': element.audio , 'answer' : element.answer })
        }
      }

      var response = {
        tdgLibraryId: FIND.tdgLibraryId,
        text: FIND.text,
        audio: FIND.audio,
        image: object,
        selectNumberOfSliders: FIND.selectNumberOfSliders,
        addAnswerTypes: findAddAnswerType,
        bestNames: findBestPractices,
        Texts: findRatingScaleText,
        selectTargetAudience: FIND.selectTargetAudience,
        timeLimit: FIND.timeLimit,
        selectAnswerType: FIND.selectAnswerType,
        minimumValue: FIND.minimumValue,
        maximumValue: FIND.maximumValue,
        minimumValue1: FIND.minimumValue,
        maximumValue1: FIND.maximumValue,
        correctAnswer: FIND.correctAnswer,
        isVoiceToText: FIND.isVoiceToText,
        selectLine: FIND.selectLine,
        selectPosition: FIND.selectPosition,
        selectGoals: FIND.selectGoals,
        selectCategory: FIND.selectCategory,
        selectDecisivePointName: FIND.selectDecisivePointName,
        priorityType: FIND.isPriorityType,
        publish: FIND.publish,
        numeric: FIND.numeric,
        texting: FIND.texting,
        isDeleted: FIND.isDeleted,
        tacticalFunctionWithObjectivesIncident: objectivesDataIncident,
        tacticalFunctionWithObjectivesAction: objectivesDataAction,
        createdAt: FIND.createdAt,
        updatedAt: FIND.updatedAt
      }
    }

    else {
      throw new Error("You can not access.");
    }

    res.status(200).json({
      status: "success",
      message: "Tactical Decision Game updated successfully.",
      data: response
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

exports.deleteTacticalDecisionGame = async function (req, res, next) {
  try {
    var id = req.params.id
    console.log("ROLE : -", req.role);
    if (req.role === "superAdmin") {
      console.log("super Admin logged in");
      var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(id, {
        isDeleted: true
      }, { new: true })
      console.log("tacticalDecisionGame", tacticalDecisionGame);

      var groupPlayFind = await GROUP_PLAY.find({ tacticalDecisionGameId: id, isDeleted: false });
      for (const game of groupPlayFind) {
        await GROUP_PLAY.findByIdAndUpdate(game._id, {
          isDeleted: true
        }, { new: true })
      }

      var playerRequestFind = await PLAYER_REQUEST.find({ tacticalDecisionGameId: id, isDeleted: false });
      for (const game of playerRequestFind) {
        await PLAYER_REQUEST.findByIdAndUpdate(game._id, {
          isDeleted: true
        }, { new: true })
      }

      var hostRequestFind = await HOST_REQUEST.find({ tacticalDecisionGameId: id, isDeleted: false });
      for (const game of hostRequestFind) {
        await HOST_REQUEST.findByIdAndUpdate(game._id, {
          isDeleted: true
        }, { new: true })
      }

      var image = await TACTICAL_DECISION_GAME_IMAGE.findOneAndDelete({
        tacticalDecisionGameId: tacticalDecisionGame.id,
      })
      console.log("image", image);
      var delBestPractices = await BEST_PRACTICES_DECISION_GAME.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id })

      var addAnswerTypes = await TACTICAL_DECISION_GAME_ADD_ANSWER.deleteMany({
        tacticalDecisionGameId: tacticalDecisionGame.id,
      })
      console.log("this is rating scale");

      console.log("Numeric");
      var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
        isDeleted: true
      }, { new: true })
      console.log("numeric", tacticalDecisionGame);


      var delRatingScaleTexts = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id })

      console.log("delRatingScaleTexts", delRatingScaleTexts);


      console.log("voiceToText");
      var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
        isDeleted: true
      }, { new: true })
      console.log("voiceToText", tacticalDecisionGame);


      var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
        isDeleted: true
      }, { new: true })
      console.log("functionKeys", tacticalDecisionGame);

    } else if (req.role === "organization") {
      console.log("Organization logged in");

      var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
      var tactical = await TACTICAL_DECISION_GAME.findOne({ _id: id, organizationId: organizationFind.id })
      if (!tactical) {
        throw new Error("TDG not created by your organization.")
      } else if (tactical.isDeleted === true) {
        throw new Error("This tactical is already deleted.")
      }

      if (req.body.publish) {
        var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
          publish: req.body.publish,
        }, { new: true })
      }

      var groupPlayFind = await GROUP_PLAY.find({ tacticalDecisionGameId: id, isDeleted: false });
      for (const game of groupPlayFind) {
        await GROUP_PLAY.findByIdAndUpdate(game._id, {
          isDeleted: true
        }, { new: true })
      }

      var playerRequestFind = await PLAYER_REQUEST.find({ tacticalDecisionGameId: id, isDeleted: false });
      for (const game of playerRequestFind) {
        await PLAYER_REQUEST.findByIdAndUpdate(game._id, {
          isDeleted: true
        }, { new: true })
      }

      var hostRequestFind = await HOST_REQUEST.find({ tacticalDecisionGameId: id, isDeleted: false });
      for (const game of hostRequestFind) {
        await HOST_REQUEST.findByIdAndUpdate(game._id, {
          isDeleted: true
        }, { new: true })
      }

      var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(id, {
        isDeleted: true
      }, { new: true })
      console.log("tacticalDecisionGame", tacticalDecisionGame);

      var image = await TACTICAL_DECISION_GAME_IMAGE.findOneAndDelete({
        tacticalDecisionGameId: tacticalDecisionGame.id,
      })
      console.log("image", image);
      var delBestPractices = await BEST_PRACTICES_DECISION_GAME.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id })

      var addAnswerTypes = await TACTICAL_DECISION_GAME_ADD_ANSWER.deleteMany({
        tacticalDecisionGameId: tacticalDecisionGame.id,
      })
      console.log("this is rating scale");

      console.log("Numeric");
      var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
        isDeleted: true
      }, { new: true })
      console.log("numeric", tacticalDecisionGame);

      console.log("texts");
      var delRatingScaleTexts = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.deleteMany({ tacticalDecisionGameId: tacticalDecisionGame.id })

      console.log("delRatingScaleTexts", delRatingScaleTexts);
      console.log("voiceToText");
      var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
        isDeleted: true
      }, { new: true })
      console.log("voiceToText", tacticalDecisionGame);


      var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(tacticalDecisionGame.id, {
        isDeleted: true
      }, { new: true })
      console.log("functionKeys", tacticalDecisionGame);

    } else {
      throw new Error("You can not access.");
    }
    res.status(200).json({
      status: "success",
      message: "Tactical Decision Game deleted successfully.",
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
}

exports.updateTacticalDecisionGamePublish = async function (req, res, next) {
  try {
    if (!req.params.id) {
      throw new Error("id is required.")
    }
    var find = await TACTICAL_DECISION_GAME.findById(req.params.id)
    var tdg = await TACTICAL_DECISION_GAME.findByIdAndUpdate(req.params.id, {
      publish: req.body.publish
    }, { new: true });

    let message;
    if (tdg.publish === true) {
      message = 'tactical decision game published successfully'
    } else if (tdg.publish === false) {
      message = 'tactical decision game unpublished successfully'
    }

    res.status(200).json({
      status: 'success',
      message: message,
      data: tdg
    })
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: error.message
    })
  }
}