const TACTICAL_DECISION_GAME = require("../models/tacticalDecisionGameModel");
const TACTICAL_DECISION_GAME_IMAGE = require("../models/tacticalDecisionGameImageModel");
const TACTICAL_DECISION_GAME_ADD_ANSWER = require("../models/tacticalDecisionGameAddAnswerModel");
const BEST_PRACTICES_DECISION_GAME = require("../models/bestPracticesDecisionGameModel");
const TACTICAL_DECISION_GAME_RATING_SCALE_TEXT = require("../models/tacticalDecisionGameRatingScaleTextModel");
const ORGANIZATION = require("../models/organizationModel");
const TDG_LIBRARY = require("../models/tdgLibraryModel");
const mongoose = require("mongoose");
const PROFILE = require('../models/profileModel');
const TACTICAL_DECISION_GAME_LIST_ANSWER = require("../models/appTacticalDecisionGameListAnswerModel");
const USER = require("../models/userModel");
const THINKING_PLANNING = require("../models/thinkingPlanningModel")
const THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST = require("../models/thinkingPlaningSelectAnswerTypeListModel")
const THINKING_PLANNING_TEXT = require("../models/thinkingPlanningTextModel")
var OBJECTIVES = require ('../models/objectivesModel');
const INCIDENT_PRIORITIES = require('../models/incidentPrioritiesModel');
const RESPONSE_TYPE = require('../models/responseTypeModel');
const FUNCTION_KEY_ANSWER = require('../models/appFunctionKeyAnswerModel');
const ACTION_LIST = require('../models/actionListModel');
const ACTION_KEYS = require('../models/actionKeysModel');
const ASSIGNMENTS = require('../models/assignmentModel');
const INCIDENT_TYPE = require('../models/incidentTypeModel');
const GROUP_PLAYER = require("../models/appGroupPlayerModel");
var GROUP_PLAY = require("../models/appGroupPlayModel");
const TACTICAL_FUNCTION = require("../models/tacticalFunctionModel");


exports.getAllData = async function (req, res, next) {
try {
  if (req.role === 'superAdmin') {
    var responseType = await RESPONSE_TYPE.find({isDeleted : false})
    var incidentType = await INCIDENT_TYPE.find({isDeleted : false})
    var assignment = await ASSIGNMENTS.find({isDeleted : false})
    var tdgLibrary = await TDG_LIBRARY.find({isDeleted : false})
  }else if (req.role === 'organization'){

    var profile = await PROFILE.findOne({ userId: req.userId }).populate('userId');

    console.log("#$$#%$#$$$$$$$ " + profile);

    var responseType = await RESPONSE_TYPE.find({organizationId: profile.organizationId, isDeleted : false})
    var incidentType = await INCIDENT_TYPE.find({organizationId: profile.organizationId,isDeleted : false})
    var assignment = await ASSIGNMENTS.find({organizationId: profile.organizationId,isDeleted : false})
    var tdgLibrary = await TDG_LIBRARY.find({organizationId: profile.organizationId,isDeleted : false})
  } else if (req.role === 'fireFighter') {
    let findProfile = await PROFILE.findOne({ userId : req.userId })
    var profile = await PROFILE.findOne({ userId: req.userId }).populate('userId');

    console.log("#$$#%$#$$$$$$$ " + profile);

    // var responseType = await RESPONSE_TYPE.find({organizationId: profile.organizationId, isDeleted : false})
    // var incidentType = await INCIDENT_TYPE.find({organizationId: profile.organizationId,isDeleted : false})
    // var assignment = await ASSIGNMENTS.find({organizationId: profile.organizationId,isDeleted : false})
    // var tdgLibrary = await TDG_LIBRARY.find({organizationId: profile.organizationId, publish: true, isDeleted : false})

    var responseType = await RESPONSE_TYPE.find({isDeleted : false ,  organizationId : findProfile.organizationId })
    var incidentType = await INCIDENT_TYPE.find({isDeleted : false ,  organizationId : findProfile.organizationId })
    var assignment = await ASSIGNMENTS.find({isDeleted : false ,  organizationId : findProfile.organizationId })
    var tdgLibrary = await TDG_LIBRARY.find({publish: true, isDeleted : false ,  organizationId : findProfile.organizationId })
  }
  
  else {
    throw new error ("You can not access.")
  }

  var response ={
    responseTypes : responseType,
    incidentTypes : incidentType,
    assignments : assignment,
    tdgLibraries : tdgLibrary
  }
  console.log("response",response)
  res.status(200).json({
    status : 'success',
    message : 'get all data successfully.',
    data : response
  })
} catch (error) {
  res.status(400).json({
    status : 'failed',
    message : error.message
  })
}
};

exports.getTacticalDecisionGameAndTdgLibrary = async function (req, res, next) {
try {
  var id = req.params.id;
  console.log(id);
  console.log("ROLE =>>>>>>", req.role);
  if (req.role === "superAdmin") {
    var tacticalDecisionGame = await TACTICAL_DECISION_GAME.find({
      tdgLibraryId: id,
      isDeleted: false,
    }).populate("tdgLibraryId");
    console.log("get", tacticalDecisionGame);
    var response = await Promise.all(
      tacticalDecisionGame.map(async (record) => {
        var findImage = await TACTICAL_DECISION_GAME_IMAGE.find({
          tacticalDecisionGameId: record.id,
        });
        //console.log("findImage",findImage);
        var findAddAnswerType = await TACTICAL_DECISION_GAME_ADD_ANSWER.find({
          tacticalDecisionGameId: record.id,
        });
        //console.log("findAddAnswerType",findAddAnswerType);
        var findBestPractices = await BEST_PRACTICES_DECISION_GAME.find({
          tacticalDecisionGameId: record.id,
        });
        //console.log("findBestPractices",findBestPractices);
        var findRatingScaleText =
          await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.find({
            tacticalDecisionGameId: record.id,
          });
        //console.log("findRatingScaleText",findRatingScaleText);

        var obj = {
          tdgLibraryId: record.tdgLibraryId.id,
          goalObjective: record.tdgLibraryId.goalObjective,
          tacticalDecisionGameId: record.id,
          selectAnswerType: record.selectAnswerType,
          missionBriefing: record.tdgLibraryId.missionBriefing || null,
          text: record.text,
          audio: record.audio,
          image: findImage,
          addAnswerTypes: findAddAnswerType,
          bestNames: findBestPractices,
          texts: findRatingScaleText,
          selectTargetAudience: record.selectTargetAudience,
          timeLimit: record.timeLimit,
          numeric: record.numeric,
          texting: record.texting,
          minimumValue: record.minimumValue,
          maximumValue: record.maximumValue,
          correctAnswer: record.correctAnswer,
          isVoiceToText: record.isVoiceToText,
          selectLine: record.selectLine,
          selectPosition: record.selectPosition,
          selectGoals: record.selectGoals,
          selectCategory: record.selectCategory,
          selectDecisivePointName: record.selectDecisivePointName,
          isPriorityType: record.isPriorityType,
          isDeleted: record.isDeleted,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        };
        return obj;
      })
    );
  } else if (req.role === "organization" || req.role === "fireFighter") {
    var organizationFind = await ORGANIZATION.findOne({ userId: req.userId });
    var tacticalDecisionGame = await TACTICAL_DECISION_GAME.find({
      tdgLibraryId: id,
      isDeleted: false,
      organizationId: organizationFind.id,
    }).populate("tdgLibraryId");
    console.log("get", tacticalDecisionGame);
    var response = await Promise.all(
      tacticalDecisionGame.map(async (record) => {
        var findImage = await TACTICAL_DECISION_GAME_IMAGE.find({
          tacticalDecisionGameId: record.id,
        });
        //console.log("findImage",findImage);
        var findAddAnswerType = await TACTICAL_DECISION_GAME_ADD_ANSWER.find({
          tacticalDecisionGameId: record.id,
        });
        //console.log("findAddAnswerType",findAddAnswerType);
        var findBestPractices = await BEST_PRACTICES_DECISION_GAME.find({
          tacticalDecisionGameId: record.id,
        });
        //console.log("findBestPractices",findBestPractices);
        var findRatingScaleText =
          await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.find({
            tacticalDecisionGameId: record.id,
          });
        //console.log("findRatingScaleText",findRatingScaleText);

        var obj = {
          tdgLibraryId: record.tdgLibraryId.id,
          goalObjective: record.tdgLibraryId.goalObjective,
          tacticalDecisionGameId: record.id,
          selectAnswerType: record.selectAnswerType,
          missionBriefing: record.tdgLibraryId.missionBriefing || null,
          text: record.text,
          audio: record.audio,
          image: findImage,
          addAnswerTypes: findAddAnswerType,
          bestNames: findBestPractices,
          texts: findRatingScaleText,
          selectTargetAudience: record.selectTargetAudience,
          timeLimit: record.timeLimit,
          numeric: record.numeric,
          texting: record.texting,
          minimumValue: record.minimumValue,
          maximumValue: record.maximumValue,
          correctAnswer: record.correctAnswer,
          isVoiceToText: record.isVoiceToText,
          selectLine: record.selectLine,
          selectPosition: record.selectPosition,
          selectGoals: record.selectGoals,
          selectCategory: record.selectCategory,
          selectDecisivePointName: record.selectDecisivePointName,
          isPriorityType: record.isPriorityType,
          isDeleted: record.isDeleted,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        };
        return obj;
      })
    );
  }else {
    throw new Error ('you can not access.')
  }

  res.status(200).json({
    status: "success",
    message: "get successfully.",
    data: response,
  });
} catch (error) {
  res.status(400).json({
    status: "failed",
    message: error.message,
  });
}
};

exports.saveTacticalDecisionGameListAnswer = async function (req, res, next) {
try {
  if (!req.body.answerType) {
    throw new Error("AnswerType must be required.");
  }
  if (req.role === "superAdmin") {
  var ansArray = [];
  var findTacticalDecisionGame = await TACTICAL_DECISION_GAME.findOne({
    _id: req.body.tacticalDecisionGameId,
  });

  if (!findTacticalDecisionGame) {
    throw new Error("tactical decision game not found");
  } else if (findTacticalDecisionGame.isDeleted === true) {
    throw new Error("tactical decision game is already deleted");
  }
  var findTdg = await TDG_LIBRARY.findOne({ _id: req.body.tdgLibraryId });
  if (!findTdg) {
    throw new Error("Tdg not found");
  } else if (findTdg.isDeleted === true) {
    throw new Error("Tdg is already deleted");
  }

  if (req.body.answerType === "list") {
      if (!req.body.ans) {
        throw new Error("you have to sent answers");
      }
      for (let index = 0; index < req.body.ans.length; index++) {
        const ans = req.body.ans[index];
        if (!ans.answerId || ans.answerId.length === 0) {
          // If no answerId is provided, push an entry with a null answerId
          ansArray.push({
            imageId: ans.imageId,
            answerId: null,
          });
        } else {
          for (let i = 0; i < ans.answerId.length; i++) {
            var findImage = await TACTICAL_DECISION_GAME_IMAGE.findOne({
              _id: ans.imageId,
            });
            if (!findImage) {
              throw new Error("tactical decision image is not found");
            } else if (findImage.isDeleted === true) {
              throw new Error("tactical decision image is already deleted");
            }
            var findAnswer = await TACTICAL_DECISION_GAME_ADD_ANSWER.findOne({
              _id: ans.answerId[i],
            });
            if (!findAnswer) {
              throw new Error("tactical decision answer is not found");
            } else if (findAnswer.isDeleted === true) {
              throw new Error("tactical decision answer is already deleted");
            }

            var listAnswer = await TACTICAL_DECISION_GAME_LIST_ANSWER.create({
              tacticalDecisionGameId: req.body.tacticalDecisionGameId,
              tdgLibraryId: req.body.tdgLibraryId,
              userId: req.body.userId,
              imageId: ans.imageId || null,
              answerId: ans.answerId[i] || null,
              groupPlayId : req.body.groupPlayId || null,
              answerType: req.body.answerType,
              ratingScale1: null,
              ratingScale2: null,
              answer: null,
              isDeleted: false,
            });
            ansArray.push(listAnswer);
          }
        }
      }

      var imageAndAnswer = await Promise.all(
        ansArray.map(async (record) => {
          var images = await TACTICAL_DECISION_GAME_IMAGE.findOne({
            _id: record.imageId,
          });
         
          var answerName = null;

          if (record.answerId) {
            const answers = await TACTICAL_DECISION_GAME_ADD_ANSWER.findOne({
              _id: record.answerId,
            });

            answerName = answers.answer;
          }
          
          var obj = {
            tacticalDecisionGameImage: images.image,
            answerName: answerName,
            // statistics : percentage + "%"
          };
          return obj;
        })
      );
      var findBestPractices = await BEST_PRACTICES_DECISION_GAME.find({
        tacticalDecisionGameId: req.body.tacticalDecisionGameId,
      });

      var groupedData = imageAndAnswer.reduce((result, current) => {
        const key = current.tacticalDecisionGameImage._id.toString();
    
        if (!result[key]) {
            result[key] = {
              tacticalDecisionGameImage : {
                image: current.tacticalDecisionGameImage.image,
                audio: current.tacticalDecisionGameImage.audio,
                answer: current.tacticalDecisionGameImage.answer,
              },
              answerNames: current.answerName ? [current.answerName] : [],
            };
        } else {
            result[key].answerNames.push(current.answerName);
        }
    
        return result;
    }, {});
    
    var groupedArray = Object.values(groupedData);

      var response = {
        tacticalDecisionGameId: req.body.tacticalDecisionGameId,
        tdgLibraryId: req.body.tdgLibraryId,
        answerType: req.body.answerType,
        userId: req.body.userId,
        ratingScale1: req.body.ratingScale1 || null,
        ratingScale2: req.body.ratingScale2 || null,
        answer: req.body.answer || null,
        links: null,
        bestPractices: findBestPractices, 
        images: groupedArray,
      };
  } else if (req.body.answerType === "ratingScale") {
      for (let index = 0; index < req.body.ans.length; index++) {
        const ans = req.body.ans[index];
        if (!ans.answerId || ans.answerId.length === 0) {
          // If no answerId is provided, push an entry with a null answerId
          ansArray.push({
            imageId: ans.imageId,
            answerId: null,
          });
        } 
        else {
          for (let i = 0; i < ans.answerId.length; i++) {
            var findImage = await TACTICAL_DECISION_GAME_IMAGE.findOne({
              _id: ans.imageId,
            });
            if (!findImage) {
              throw new Error("tactical decision image is not found");
            } else if (findImage.isDeleted === true) {
              throw new Error("tactical decision image is already deleted");
            }
            var listAnswer = await TACTICAL_DECISION_GAME_LIST_ANSWER.create({
              tacticalDecisionGameId: req.body.tacticalDecisionGameId,
              tdgLibraryId: req.body.tdgLibraryId,
              groupPlayId : req.body.groupPlayId || null,
              userId: req.body.userId,
              imageId: ans.imageId || null,
              ratingScale1: ans.answerId[i] || null,
              answerType: req.body.answerType,
              // ratingScale1: req.body.ratingScale1 || null,
              // ratingScale2: req.body.ratingScale2 || null,
              answer: null,
              isDeleted: false,
            });
            ansArray.push(listAnswer);

            console.log("ratingScale1", listAnswer);
          }
        }
      }
      console.log("ansArray", ansArray);
      var imageAndAnswer = await Promise.all(
        ansArray.map(async (record) => {
          // console.log("tacticalDecisionGameId",record.tacticalDecisionGameId);
          var images = await TACTICAL_DECISION_GAME_IMAGE.findOne({
            _id: record.imageId,
          });
          // var answers = await TACTICAL_DECISION_GAME_ADD_ANSWER.findOne({
          //   _id: record.answerId,
          // });
          var answerName = null;

          if (record.ratingScale1) {
            const answers = await TACTICAL_DECISION_GAME_LIST_ANSWER.findOne({
              ratingScale1: record.ratingScale1,
            });
            answerName = answers.ratingScale1;
          }
          console.log("answerName", answerName);
          //console.log(listAnswer);
          // var percentage = listAnswer.length
          // console.log("percentage",percentage);
          var obj = {
            tacticalDecisionGameImage: images.image,
            answerName: answerName,
            // statistics : percentage + "%"
          };
          return obj;
        })
      );
      var findBestPractices = await BEST_PRACTICES_DECISION_GAME.find({
        tacticalDecisionGameId: req.body.tacticalDecisionGameId,
      });

      var groupedImages = imageAndAnswer.reduce((acc, obj) => {
        const existingImage = acc.find((item) =>item.tacticalDecisionGameImage === obj.tacticalDecisionGameImage);
        if (existingImage) {
          existingImage.answerNames.push(obj.answerName);
        } else {
          acc.push({
            tacticalDecisionGameImage: obj.tacticalDecisionGameImage,
            answerNames: [obj.answerName],
            answer: obj.answer,
          });
        }
        return acc;
      }, []);

      var response = {
        tacticalDecisionGameId: req.body.tacticalDecisionGameId,
        tdgLibraryId: req.body.tdgLibraryId,
        answerType: req.body.answerType,
        userId: req.body.userId,
        ratingScale1: req.body.ratingScale1 || null,
        ratingScale2: req.body.ratingScale2 || null,
        answer: req.body.answer || null,
        links: null,
        bestPractices: findBestPractices,
        images: groupedImages,
      };

//----------------------------------------------------------------VOICE TO TEXT----------------------------------------------------------------

    } else if (req.body.answerType === "voiceToText") {

      for (let index = 0; index < req.body.ans.length; index++) {
        const ans = req.body.ans[index];
        if (!ans.answerId || ans.answerId.length === 0) {
          // If no answerId is provided, push an entry with a null answerId
          ansArray.push({
            imageId: ans.imageId,
            answerId: null,
          });
        } else {
          for (let i = 0; i < ans.answerId.length; i++) {
            var findImage = await TACTICAL_DECISION_GAME_IMAGE.findOne({
              _id: ans.imageId,
            });
            if (!findImage) {
              throw new Error("tactical decision image is not found");
            } else if (findImage.isDeleted === true) {
              throw new Error("tactical decision image is already deleted");
            }

            var listAnswer = await TACTICAL_DECISION_GAME_LIST_ANSWER.create({
              tacticalDecisionGameId: req.body.tacticalDecisionGameId,
              tdgLibraryId: req.body.tdgLibraryId,
              groupPlayId : req.body.groupPlayId || null,
              userId: req.body.userId,
              imageId: ans.imageId || null,
              answer : ans.answerId[i] || null,
              answerType: req.body.answerType,
              // ratingScale1: req.body.ratingScale1 || null,
              // ratingScale2: req.body.ratingScale2 || null,
              // answer: null,
              isDeleted: false,
            });
            ansArray.push(listAnswer);

            console.log("answer", listAnswer);
          }
        }
      }
      console.log("ansArray", ansArray);
      var imageAndAnswer = await Promise.all(
        ansArray.map(async (record) => {
          // console.log("tacticalDecisionGameId",record.tacticalDecisionGameId);
          var images = await TACTICAL_DECISION_GAME_IMAGE.findOne({
            _id: record.imageId,
          });
          // var answers = await TACTICAL_DECISION_GAME_ADD_ANSWER.findOne({
          //   _id: record.answerId,
          // });
          var answerName = null;

          if (record.answer) {
            const answers = await TACTICAL_DECISION_GAME_LIST_ANSWER.findOne({
              answer: record.answer,
            });
            answerName = answers.answer;
          }
          console.log("answerName", answerName);
          //console.log(listAnswer);
          // var percentage = listAnswer.length
          // console.log("percentage",percentage);
          var obj = {
            tacticalDecisionGameImage: {
              image : images.image,
              audio : images.audio,
              answer : images.answer
            },
            answerName: answerName,
            // statistics : percentage + "%"
          };
          return obj;
        })
      );
      var findBestPractices = await BEST_PRACTICES_DECISION_GAME.find({
        tacticalDecisionGameId: req.body.tacticalDecisionGameId,
      });

      var groupedImages = imageAndAnswer.reduce((acc, obj) => {
        const existingImage = acc.find((item) =>item.tacticalDecisionGameImage === obj.tacticalDecisionGameImage);
        if (existingImage) {
          existingImage.answerNames.push(obj.answerName);
        } else {
          acc.push({
            tacticalDecisionGameImage: obj.tacticalDecisionGameImage,
            answerNames: obj.answerName ? [obj.answerName] : [],
            answer: obj.answer ? obj.answer : [],
          });
        }
        return acc;
      }, []);

      var response = {
        tacticalDecisionGameId: req.body.tacticalDecisionGameId,
        tdgLibraryId: req.body.tdgLibraryId,
        answerType: req.body.answerType,
        userId: req.body.userId,
        groupPlayId : req.body.groupPlayId || null,
        ratingScale1: req.body.ratingScale1 || null,
        ratingScale2: req.body.ratingScale2 || null,
        answer: req.body.answer || null,
        links: null,
        bestPractices: findBestPractices,
        images: groupedImages,
      };
      // var listAnswer = await TACTICAL_DECISION_GAME_LIST_ANSWER.create({
      //   tacticalDecisionGameId: req.body.tacticalDecisionGameId,
      //   tdgLibraryId: req.body.tdgLibraryId,
      //   userId: req.body.userId,
      //   imageId: null,
      //   answerId: null,
      //   answerType: req.body.answerType,
      //   ratingScale1: null,
      //   ratingScale2: null,
      //   answer: req.body.answer,
      //   isDeleted: false,
      // });

      // var findBestPractices = await BEST_PRACTICES_DECISION_GAME.find({
      //   tacticalDecisionGameId: req.body.tacticalDecisionGameId,
      // });
      // var response = {
      //   tacticalDecisionGameId: listAnswer.tacticalDecisionGameId,
      //   tdgLibraryId: listAnswer.tdgLibraryId,
      //   answerType: listAnswer.answerType,
      //   userId: listAnswer.userId,
      //   ratingScale1: listAnswer.ratingScale1 || null,
      //   ratingScale2: listAnswer.ratingScale2 || null,
      //   answer: listAnswer.answer || null,
      //   links: null,
      //   bestPractices: findBestPractices,
      //   images: null,
      // };
    }
  }else if (req.role === "organization"|| req.role === "fireFighter"){
    var ansArray = [];
    var findTacticalDecisionGame = await TACTICAL_DECISION_GAME.findOne({
      _id: req.body.tacticalDecisionGameId,
    });
    console.log(findTacticalDecisionGame);

    if (!findTacticalDecisionGame) {
      throw new Error("tactical decision game not found");
    } else if (findTacticalDecisionGame.isDeleted === true) {
      throw new Error("tactical decision game is already deleted");
    }
    var findTdg = await TDG_LIBRARY.findOne({ _id: req.body.tdgLibraryId });
    if (!findTdg) {
      throw new Error("Tdg not found");
    } else if (findTdg.isDeleted === true) {
      throw new Error("Tdg is already deleted");
    }

    if (req.body.answerType === "list") {
        if (!req.body.ans) {
            throw new Error("you have to sent answers");
        }
        for (let index = 0; index < req.body.ans.length; index++) {
            const ans = req.body.ans[index];
            // Check if imageId is provided, if not, set it to null
            const imageId = ans.imageId ? ans.imageId : null;
            if (!ans.answerId || ans.answerId.length === 0) {
                // If no answerId is provided, push an entry with a null answerId
                ansArray.push({
                    imageId: imageId,
                    answerId: null,
                });
            } else {
                for (let i = 0; i < ans.answerId.length; i++) {
                    // If imageId is empty or not provided, set answer to null
                    const answer = imageId ? null : "audio_url"; // Replace "audio_url" with the actual audio URL
                    // No need to search for image if imageId is empty or not provided

                    var findAnswer = await TACTICAL_DECISION_GAME_ADD_ANSWER.findOne({
                        _id: ans.answerId[i],
                    });
                    if (!findAnswer) {
                        throw new Error("tactical decision answer is not found");
                    } else if (findAnswer.isDeleted === true) {
                        throw new Error("tactical decision answer is already deleted");
                    }

                    var listAnswer = await TACTICAL_DECISION_GAME_LIST_ANSWER.create({
                        tacticalDecisionGameId: req.body.tacticalDecisionGameId,
                        tdgLibraryId: req.body.tdgLibraryId,
                        userId: req.body.userId,
                        groupPlayId: req.body.groupPlayId || null,
                        imageId: imageId || null,
                        answerId: ans.answerId[i] || null,
                        answerType: req.body.answerType,
                        ratingScale1: null,
                        ratingScale2: null,
                        answer: answer, // Assign the audio URL to answer if imageId is empty or not provided
                        isDeleted: false,
                    });
                    ansArray.push(listAnswer);
                }
            }
        }

        var imageAndAnswer = await Promise.all(
            ansArray.map(async (record) => {
                var answer = null;
                var images = await TACTICAL_DECISION_GAME_IMAGE.findOne({
                  _id: record.imageId,
              });
              if (!images) {
                  throw new Error("tactical decision image is not found");
              }
                var answerName = null;

                if (record.answerId) {
                    const answers = await TACTICAL_DECISION_GAME_ADD_ANSWER.findOne({
                        _id: record.answerId,
                    });

                    answerName = answers.answer;
                }

                var obj = {
                    tacticalDecisionGameImage: images, // Here you're accessing the image property, so make sure images is not null
                    answerName: answerName,
                    answer: images.answer,
                };
                return obj;
            })
        );

        var findBestPractices = await BEST_PRACTICES_DECISION_GAME.find({
            tacticalDecisionGameId: req.body.tacticalDecisionGameId,
        });

        var groupedData = imageAndAnswer.reduce((result, current) => {
          const key = current.tacticalDecisionGameImage._id.toString();
      
          if (!result[key]) {
              result[key] = {
                tacticalDecisionGameImage : {
                  image: current.tacticalDecisionGameImage.image,
                  audio: current.tacticalDecisionGameImage.audio,
                  answer: current.tacticalDecisionGameImage.answer,
                },
                answerNames: current.answerName ? [current.answerName] : [],
              };
          } else {
              result[key].answerNames.push(current.answerName);
          }
      
          return result;
      }, {});
      
      var groupedArray = Object.values(groupedData);

        var response = {
            tacticalDecisionGameId: req.body.tacticalDecisionGameId,
            tdgLibraryId: req.body.tdgLibraryId,
            answerType: req.body.answerType,
            userId: req.body.userId,
            ratingScale1: req.body.ratingScale1 || null,
            ratingScale2: req.body.ratingScale2 || null,
            answer: req.body.answer || null,
            links: null,
            bestPractices: findBestPractices,
            images: groupedArray,
        };

//----------------------------------------------------------------RATING SCALE----------------------------------------------------------------

    } else if (req.body.answerType === "ratingScale") {
      if (!req.body.ans) {
          throw new Error("you have to sent answers");
      }
      for (let index = 0; index < req.body.ans.length; index++) {
          const ans = req.body.ans[index];
          if (!ans.answerId || ans.answerId.length === 0) {
              // If no answerId is provided, push an entry with a null answerId
              ansArray.push({
                  imageId: ans.imageId,
                  answerId: null,
              });
          } else {
              for (let i = 0; i < ans.answerId.length; i++) {

                  var findImage = await TACTICAL_DECISION_GAME_IMAGE.findOne({
                      _id: ans.imageId,
                  });
                  if (!findImage) {
                      throw new Error("tactical decision image is not found");
                  } else if (findImage.isDeleted === true) {
                      throw new Error("tactical decision image is already deleted");
                  }
  
                  var listAnswer = await TACTICAL_DECISION_GAME_LIST_ANSWER.create({
                      tacticalDecisionGameId: req.body.tacticalDecisionGameId,
                      tdgLibraryId: req.body.tdgLibraryId,
                      userId: req.body.userId,
                      groupPlayId: req.body.groupPlayId || null,
                      imageId: ans.imageId || null,
                      ratingScale1: ans.answerId[i] || null,
                      answerType: req.body.answerType,
                      answer: null,
                      isDeleted: false,
                  });
                  ansArray.push(listAnswer);
              }
          }
      }
  
      var imageAndAnswer = await Promise.all(
          ansArray.map(async (record) => {
            var answerName = null;

            var images = await TACTICAL_DECISION_GAME_IMAGE.findOne({
              _id: record.imageId,
          });
          if (!images) {
              throw new Error("tactical decision image is not found");
          }

              if (record.ratingScale1) {
                  const answers = await TACTICAL_DECISION_GAME_LIST_ANSWER.findOne({
                      ratingScale1: record.ratingScale1,
                  });
                  answerName = answers.ratingScale1;
              }
  
              var obj = {
                  tacticalDecisionGameImage: images,
                  answerName: answerName,
                  answer : images.answer
              };
              return obj;
          })
      );
  
      var findBestPractices = await BEST_PRACTICES_DECISION_GAME.find({
          tacticalDecisionGameId: req.body.tacticalDecisionGameId,
      });
  
      var groupedImages = imageAndAnswer.reduce((acc, obj) => {
        const existingImage = acc.find(item => item.tacticalDecisionGameImage._id.toString() === obj.tacticalDecisionGameImage._id.toString());
        if (existingImage) {
            existingImage.answerNames.push(obj.answerName);
        } else {
            acc.push({
                tacticalDecisionGameImage: obj.tacticalDecisionGameImage,
                answerNames: [obj.answerName],
                answer: obj.answer, 
            });
        }
        return acc;
    }, []);
  
      var response = {
          tacticalDecisionGameId: req.body.tacticalDecisionGameId,
          tdgLibraryId: req.body.tdgLibraryId,
          answerType: req.body.answerType,
          userId: req.body.userId,
          groupPlayId: req.body.groupPlayId || null,
          ratingScale1: req.body.ratingScale1 || null,
          ratingScale2: req.body.ratingScale2 || null,
          answer: req.body.answer || null,
          links: null,
          bestPractices: findBestPractices,
          images: groupedImages,
      };


//----------------------------------------------------------------VOICE TO TEXT----------------------------------------------------------------

    } else if (req.body.answerType === "voiceToText") {

      for (let index = 0; index < req.body.ans.length; index++) {
        const ans = req.body.ans[index];
        if (!ans.answerId || ans.answerId.length === 0) {
          // If no answerId is provided, push an entry with a null answerId
          ansArray.push({
            imageId: ans.imageId,
            answerId: null,
          });
        } else {
          for (let i = 0; i < ans.answerId.length; i++) {
            var findImage = await TACTICAL_DECISION_GAME_IMAGE.findOne({
              _id: ans.imageId,
            });
            if (!findImage) {
              throw new Error("tactical decision image is not found");
            } else if (findImage.isDeleted === true) {
              throw new Error("tactical decision image is already deleted");
            }

            var listAnswer = await TACTICAL_DECISION_GAME_LIST_ANSWER.create({
              tacticalDecisionGameId: req.body.tacticalDecisionGameId,
              tdgLibraryId: req.body.tdgLibraryId,
              userId: req.body.userId,
              groupPlayId : req.body.groupPlayId || null,
              imageId: ans.imageId || null,
              answer : ans.answerId[i] || null,
              answerType: req.body.answerType,
              // ratingScale1: req.body.ratingScale1 || null,
              // ratingScale2: req.body.ratingScale2 || null,
              // answer: null,
              isDeleted: false,
            });
            ansArray.push(listAnswer);

            console.log("answer", listAnswer);
          }
        }
      }
      console.log("ansArray", ansArray);
      var imageAndAnswer = await Promise.all(
        ansArray.map(async (record) => {
          // console.log("tacticalDecisionGameId",record.tacticalDecisionGameId);
          var images = await TACTICAL_DECISION_GAME_IMAGE.findOne({
            _id: record.imageId,
          });
          // var answers = await TACTICAL_DECISION_GAME_ADD_ANSWER.findOne({
          //   _id: record.answerId,
          // });
          var answerName = null;

          if (record.answer) {
            const answers = await TACTICAL_DECISION_GAME_LIST_ANSWER.findOne({
              answer: record.answer,
            });
            answerName = answers.answer;
          }
          console.log("answerName", answerName);
          //console.log(listAnswer);
          // var percentage = listAnswer.length
          // console.log("percentage",percentage);
          var obj = {
            tacticalDecisionGameImage: {
              image : images.image,
              audio : images.audio,
              answer : images.answer
            },
            answerName: answerName,
            // statistics : percentage + "%"
          };
          return obj;
        })
      );
      var findBestPractices = await BEST_PRACTICES_DECISION_GAME.find({
        tacticalDecisionGameId: req.body.tacticalDecisionGameId,
      });

      var groupedImages = imageAndAnswer.reduce((acc, obj) => {
        const existingImage = acc.find((item) =>item.tacticalDecisionGameImage === obj.tacticalDecisionGameImage);
        if (existingImage) {
          existingImage.answerNames.push(obj.answerName);
        } else {
          acc.push({
            tacticalDecisionGameImage: obj.tacticalDecisionGameImage,
            answerNames: obj.answerName ? [obj.answerName] : [],
            answer : obj.answer
          });
        }
        return acc;
      }, []);

      var response = {
        tacticalDecisionGameId: req.body.tacticalDecisionGameId,
        tdgLibraryId: req.body.tdgLibraryId,
        answerType: req.body.answerType,
        userId: req.body.userId,
        groupPlayId : req.body.groupPlayId || null,
        ratingScale1: req.body.ratingScale1 || null,
        ratingScale2: req.body.ratingScale2 || null,
        answer: req.body.answer || null,
        links: null,
        bestPractices: findBestPractices,
        images: groupedImages,
      };
      
    }

  } else {
    throw new Error("you can not access");
  }

  res.status(200).json({
    status: "success",
    message: "data saved successfully",
    data: response,
  });
} catch (error) {
  res.status(400).json({
    status: "failed",
    message: error.message,
  });
}
};


exports.getStatistics = async function (req, res, next) {
  try {
    console.log("role" + req.role);
    var tacId = req.params.id;
  
    var find = await TACTICAL_DECISION_GAME_LIST_ANSWER.findOne({
      answerType : 'list',
      tacticalDecisionGameId: tacId,
    }).sort({ createdAt: -1 }).populate('tacticalDecisionGameId')

    console.log(find)

    if (!find) {
      return res.status(200).json({
        status: "success",
        message: "Get Statistics successfully.",
        data: []
      });
    }
    // console.log(find.tacticalDecisionGameId.isPriorityType)

    let data = await TACTICAL_DECISION_GAME_LIST_ANSWER.aggregate([
        {
          $match: { 
            tacticalDecisionGameId : new mongoose.Types.ObjectId(tacId)
          },
        },
        {
          $facet: {
            totalUserCount: [
              {
                $group: {
                  _id: "$userId",
                },
              },
              {
                $count: "count",
              },
            ],
            images: [
              {
                $group: {
                  _id: {
                    imageId: "$imageId",
                    answerId: "$answerId",
                  },
                  users: {
                    $addToSet: "$userId",
                  },
                },
              },
              {
                $group: {
                  _id: "$_id.imageId",
                  answers: {
                    $push: {
                      answerId: "$_id.answerId",
                      users: "$users",
                    },
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  imageId: "$_id",
                  answers: 1,
                },
              },
              {
                $lookup: {
                  from: "tacticaldecisiongameimages", // Replace with the actual name of your image collection
                  localField: "imageId",
                  foreignField: "_id",
                  as: "imageId",
                },
              },
              {
                $project: {
                  _id: 0,
                  image: { $arrayElemAt: ["$imageId.image", 0] },
                  audio: { $arrayElemAt: ["$imageId.audio",0]},
                  answers: 1,
                },
              },
              {
                $match: {
                  image: { $ne: null }
                }
              },
            ],
          },
        },
    ]);
    
    // console.log(find);
    // Extract the counts and group details
    const totalUserCount = data[0].totalUserCount[0].count;
    let images = data[0].images;
    
    images.forEach(async(image) => {
      image.answers.forEach((answer) => {
        console.log("%%%%%% " + answer.users.length);
  
        const percentage = parseFloat( ((answer.users.length / totalUserCount) * 100).toFixed(2));
        answer.percentage = percentage;
      });
  
      // Check if image exists, otherwise use audio
      if (!image.image && !image.audio) {
        image.image = null;
        image.audio = null;
      } else if (!image.image) {
        image.image = null;
      } else if (!image.audio) {
        image.audio = null;
      }
    });
  
    res.status(200).json({
      status: "success",
      message: "Get Statistics successfully.",
      data: data,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
  };

//----------------------------------------------------------------INCIDENT PRIORITIES----------------------------------------------------------------
exports.getFunctionKeys = async function (req, res, next) {
try {
  console.log("role "+ req.role);
  var thinkingPlanningId = req.query.thinkingPlanningId
  var tacticalDecisionGameId = req.query.tacticalDecisionGameId
  var thinkingPlanningRatingScale = null; // Initialize to null
  if (req.role === 'superAdmin') {
    var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findOne({_id : tacticalDecisionGameId, isDeleted : false})
    console.log("tacticalDecisionGame",tacticalDecisionGame);
    if (!tacticalDecisionGame){
      throw new Error ('tacticalDecisionGame not found.')
    }else if (tacticalDecisionGame.isDeleted === true) {
      throw new Error ('tacticalDecisionGame already deleted.')
    }
    var findImage = await TACTICAL_DECISION_GAME_IMAGE.find({tacticalDecisionGameId : tacticalDecisionGame.id, isDeleted : false})
    console.log("findImage", findImage);
    var thinkingPlanning = await THINKING_PLANNING.findOne({_id : thinkingPlanningId, isDeleted : false})
    console.log("thinkingPlanning", thinkingPlanning);
    if (!thinkingPlanning){
      throw new Error ('thinking planning not found.')
    }else if (thinkingPlanning.isDeleted === true) {
      throw new Error ('thinking planning is already deleted')
    }
    if (thinkingPlanning.selectAnswerType === "list"){
    var thinkingPlanningList = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.find({thinkingPlanningId : thinkingPlanning.id, isDeleted : false})
    console.log("thinkingPlanningList", thinkingPlanningList);
    }else if (thinkingPlanning.selectAnswerType === "ratingScale"){
    thinkingPlanningRatingScale = await THINKING_PLANNING.findOne({_id : thinkingPlanningId , isDeleted : false})
    var thinkingPlanningRatingScaleTexts = await THINKING_PLANNING_TEXT.find({thinkingPlanningId : thinkingPlanningId, isDeleted : false})
    }else {
      throw new Error("Could not find")
    }
    var response = {
      tacticalDecisionGameId : tacticalDecisionGame.id || null,
      text : tacticalDecisionGame.text || null,
      images : findImage || null,
      thinkingPlanningId : thinkingPlanning.id || null,
      thinkingPlanningList : thinkingPlanningList || [],
      thinkingPlanningRatingScaleTexts : thinkingPlanningRatingScaleTexts || [],  
      selectNumberOfSliders : thinkingPlanning.selectNumberOfSliders || null,
      selectAnswerType : thinkingPlanning.selectAnswerType ,
      selectSliderType : thinkingPlanning.selectSliderType,
      minimumValue: thinkingPlanningRatingScale ? thinkingPlanningRatingScale.minimumValue || null : null,
      maximumValue: thinkingPlanningRatingScale ? thinkingPlanningRatingScale.maximumValue || null : null,
      minimumValue1: thinkingPlanningRatingScale ? thinkingPlanningRatingScale.minimumValue1 || null : null,
      maximumValue1: thinkingPlanningRatingScale ? thinkingPlanningRatingScale.maximumValue1 || null : null
    }
  }else if (req.role === 'organization' || req.role === 'fireFighter'){
    var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findOne({_id : tacticalDecisionGameId})
    console.log("tacticalDecisionGame",tacticalDecisionGame);
    if (!tacticalDecisionGame){
      throw new Error ('tacticalDecisionGame not found.')
    }else if (tacticalDecisionGame.isDeleted === true) {
      throw new Error ('tacticalDecisionGame already deleted.')
    }
    var findImage = await TACTICAL_DECISION_GAME_IMAGE.find({tacticalDecisionGameId : tacticalDecisionGame.id})
    console.log("findImage", findImage);
    var thinkingPlanning = await THINKING_PLANNING.findOne({_id : thinkingPlanningId})
    console.log("thinkingPlanning", thinkingPlanning);
    if (!thinkingPlanning){
      throw new Error ('thinking planning not found.')
    }else if (thinkingPlanning.isDeleted === true) {
      throw new Error ('thinking planning is already deleted')
    }
    if (thinkingPlanning.selectAnswerType === "list"){
    var thinkingPlanningList = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.find({thinkingPlanningId : thinkingPlanning.id})
    console.log("thinkingPlanningList", thinkingPlanningList);
    }else if (thinkingPlanning.selectAnswerType === "ratingScale"){
    thinkingPlanningRatingScale = await THINKING_PLANNING.findOne({_id : thinkingPlanningId})
    var thinkingPlanningRatingScaleTexts = await THINKING_PLANNING_TEXT.find({thinkingPlanningId : thinkingPlanningId, isDeleted : false})
      
    }else {
      throw new Error("Could not find")
    }
    var response = {
      tacticalDecisionGameId : tacticalDecisionGame.id || null,
      text : tacticalDecisionGame.text || null,
      images : findImage || null,
      thinkingPlanningId : thinkingPlanning.id || null,
      thinkingPlanningList : thinkingPlanningList || [],
      thinkingPlanningRatingScaleTexts : thinkingPlanningRatingScaleTexts || [],  
      selectNumberOfSliders : thinkingPlanning.selectNumberOfSliders || null,
      selectAnswerType : thinkingPlanning.selectAnswerType ,
      selectSliderType : thinkingPlanning.selectSliderType,
      isPriorityType : thinkingPlanning.isPriorityType,
      minimumValue: thinkingPlanningRatingScale ? thinkingPlanningRatingScale.minimumValue || null : null,
      maximumValue: thinkingPlanningRatingScale ? thinkingPlanningRatingScale.maximumValue || null : null,
      minimumValue1: thinkingPlanningRatingScale ? thinkingPlanningRatingScale.minimumValue1 || null : null,
      maximumValue1: thinkingPlanningRatingScale ? thinkingPlanningRatingScale.maximumValue1 || null : null
    }
  }else {
    throw new Error ('you can not access')
  }
  res.status(200).json({
    status  : "success",
    message : "get success",
    data :response
  })
} catch (error) {
  res.status(400).json({
    status  : "failed",
    message : error.message
  })
}
};

exports.saveFunctionKeyAnswer = async function (req, res, next) {
try {

if (req.role === 'superAdmin') {
var ansArray = [];
  var findTacticalDecisionGame = await TACTICAL_DECISION_GAME.findOne({
    _id: req.body.tacticalDecisionGameId,
  });
  if (!findTacticalDecisionGame) {
    throw new Error("tactical decision game not found");
  } else if (findTacticalDecisionGame.isDeleted === true) {
    throw new Error("tactical decision game is already deleted");
  }
  var findThinkingPlanning = await THINKING_PLANNING.findOne({ _id: req.body.thinkingPlanningId });
  if (!findThinkingPlanning) {
    throw new Error("thinkingPlanning not found");
  } else if (findThinkingPlanning.isDeleted === true) {
    throw new Error("thinkingPlanning is already deleted");
  }
//----------------------------------------------------------------LIST----------------------------------------------------------------
  if (req.body.thinkingPlanningAnswerType === "list") {
    if (!req.body.ans) {
      throw new Error("you have to sent answers");
    }
    for (let index = 0; index < req.body.ans.length; index++) {
      const ans = req.body.ans[index];
      if (!ans.answerId || ans.answerId.length === 0) {
        // If no answerId is provided, push an entry with a null answerId
        ansArray.push({
          imageId: ans.imageId,
          answerId: null,
        });
      } else {
        for (let i = 0; i < ans.answerId.length; i++) {
          var findImage = await TACTICAL_DECISION_GAME_IMAGE.findOne({
            _id: ans.imageId,
          });
          if (!findImage) {
            throw new Error("tactical decision image is not found");
          } else if (findImage.isDeleted === true) {
            throw new Error("tactical decision image is already deleted");
          }
          var findAnswer = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.findOne({
            _id: ans.answerId[i],
          });
          console.log("findAnswer====>"+ findAnswer);
          if (!findAnswer) {
            throw new Error("thinking planning answer is not found");
          } else if (findAnswer.isDeleted === true) {
            throw new Error("thinking planning answer is already deleted");
          }

          var listAnswer = await FUNCTION_KEY_ANSWER.create({
            tacticalDecisionGameId: req.body.tacticalDecisionGameId,
            thinkingPlanningId : req.body.thinkingPlanningId,
            tdgLibraryId: req.body.tdgLibraryId,
            userId: req.body.userId,
            imageId: ans.imageId || null,
            answerId: ans.answerId[i] || null,
            answerType: req.body.answerType,
            thinkingPlanningAnswerType : req.body.thinkingPlanningAnswerType,
            ratingScale1: null,
            ratingScale2: null,
            isDeleted: false,
          });
          ansArray.push(listAnswer);
        }
      }
    }

    var imageAndAnswer = await Promise.all(
      ansArray.map(async (record) => {
        // console.log("tacticalDecisionGameId",record.tacticalDecisionGameId);
        var images = await TACTICAL_DECISION_GAME_IMAGE.findOne({
          _id: record.imageId,
        });
        // var answers = await TACTICAL_DECISION_GAME_ADD_ANSWER.findOne({
        //   _id: record.answerId,
        // });
        var answerName = null;

        if (record.answerId) {
          const answers = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.findOne({
            _id: record.answerId,
          });

          answerName = answers.name;
        }
        //console.log(listAnswer);
        // var percentage = listAnswer.length
        // console.log("percentage",percentage);
        var obj = {
          tacticalDecisionGameImage: images.image,
          audio : images.audio ? images.audio : "",
          answerName: answerName,
          // statistics : percentage + "%"
        };
        return obj;
      })
    );
    var findBestPractices = await BEST_PRACTICES_DECISION_GAME.find({
      tacticalDecisionGameId: req.body.tacticalDecisionGameId,
    });

    var groupedImages = imageAndAnswer.reduce((acc, obj) => {
      const existingImage = acc.find(
        (item) =>
          item.tacticalDecisionGameImage === obj.tacticalDecisionGameImage,
          // item.
      );
      if (existingImage) {
        existingImage.answerNames.push(obj.answerName);
      } else {
        acc.push({
          tacticalDecisionGameImage: obj.tacticalDecisionGameImage,
          audio : obj.audio,
          answerNames: [obj.answerName],
        });
      }
      
      return acc;
    }, []);

    var response = {
      tacticalDecisionGameId: req.body.tacticalDecisionGameId,
      thinkingPlanningId : req.body.thinkingPlanningId,
      tdgLibraryId: req.body.tdgLibraryId,
      answerType: req.body.answerType,
      correctAnswer : findTacticalDecisionGame.correctAnswer || null,
      thinkingPlanningAnswerType : req.body.thinkingPlanningAnswerType,
      userId: req.body.userId,
      ratingScale1: req.body.ratingScale1 || null,
      ratingScale2: req.body.ratingScale2 || null,
      links: null,
      bestPractices: findBestPractices,
      images: groupedImages,
    };
  }
  //----------------------------------------------------------------ratingScale----------------------------------------------------------------
  else if (req.body.thinkingPlanningAnswerType === "ratingScale") {
    for (let index = 0; index < req.body.ans.length; index++) {
      const ans = req.body.ans[index];
      if (!ans.answerId || ans.answerId.length === 0) {
        // If no answerId is provided, push an entry with a null answerId
        ansArray.push({
          imageId: ans.imageId,
          answerId: null,
        });
      } else {
        for (let i = 0; i < ans.answerId.length; i++) {
          var findImage = await TACTICAL_DECISION_GAME_IMAGE.findOne({
            _id: ans.imageId,
          });
          if (!findImage) {
            throw new Error("tactical decision image is not found");
          } else if (findImage.isDeleted === true) {
            throw new Error("tactical decision image is already deleted");
          }

          var listAnswer = await FUNCTION_KEY_ANSWER.create({
            tacticalDecisionGameId: req.body.tacticalDecisionGameId,
            thinkingPlanningId : req.body.thinkingPlanningId,
            tdgLibraryId: req.body.tdgLibraryId,
            userId: req.body.userId,
            imageId: ans.imageId || null,
            answerId : null,
            ratingScale1: ans.answerId[i] || null,
            answerType: req.body.answerType,
            thinkingPlanningAnswerType: req.body.thinkingPlanningAnswerType,
            // ratingScale1: req.body.ratingScale1 || null,
            ratingScale2: null,
            isDeleted: false,
          });
          ansArray.push(listAnswer);

          console.log("ratingScale1", listAnswer);
        }
      }
    }
    console.log("ansArray", ansArray);
    var imageAndAnswer = await Promise.all(
      ansArray.map(async (record) => {
        // console.log("tacticalDecisionGameId",record.tacticalDecisionGameId);
        var images = await TACTICAL_DECISION_GAME_IMAGE.findOne({
          _id: record.imageId,
        });
        // var answers = await TACTICAL_DECISION_GAME_ADD_ANSWER.findOne({
        //   _id: record.answerId,
        // });
        var answerName = null;

        if (record.ratingScale1) {
          const answers = await FUNCTION_KEY_ANSWER.findOne({
            ratingScale1: record.ratingScale1,
          });
          answerName = answers.ratingScale1;
        }
        console.log("answerName", answerName);
        //console.log(listAnswer);
        // var percentage = listAnswer.length
        // console.log("percentage",percentage);
        var obj = {
          tacticalDecisionGameImage: images.image,
          audio: images.audio ? images.audio : "",
          answerName: answerName,
          // statistics : percentage + "%"
        };
        return obj;
      })
    );
    var findBestPractices = await BEST_PRACTICES_DECISION_GAME.find({
      tacticalDecisionGameId: req.body.tacticalDecisionGameId,
    });

    var groupedImages = imageAndAnswer.reduce((acc, obj) => {
      const existingImage = acc.find(
        (item) =>
          item.tacticalDecisionGameImage === obj.tacticalDecisionGameImage
      );
      if (existingImage) {
        existingImage.answerNames.push(obj.answerName);
      } else {
        acc.push({
          tacticalDecisionGameImage: obj.tacticalDecisionGameImage,
          audio : obj.audio,
          answerNames: [obj.answerName],
        });
      }
      return acc;
    }, []);

    var response = {
      tacticalDecisionGameId: req.body.tacticalDecisionGameId,
      thinkingPlanningId : req.body.thinkingPlanningId,
      tdgLibraryId: req.body.tdgLibraryId,
      answerType: req.body.answerType,
      correctAnswer : findTacticalDecisionGame.correctAnswer || null,
      thinkingPlanningAnswerType : req.body.thinkingPlanningAnswerType,
      userId: req.body.userId,
      ratingScale1: req.body.ratingScale1 || null,
      ratingScale2: req.body.ratingScale2 || null,
      links: null,
      bestPractices: findBestPractices,
      images: groupedImages,
    };
  }else {
    throw new Error ("inappropriate thinking planning answer type.")
  }
}else if (req.role === 'organization' || req.role === 'fireFighter'){
    var ansArray = [];
    var findTacticalDecisionGame = await TACTICAL_DECISION_GAME.findOne({
      _id: req.body.tacticalDecisionGameId,
    });
    if (!findTacticalDecisionGame) {
      throw new Error("tactical decision game not found");
    } else if (findTacticalDecisionGame.isDeleted === true) {
      throw new Error("tactical decision game is already deleted");
    }
    var findThinkingPlanning = await THINKING_PLANNING.findOne({ _id: req.body.thinkingPlanningId });
    if (!findThinkingPlanning) {
      throw new Error("thinkingPlanning not found");
    } else if (findThinkingPlanning.isDeleted === true) {
      throw new Error("thinkingPlanning is already deleted");
    }
//----------------------------------------------------------------LIST----------------------------------------------------------------
    if (req.body.thinkingPlanningAnswerType === "list") {
      if (!req.body.ans) {
        throw new Error("you have to sent answers");
      }
      for (let index = 0; index < req.body.ans.length; index++) {
        const ans = req.body.ans[index];
        if (!ans.answerId || ans.answerId.length === 0) {
          // If no answerId is provided, push an entry with a null answerId
          ansArray.push({
            imageId: ans.imageId,
            answerId: null,
          });
        } else {
          for (let i = 0; i < ans.answerId.length; i++) {
            var findImage = await TACTICAL_DECISION_GAME_IMAGE.findOne({
              _id: ans.imageId,
            });
            if (!findImage) {
              throw new Error("tactical decision image is not found");
            } else if (findImage.isDeleted === true) {
              throw new Error("tactical decision image is already deleted");
            }
            var findAnswer = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.findOne({
              _id: ans.answerId[i],
            });
            console.log("findAnswer====>"+ findAnswer);
            if (!findAnswer) {
              throw new Error("thinking planning answer is not found");
            } else if (findAnswer.isDeleted === true) {
              throw new Error("thinking planning answer is already deleted");
            }

            var listAnswer = await FUNCTION_KEY_ANSWER.create({
              tacticalDecisionGameId: req.body.tacticalDecisionGameId,
              thinkingPlanningId : req.body.thinkingPlanningId,
              tdgLibraryId: req.body.tdgLibraryId,
              userId: req.body.userId,
              imageId: ans.imageId || null,
              answerId: ans.answerId[i] || null,
              answerType: req.body.answerType,
              thinkingPlanningAnswerType : req.body.thinkingPlanningAnswerType,
              ratingScale1: null,
              ratingScale2: null,
              isDeleted: false,
            });
            ansArray.push(listAnswer);
          }
        }
      }

      var imageAndAnswer = await Promise.all(
        ansArray.map(async (record) => {
          // console.log("tacticalDecisionGameId",record.tacticalDecisionGameId);
          var images = await TACTICAL_DECISION_GAME_IMAGE.findOne({
            _id: record.imageId,
          });
          // var answers = await TACTICAL_DECISION_GAME_ADD_ANSWER.findOne({
          //   _id: record.answerId,
          // });
          var answerName = null;

          if (record.answerId) {
            const answers = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.findOne({
              _id: record.answerId,
            });

            answerName = answers.name;
          }
          //console.log(listAnswer);
          // var percentage = listAnswer.length
          // console.log("percentage",percentage);
          var obj = {
            tacticalDecisionGameImage: images.image,
            audio : images.audio ? images.audio : "",
            answerName: answerName,
            // statistics : percentage + "%"
          };
          return obj;
        })
      );
      var findBestPractices = await BEST_PRACTICES_DECISION_GAME.find({
        tacticalDecisionGameId: req.body.tacticalDecisionGameId,
      });

      var groupedImages = imageAndAnswer.reduce((acc, obj) => {
        const existingImage = acc.find(
          (item) =>
            item.tacticalDecisionGameImage === obj.tacticalDecisionGameImage
        );
        if (existingImage) {
          existingImage.answerNames.push(obj.answerName);
        } else {
          acc.push({
            tacticalDecisionGameImage: obj.tacticalDecisionGameImage,
            audio : obj.audio,
            answerNames: [obj.answerName],
          });
        }
        return acc;
      }, []);

      var response = {
        tacticalDecisionGameId: req.body.tacticalDecisionGameId,
        thinkingPlanningId : req.body.thinkingPlanningId,
        tdgLibraryId: req.body.tdgLibraryId,
        answerType: req.body.answerType,
        correctAnswer : findTacticalDecisionGame.correctAnswer || null,
        thinkingPlanningAnswerType : req.body.thinkingPlanningAnswerType,
        userId: req.body.userId,
        ratingScale1: req.body.ratingScale1 || null,
        ratingScale2: req.body.ratingScale2 || null,
        links: null,
        bestPractices: findBestPractices,
        images: groupedImages,
      };
    }
    //----------------------------------------------------------------ratingScale----------------------------------------------------------------
    else if (req.body.thinkingPlanningAnswerType === "ratingScale") {
      for (let index = 0; index < req.body.ans.length; index++) {
        const ans = req.body.ans[index];
        if (!ans.answerId || ans.answerId.length === 0) {
          // If no answerId is provided, push an entry with a null answerId
          ansArray.push({
            imageId: ans.imageId,
            answerId: null,
          });
        } else {
          for (let i = 0; i < ans.answerId.length; i++) {
            var findImage = await TACTICAL_DECISION_GAME_IMAGE.findOne({
              _id: ans.imageId,
            });
            if (!findImage) {
              throw new Error("tactical decision image is not found");
            } else if (findImage.isDeleted === true) {
              throw new Error("tactical decision image is already deleted");
            }

            var listAnswer = await FUNCTION_KEY_ANSWER.create({
              tacticalDecisionGameId: req.body.tacticalDecisionGameId,
              thinkingPlanningId : req.body.thinkingPlanningId,
              tdgLibraryId: req.body.tdgLibraryId,
              userId: req.body.userId,
              imageId: ans.imageId || null,
              answerId : null,
              ratingScale1: ans.answerId[i] || null,
              answerType: req.body.answerType,
              thinkingPlanningAnswerType: req.body.thinkingPlanningAnswerType,
              // ratingScale1: req.body.ratingScale1 || null,
              ratingScale2: null,
              isDeleted: false,
            });
            ansArray.push(listAnswer);

            console.log("ratingScale1", listAnswer);
          }
        }
      }
     
      var imageAndAnswer = await Promise.all(
        ansArray.map(async (record) => {
          // console.log("tacticalDecisionGameId",record.tacticalDecisionGameId);
          var images = await TACTICAL_DECISION_GAME_IMAGE.findOne({
            _id: record.imageId,
          });
          // var answers = await TACTICAL_DECISION_GAME_ADD_ANSWER.findOne({
          //   _id: record.answerId,
          // });
          var answerName = null;

          if (record.ratingScale1) {
            const answers = await FUNCTION_KEY_ANSWER.findOne({
              ratingScale1: record.ratingScale1,
            });
            answerName = answers.ratingScale1;
          }
          console.log("answerName", answerName);
          //console.log(listAnswer);
          // var percentage = listAnswer.length
          // console.log("percentage",percentage);
          var obj = {
            tacticalDecisionGameImage: images.image,
            audio: images.audio ? images.audio : "",
            answerName: answerName,
            // statistics : percentage + "%"
          };
          return obj;
        })
      );
      var findBestPractices = await BEST_PRACTICES_DECISION_GAME.find({
        tacticalDecisionGameId: req.body.tacticalDecisionGameId,
      });

      console.log("imageAndAnswer", imageAndAnswer);

      var groupedImages = imageAndAnswer.reduce((acc, obj) => {
        const existingImage = acc.find(
          (item) =>
         
            item.tacticalDecisionGameImage === obj.tacticalDecisionGameImage
        );
        if (existingImage) {
          existingImage.answerNames.push(obj.answerName);
        } else {
          acc.push({
            tacticalDecisionGameImage: obj.tacticalDecisionGameImage,
            audio: obj.audio,
            answerNames: [obj.answerName],
          });
        }
        return acc;
      }, []);
      // console.log(groupedImages);

      var response = {
        tacticalDecisionGameId: req.body.tacticalDecisionGameId,
        thinkingPlanningId : req.body.thinkingPlanningId,
        tdgLibraryId: req.body.tdgLibraryId,
        answerType: req.body.answerType,
        correctAnswer : findTacticalDecisionGame.correctAnswer || null,
        thinkingPlanningAnswerType : req.body.thinkingPlanningAnswerType,
        userId: req.body.userId,
        ratingScale1: req.body.ratingScale1 || null,
        ratingScale2: req.body.ratingScale2 || null,
        links: null,
        bestPractices: findBestPractices,
        images: groupedImages,
      };
    }else {
      throw new Error ("inappropriate thinking planning answer type.")
    }
}else {
throw new Error("you can not access.")
}
  res.status(200).json({
    status : "success",
    message : "Function key answer save successfully.",
    data : response
  })
} catch (error) {
  res.status(400).json({
    status : "failed",
    message : error.message
  })
}
};

//----------------------------------------------------------------ACTION KEYS----------------------------------------------------------------

exports.getTacticalDecisionGameFromActionList = async function (req, res, next) {
try {
  var actionKeyId = req.query.actionKeyId;

  if(!actionKeyId) {
    throw new Error('actionKeyId is required.')
  }

  if (req.role === "fireFighter") {
    var actionKeys = await ACTION_KEYS.findOne({_id : actionKeyId })
    if (!actionKeys){
      throw new Error ("actionKeys not found")
    }else if (actionKeys.isDeleted === true){
      throw new Error ("actionKeys is already deleted")
    }
    var responseType =  await RESPONSE_TYPE.findOne({_id : actionKeys.responseTypeId})
    console.log("responseType->",responseType);
    if (!responseType){
      throw new Error ("responseType not found")
    }else if (responseType.isDeleted === true){
      throw new Error ("responseType is already deleted")
    }

    var tdgLibraries = await TDG_LIBRARY.find({responseTypeId : responseType._id,publish: true});

    console.log("tdg : " + tdgLibraries.length);

    const gamesPromises = tdgLibraries.map(async (tdg) => {
      
      const tacticalDecisionGames = await TACTICAL_DECISION_GAME.find({ 
        tdgLibraryId: tdg._id,
        publish: true,
        isDeleted: false,
        selectAnswerType: { $in: ['list', 'ratingScale'] }
      }).populate("tdgLibraryId");
    
      if (tacticalDecisionGames.length > 0) {
          console.log("game : " + tacticalDecisionGames);
          return tacticalDecisionGames;
      }else {
        return null;
      }
  });

  const gamesArrays = await Promise.all(gamesPromises); // Array of arrays

  // Concatenate all arrays into one
  const games = gamesArrays.filter(game => game !== null).flat();

  var response = await Promise.all(games.map(async (record) => {
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
      bestNames: findBestPractices || null,
      texts: findRatingScaleText || null,
      selectTargetAudience: record.selectTargetAudience || null,
      timeLimit: record.timeLimit || null,
      selectAnswerType: record.selectAnswerType || null,
      selectNumberOfSliders : record.selectNumberOfSliders || null,
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
      isPriorityType: record.isPriorityType,
      isDeleted: record.isDeleted,
      createdAt: record.createdAt || null,
      updatedAt: record.updatedAt || null
    }
    return obj;
  }))
    res.status(200).json({
        status : "success",
        message : "get tactical decision game successfully.",
        data : response
      })
  }
} catch (error) {
  res.status(400).json({
    status : "failed",
    message : error.message
  })
}
};
//----------------------------------------------------------------GROUP PLAY RESULT GET STATISTICS----------------------------------------------------------------

// exports.getStatisticsForGroupPlayResult = async function (req, res, next) {
//   try {
//     console.log("role " + req.role);
//     var userId = req.userId;
//     var tacId = req.params.id;
//     var findGame = await TACTICAL_DECISION_GAME_LIST_ANSWER.findOne({
//       tacticalDecisionGameId: tacId,
//     });

//     if (!findGame) {
//       throw new Error("Tactical Decision Game not found");
//     }
//     var findTac = await TACTICAL_DECISION_GAME.findOne({_id : tacId, isDeleted : false})
//     console.log("findTac",findTac);

//     var find = await TACTICAL_DECISION_GAME_LIST_ANSWER.findOne({
//       tacticalDecisionGameId: tacId,
//       userId: userId,
//     }).populate("groupPlayId");

//     console.log("find",find);

//     var newData = find.groupPlayId === null ? null : find.groupPlayId.groupId;

//     if (newData === null) {
//       throw new Error("This game has no groupPlayId");
//     }

//     // Count distinct players in the specified group
//     var totalPlayerCountInGroup = await GROUP_PLAYER.distinct("userId", {
//       groupId: find.groupPlayId.groupId,
//       isDeleted: false,
//     });

//     console.log("Total players in the group:", totalPlayerCountInGroup.length);
//     console.log("Total players :", totalPlayerCountInGroup);

//     if (findTac.selectAnswerType === "ratingScale") {
//       // Handle ratingScale game type
//       console.log("RATING SCALE ================================================================================================================================");
//       var data = await TACTICAL_DECISION_GAME_LIST_ANSWER.aggregate([
//         {
//           $match: {
//             groupPlayId: new mongoose.Types.ObjectId(find.groupPlayId),
//           },
//         },
//         {
//           $facet: {
//             totalUserCount: [
//               {
//                 $group: {
//                   _id: "$userId",
//                 },
//               },
//               {
//                 $count: "count",
//               },
//             ],
//             answers: [
//               {
//                 $group: {
//                   _id: {
//                     answerId: "$ratingScale1",
//                     userId: "$userId",
//                     ratingScale1: "$ratingScale1",
//                   },
//                 },
//               },
//               {
//                 $group: {
//                   _id: "$_id.answerId",
//                   users: {
//                     $addToSet: "$_id.userId",
//                   },
//                   ratingScale1Values: {
//                     $first: "$_id.ratingScale1",
//                   },
//                 },
//               },
//               {
//                 $lookup: {
//                   from: "tacticaldecisiongameimages",
//                   localField: "_id",
//                   foreignField: "_id",
//                   as: "imageData",
//                 },
//               },
//               {
//                 $project: {
//                   _id: 0,
//                   //answerId: "$_id",
//                   users: 1,
//                   answer: "$ratingScale1Values",
                
//                 },
//               },
//             ],
//           },
//         },
//       ]);
  
//       let totalUserCount = 0; // Initialize totalUserCount to 0
  
//       if (data[0].totalUserCount.length > 0) {
//         totalUserCount = data[0].totalUserCount[0].count;
//       }
  
//       // Include totalPlayerCountInGroup directly in the totalUserCount object
//       data[0].totalUserCount = {
//         count: totalPlayerCountInGroup.length,
//       };
  
//       const answers = data[0].answers;
  
//       answers.forEach((answer) => {
//         const percentageOfTotalUsers = parseFloat(
//           ((answer.users.length / totalPlayerCountInGroup.length) * 100).toFixed(2)
//         );
//         answer.percentage = percentageOfTotalUsers;
  
//         // Remove unnecessary fields from each answer
//         delete answer.users;
//       });
//       }else if (findTac.selectAnswerType === "list") {
//         console.log("list=================================================================================================================================");
//         var data = await TACTICAL_DECISION_GAME_LIST_ANSWER.aggregate([
//           {
//             $match: {
//               groupPlayId: new mongoose.Types.ObjectId(find.groupPlayId),
//             },
//           },
//           {
//             $facet: {
//               totalUserCount: [
//                 {
//                   $group: {
//                     _id: "$userId",
//                   },
//                 },
//                 {
//                   $count: "count",
//                 },
//               ],
//               images: [
//                 {
//                   $group: {
//                     _id: {
//                       imageId: "$imageId",
//                       answerId: "$answerId",
//                     },
//                     users: {
//                       $addToSet: "$userId",
//                     },
//                   },
//                 },
//                 {
//                   $group: {
//                     _id: "$_id.imageId",
//                     answers: {
//                       $push: {
//                         answerId: "$_id.answerId",
//                         users: "$users",
//                       },
//                     },
//                   },
//                 },
//                 {
//                   $lookup: {
//                     from: "tacticaldecisiongameaddanswers",
//                     localField: "answers.answerId",
//                     foreignField: "_id",
//                     as: "answerData",
//                   },
//                 },
//                 {
//                   $lookup: {
//                     from: "tacticaldecisiongameimages",
//                     localField: "_id",
//                     foreignField: "_id",
//                     as: "imageData",
//                   },
//                 },
//                 {
//                   $project: {
//                     _id: 0,
//                     image: {
//                       $arrayElemAt: ["$imageData.image", 0],
//                     },
//                     answers: {
//                       $map: {
//                         input: "$answers",
//                         as: "answer",
//                         in: {
//                           answer: {
//                             $arrayElemAt: ["$answerData.answer", 0],
//                           },
//                           percentage: {
//                             $multiply: [
//                               {
//                                 $cond: {
//                                   if: {
//                                     $and: [
//                                       { $isArray: "$answer.users" },
//                                       { $ne: [{ $first: "$totalUserCount" }, null] },
//                                     ],
//                                   },
//                                   then: {
//                                     $divide: [
//                                       { $size: "$answer.users" },
//                                       { $first: "$totalUserCount.count" },
//                                     ],
//                                   },
//                                   else: 0,
//                                 },
//                               },
//                               100,
//                             ],
//                           },
//                         },
//                       },
//                     },
//                   },
//                 },
//               ],
//             },
//           },
//         ]);
    
//         // Extract the counts and group details
//         let totalUserCount = 0; // Initialize totalUserCount to 0
//         if (data[0].totalUserCount && data[0].totalUserCount.length > 0) {
//           totalUserCount = data[0].totalUserCount[0].count;
//         }
    
//         // Include totalPlayerCountInGroup directly in the totalUserCount object
//         data[0].totalUserCount = {
//           count: totalPlayerCountInGroup.length,
//         };
    
//         const images = data[0].images;
//       console.log(images);
//         images.forEach((image) => {
//           image.answers.forEach((answer) => {
//             console.log("%%%%%% " + (answer.users ? answer.users.length : 0));
    
//             // Calculate percentage
//             answer.percentage = parseFloat(answer.percentage.toFixed(2));
//           });
//         });
    
//         // ... (rest of your code)
//       }else if (findTac.selectAnswerType === "voiceToText") {
//       console.log("voice to text");
//       }else if (findTac.selectAnswerType === "functionKeys"){
//       var data = await TACTICAL_DECISION_GAME_LIST_ANSWER.aggregate([
//         {
//           $match: {
//             groupPlayId: new mongoose.Types.ObjectId(find.groupPlayId),
//           },
//         },
//         {
//           $facet: {
//             totalUserCount: [
//               {
//                 $group: {
//                   _id: "$userId",
//                 },
//               },
//               {
//                 $count: "count",
//               },
//             ],
//             answers: [
//               {
//                 $group: {
//                   _id: {
//                     answerId: "$answerId",
//                     userId: "$userId",
//                   },
//                 },
//               },
//               {
//                 $group: {
//                   _id: "$_id.answerId",
//                   users: {
//                     $addToSet: "$_id.userId",
//                   },
//                 },
//               },
//               {
//                 $lookup: {
//                   from: "tacticaldecisiongameaddanswers",
//                   localField: "_id",
//                   foreignField: "_id",
//                   as: "answer",
//                 },
//               },
//               {
//                 $project: {
//                   _id: 0,
//                   //answerId: "$_id",
//                   users: 1,
//                   answer: { $first: "$answer.answer" },
//                 },
//               },
//             ],
//           },
//         },
//       ]);

//       console.log("data", data);

//       // Extract the counts and group details
//       let totalUserCount = 0; // Initialize totalUserCount to 0

//       if (data[0].totalUserCount.length > 0) {
//         totalUserCount = data[0].totalUserCount[0].count;
//       }

//       // Include totalPlayerCountInGroup directly in the totalUserCount object
//       data[0].totalUserCount = {
//         count: totalPlayerCountInGroup.length,
//       };

//       const images = data[0].answers;

//       images.forEach((answer) => {
//         console.log("%%%%%% " + answer.users.length);

//         const percentageOfTotalUsers = parseFloat(
//           ((answer.users.length / totalPlayerCountInGroup.length) * 100).toFixed(2)
//         );

//         answer.percentage = percentageOfTotalUsers;

//         // Remove unnecessary fields from each answer
//         delete answer.users;
//       });
//       }

//     res.status(200).json({
//       status: "success",
//       message: "Get Statistics successfully.",
//       data: data,
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: "failed",
//       message: error.message,
//     });
//   }
// };

exports.getStatisticsForGroupPlayResult = async function (req, res, next) {
try {
  console.log("role " + req.role);
  var userId = req.userId;
  var tacId = req.params.id;

  var gameIdFind = await TACTICAL_DECISION_GAME.findOne({ _id : tacId }).populate('tdgLibraryId')

  if(!gameIdFind){
    throw new Error('This game is not available.');
  }

if (gameIdFind.selectAnswerType === "list"){

console.log("LIST game");
  var groupPlay = await GROUP_PLAY.findOne({ tacticalDecisionGameId : gameIdFind._id});
  if(!groupPlay){
    throw new Error('This group play does not exist.');
  }
  console.log("groupPlay",groupPlay);

  var groupPlayer = await GROUP_PLAYER.find({ groupId : groupPlay.groupId._id});
  var TotalPlayer = groupPlayer.length;


  var imageFind = await TACTICAL_DECISION_GAME_IMAGE.find({ tacticalDecisionGameId : tacId});

  
  var response = await Promise.all(imageFind.map(async (image) => {
    var answers = await TACTICAL_DECISION_GAME_LIST_ANSWER.find({
      tacticalDecisionGameId: tacId,
      groupPlayId: groupPlay._id,
      imageId: image._id 
    });

    var groupedAnswers = new Map();

    await Promise.all(answers.map(async (answer) => {
      var answerData = await TACTICAL_DECISION_GAME_ADD_ANSWER.findOne({ _id: answer.answerId });
      var usersFind = await TACTICAL_DECISION_GAME_LIST_ANSWER.find({ answerId: answer.answerId });
      var userCount = usersFind.length
      
      var percentage = (userCount*100)/TotalPlayer
      percentage = Math.min(percentage, 100);
      var obj = {
        answer: answerData.answer,
        percentage: percentage
      };

      const key = `${answer.imageId}-${answer.answerId}`;
      if (!groupedAnswers.has(key)) {
        groupedAnswers.set(key, obj);
      }
    }));

    var obj = {
      file: image.image,
      answers: Array.from(groupedAnswers.values())
    };

    return obj;
  }));

  var finalResponse = {
    game: gameIdFind.tdgLibraryId.name,
    TotalPlayer:TotalPlayer,
    question : gameIdFind.text, 
    files: response
  }
}else if (gameIdFind.selectAnswerType === "ratingScale"){
  var groupPlay = await GROUP_PLAY.findOne({ tacticalDecisionGameId : gameIdFind._id});
  if(!groupPlay){
    throw new Error('This group play does not exist.');
  }
console.log("groupPlay",groupPlay)
  var groupPlayer = await GROUP_PLAYER.find({ groupId : groupPlay.groupId});
  var TotalPlayer = groupPlayer.length;

console.log("TotalPlayer",TotalPlayer)
  var imageFind = await TACTICAL_DECISION_GAME_IMAGE.find({ tacticalDecisionGameId : tacId});

console.log("imageFind",imageFind)
  
  var response = await Promise.all(imageFind.map(async (image) => {

    var answers = await TACTICAL_DECISION_GAME_LIST_ANSWER.find({
      tacticalDecisionGameId: tacId,
      groupPlayId : groupPlay._id,
      imageId: image._id ,
    }).sort({createdAt: -1});
  console.log("answers",answers)
    var groupedAnswers = new Map();
  console.log("groupedAnswers",groupedAnswers)

    await Promise.all(answers.map(async (answer) => {

      var answerData = await TACTICAL_DECISION_GAME_LIST_ANSWER.findOne({ ratingScale1: answer.ratingScale1 }).sort({createdAt: -1});
    console.log("answerData",answerData)
      var usersFind = await TACTICAL_DECISION_GAME_LIST_ANSWER.find({ ratingScale1: answer.ratingScale1 });
      var userCount = usersFind.length
  

  
      var percentage = (userCount*100)/TotalPlayer;
      percentage = Math.min(percentage, 100);
    console.log("percentage",percentage)
      var obj = {
        answer: answerData.ratingScale1,
        percentage: percentage
      };
    console.log("percentage",percentage)

      const key = `${answer.imageId}-${answer.answerId}`;
      if (!groupedAnswers.has(key)) {
        groupedAnswers.set(key, obj);
      }
    }));

    var obj = {
      file: image.image,
      answers: Array.from(groupedAnswers.values())
    };
  console.log("obj",obj)

    return obj;
  }));

  var finalResponse = {
    game: gameIdFind.tdgLibraryId.name,
    TotalPlayer:TotalPlayer,
    question : gameIdFind.text, 
    files: response
  }
  console.log("finalResponse",finalResponse)
  
}else if(gameIdFind.selectAnswerType === "voiceToText"){
  var groupPlay = await GROUP_PLAY.findOne({ tacticalDecisionGameId : gameIdFind._id});
  if(!groupPlay){
    throw new Error('This group play does not exist.');
  }

  var groupPlayer = await GROUP_PLAYER.find({ groupId : groupPlay.groupId});
  var TotalPlayer = groupPlayer.length;


  var imageFind = await TACTICAL_DECISION_GAME_IMAGE.find({ tacticalDecisionGameId : tacId});

  
  var response = await Promise.all(imageFind.map(async (image) => {

    var answers = await TACTICAL_DECISION_GAME_LIST_ANSWER.find({
      tacticalDecisionGameId: tacId,
      groupPlayId: groupPlay._id,
      imageId: image._id 
    });
console.log("answers",answers);
    var groupedAnswers = new Map();

    await Promise.all(answers.map(async (answer) => {

      var answerData = await TACTICAL_DECISION_GAME_LIST_ANSWER.findOne({ answer: answer.answer });
      console.log("answerData",answerData);
  
      var usersFind = await TACTICAL_DECISION_GAME_LIST_ANSWER.find({ answer: answer.answer });
      var userCount = usersFind.length
      
      var percentage = (userCount*100)/TotalPlayer
      percentage = Math.min(percentage, 100);

      var obj = {
        answer: answerData.answer,
        percentage: 0
      };

      const key = `${answer.imageId}-${answer.answerId}`;
      if (!groupedAnswers.has(key)) {
        groupedAnswers.set(key, obj);
      }
    }));

    var obj = {
      file: image.image,
      answers: Array.from(groupedAnswers.values())
    };

    return obj;
  }));

  var finalResponse = {
    game: gameIdFind.tdgLibraryId.name,
    TotalPlayer:TotalPlayer,
    question : gameIdFind.text, 
    files: response
  }
} else {
  throw new Error ("Invalid game")
}
    res.status(200).json({
    status: "success",
    message: "Get Statistics successfully.",
    data: finalResponse,
  });
} catch (error) {
  res.status(400).json({
    status: "failed",
    message: error.message,
  })
}
}

// exports.getStatisticsForGroupPlayResult = async function (req, res, next) {
//   try {
//     console.log("role " + req.role);
//     var userId = req.userId
//     var tacId = req.params.id;
//     var findGame = await TACTICAL_DECISION_GAME_LIST_ANSWER.findOne({
//       tacticalDecisionGameId: tacId,
    
//     })
//     if (!findGame) {
//       throw new Error("Tactical Decision Game not found");
//     }
//     var find = await TACTICAL_DECISION_GAME_LIST_ANSWER.findOne({
//       tacticalDecisionGameId: tacId,
//       userId: userId
//     }).populate("groupPlayId");
//     console.log(find);
  
//     var newData = find.groupPlayId === null ? null : find.groupPlayId.groupId;
//     if(newData === null){
//       throw new Error("this game has no groupPlayId");
//     }
//     var playerFind = await GROUP_PLAYER.find({ groupId: find.groupPlayId.groupId }).distinct("userId");
//     console.log("playerFind", playerFind);

//     if (!playerFind || playerFind.length === 0) {
//       throw new Error("No players found for the group");
//     }

//     var data = await TACTICAL_DECISION_GAME_LIST_ANSWER.aggregate([
//       {
//         $match: {
//           //tacticalDecisionGameId: new mongoose.Types.ObjectId(tacId),
//           groupPlayId: new mongoose.Types.ObjectId(find.groupPlayId),
//           // userId: { $in: playerFind },
//         },
//       },
//       {
//         $facet: {
//           totalUserCount: [
//             {
//               $group: {
//                 _id: "$userId",
//               },
//             },
//             {
//               $count: "count",
//             },
//           ],
//           images: [
//             {
//               $group: {
//                 _id: {
//                   imageId: "$imageId",
//                   answerId: "$answerId",
//                 },
//                 users: {
//                   $addToSet: "$userId",
//                 },
//               },
//             },
//             {
//               $group: {
//                 _id: "$_id.imageId",
//                 answers: {
//                   $push: {
//                     answerId: "$_id.answerId",
//                     users: "$users",
//                   },
//                 },
//               },
//             },
//             {
//               $project: {
//                 _id: 0,
//                 imageId: "$_id",
//                 answers: 1,
//               },
//             },
//             {
//               $lookup: {
//                 from: "tacticaldecisiongameimages", // Replace with the actual name of your image collection
//                 localField: "imageId",
//                 foreignField: "_id",
//                 as: "imageId",
//               },
//             },
//             {
//               $project: {
//                 _id: 0,
//                 image: { $arrayElemAt: ["$imageId.image", 0] },
//                 answers: 1,
//               },
//             },
//           ],
//         },
//       },
//     ]);
// console.log("data",data);
//     // Extract the counts and group details
//     let totalUserCount = 0; // Initialize totalUserCount to 0
//     if (data[0].totalUserCount.length > 0) {
//       totalUserCount = data[0].totalUserCount[0].count;
//     }
//     const images = data[0].images;

//     images.forEach((image) => {
//       image.answers.forEach((answer) => {
//         console.log("%%%%%% " + answer.users.length);

//         const percentage = parseFloat(
//           ((answer.users.length / totalUserCount) * 100).toFixed(2)
//         );
//         answer.percentage = percentage;
//       });
//     });
//     res.status(200).json({
//       status: "success",
//       message: "Get Statistics successfully.",
//       data: data,
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: "failed",
//       message: error.message,
//     });
//   }
// };