const GROUP = require("../models/appGroupModel");
const GROUP_PLAY = require("../models/appGroupPlayModel");
const GROUP_PLAYER = require("../models/appGroupPlayerModel");
const ASSIGNMENT = require("../models/assignmentModel");
const BEST_PRACTICES_TDG = require("../models/bestPracticesTdgModel");
const INCIDENT_TYPE = require("../models/incidentTypeModel");
const PROFILE = require("../models/profileModel");
const RESPONSE_TYPE = require("../models/responseTypeModel");
const TDG_LIBRARY = require("../models/tdgLibraryModel");
const USER = require("../models/userModel");
const GROUP_PLAY_LOBBY = require("../models/appGroupPlayLobbyModel")
const HOST_REQUEST = require("../models/appHostRequestModel");
const TACTICAL_DECISION_GAME = require("../models/tacticalDecisionGameModel")
const PLAYER_REQUEST = require("../models/appPlayerRequestModel");
const TACTICAL_DECISION_GAME_LIST_ANSWER = require("../models/appTacticalDecisionGameListAnswerModel");
const TACTICAL_DECISION_GAME_IMAGE = require("../models/tacticalDecisionGameImageModel");
const TACTICAL_DECISION_GAME_ADD_ANSWER = require("../models/tacticalDecisionGameAddAnswerModel");
const BEST_PRACTICES_DECISION_GAME = require("../models/bestPracticesDecisionGameModel")
const TACTICAL_DECISION_GAME_RATING_SCALE_TEXT = require("../models/tacticalDecisionGameRatingScaleTextModel");
const ORGANIZATION = require("../models/organizationModel");
const TACTICAL_FUNCTION = require("../models/tacticalFunctionModel");
const OBJECTIVES = require("../models/objectivesModel");
const INCIDENT_PRIORITIES = require("../models/incidentPrioritiesModel")
var ACTION_KEYS = require('../models/actionKeysModel');
var ACTION_LIST = require('../models/actionListModel');


exports.createGroup = async function (req, res, next) {
  try {
    if (req.role === "superAdmin" || req.role === "organization" || req.role === "fireFighter") {
      if (!req.body.name || req.body.name === null || req.body.name === undefined) {
        throw new Error('Please provide a name.')
      }
      var group = await GROUP.create({
        name: req.body.name,
        isDeleted: false,
      });
    } else {
      throw new Error("You can not access.");
    }
    var response = {
      groupId: group.id,
      name: group.name,
      isDeleted: group.isDeleted,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    };
    res.status(200).json({
      status: "success",
      message: "Group created successfully.",
      data: response,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

exports.getGroup = async function (req, res, next) {
  try {
    if (req.role === "superAdmin") {
      var group = await GROUP.find({ isDeleted: false });
    } else if (req.role === "organization" || req.role === "fireFighter") {
      var group = await GROUP.find({ isDeleted: false });
    } else {
      throw new Error("You can not access.");
    }
    var response = group.map((record) => {
      var obj = {
        groupId: record.id,
        name: record.name,
        isDeleted: record.isDeleted,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      };
      return obj;
    });
    res.status(200).json({
      status: "success",
      message: "Group get successfully.",
      data: response,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

exports.updateGroup = async function (req, res, next) {
  try {
    id = req.params.id;
    var find = await GROUP.findOne({ _id: id });
    if (!find) {
      throw new Error("Group not found");
    } else if (find.isDeleted === true) {
      throw new Error("Group is already deleted");
    }
    if (req.role === "superAdmin") {
      var group = await GROUP.findByIdAndUpdate(
        id,
        {
          name: req.body.name,
        },
        { new: true }
      );
    } else if (req.role === "organization" || req.role === "fireFighter") {
      var group = await GROUP.findByIdAndUpdate(
        id,
        {
          name: req.body.name,
        },
        { new: true }
      );
    } else {
      throw new Error("You can not access.");
    }
    var response = {
      groupId: group.id,
      name: group.name,
      isDeleted: group.isDeleted,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    };
    res.status(200).json({
      status: "success",
      message: "Group update successfully.",
      data: response,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

exports.deleteGroup = async function (req, res, next) {
  try {
    id = req.params.id;
    var find = await GROUP.findOne({ _id: id });
    if (!find) {
      throw new Error("Group not found.");
    } else if (find.isDeleted === true) {
      throw new Error("Group is Already Deleted");
    }

    if (req.role === "superAdmin") {
      var group = await GROUP.findByIdAndUpdate(
        id,
        {
          isDeleted: true,
        },
        { new: true }
      );

      var groupPlayer = await GROUP_PLAYER.find({ groupId: group.id });
      var deleteData = await Promise.all(
        groupPlayer.map(async (record) => {
          var d = await GROUP_PLAYER.findByIdAndUpdate(record.id, {
            isDeleted: true,
          });
          return d;
        })
      );
    } else if (req.role === "organization" || req.role === "fireFighter") {
      var group = await GROUP.findByIdAndUpdate(
        id,
        {
          isDeleted: true,
        },
        { new: true }
      );

      var groupPlayer = await GROUP_PLAYER.find({ groupId: group.id });
      var deleteData = await Promise.all(
        groupPlayer.map(async (record) => {
          var d = await GROUP_PLAYER.findByIdAndUpdate(record.id, {
            isDeleted: true,
          });
          return d;
        })
      );
    } else {
      throw new Error("You can not access.");
    }
    var response = {
      groupId: group.id,
      name: group.name,
      isDeleted: group.isDeleted,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    };
    res.status(200).json({
      status: "success",
      message: "Group delete successfully.",
      data: response,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

// exports.addPlayerInGroup = async function (req, res, next) {
//   try {
//     var findGroup = await GROUP.findOne({ _id: req.body.groupId });
//     if (!findGroup) {
//       throw new Error("Group not found.");
//     } else if (findGroup.isDeleted === true) {
//       throw new Error("group is already deleted.");
//     }

//     var findGroupPlayer = await GROUP_PLAYER.findOne({
//       groupId: req.body.groupId,
//       userId: req.body.userId,
//       isDeleted: false,
//     });
//     if (findGroupPlayer) {
//       throw new Error("This player already exists in this group.");
//     }
//     var findPlayer = await USER.findOne({ _id: req.body.userId });
//     if (!findPlayer) {
//       throw new Error("player not found.");
//     } else if (findPlayer.isDeleted === true) {
//       throw new Error("player is already deleted.");
//     } else if (findPlayer.role != "fireFighter") {
//       throw new Error("player is not fireFighter.");
//     }else if (findPlayer.id === req.userId){
//       throw new Error("you can't select yourself")
//     }
//     if (req.role === "superAdmin") {
//       var groupPlayer = await GROUP_PLAYER.create({
//         groupId: req.body.groupId,
//         userId: req.body.userId,
//         isDeleted: false,
//       });
//     } else if (req.role === "organization" || req.role === "fireFighter") {
//       var groupPlayer = await GROUP_PLAYER.create({
//         groupId: req.body.groupId,
//         userId: req.body.userId,
//         isDeleted: false,
//       });
//     } else {
//       throw new Error("You can not access.");
//     }

//     var response = {
//       groupPlayerId: groupPlayer.id,
//       groupId: groupPlayer.groupId,
//       userId: groupPlayer.userId,
//       isDeleted: groupPlayer.isDeleted,
//       createdAt: groupPlayer.createdAt,
//       updatedAt: groupPlayer.updatedAt,
//     };
//     res.status(200).json({
//       status: "success",
//       message: "Player add successfully.",
//       data: response,
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: "failed",
//       message: error.message,
//     });
//   }
// };

exports.addPlayerInGroup = async function (req, res, next) {
  try {
    var groupId = req.body.groupId;
    var playersToAdd = req.body.players; // Assuming players is an array of objects with userId field
    console.log(playersToAdd);
    var findGroup = await GROUP.findOne({ _id: groupId });
    if (!findGroup) {
      throw new Error("Group not found.");
    } else if (findGroup.isDeleted === true) {
      throw new Error("Group is already deleted.");
    }

    var existingGroupPlayers = await GROUP_PLAYER.find({
      groupId,
      userId: { $in: playersToAdd.map(player => player.userId) },
      isDeleted: false,
    });

    if (existingGroupPlayers.length > 0) {
      throw new Error("One or more players already exist in this group.");
    }

    for (const player of playersToAdd) {
      var findPlayer = await USER.findOne({ _id: player.userId });

      if (!findPlayer) {
        throw new Error(`Player with userId ${player.userId} not found.`);
      } else if (findPlayer.isDeleted === true) {
        throw new Error(`Player with userId ${player.userId} is already deleted.`);
      } else if (findPlayer.role !== "fireFighter") {
        throw new Error(`Player with userId ${player.userId} is not a fireFighter.`);
      }
      // else if (findPlayer.id === req.userId) {
      //   throw new Error("You can't select yourself.");
      // }
    }

    if (req.role === "superAdmin" || req.role === "organization" || req.role === "fireFighter") {
      var createdPlayers = await Promise.all(playersToAdd.map(async player => {
        return await GROUP_PLAYER.create({
          groupId,
          userId: player.userId,
          isDeleted: false,
        });
      }));


    } else {
      throw new Error("You do not have the necessary permissions.");
    }
    var responseData = createdPlayers.map(player => ({
      groupPlayerId: player.id,
      groupId: player.groupId,
      userId: player.userId,
      isDeleted: player.isDeleted,
      createdAt: player.createdAt,
      updatedAt: player.updatedAt,
    }));

    res.status(200).json({
      status: "success",
      message: "Players added successfully.",
      data: responseData,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

exports.getGroupPlayers = async function (req, res, next) {
  try {
    id = req.params.id;
    if (req.role === "superAdmin" || req.role === "organization" || req.role === "fireFighter") {
      var groupPlayer = await GROUP_PLAYER.find({
        groupId: id,
        isDeleted: false,
      }).populate("userId");
    } else {
      throw new Error("You can not access.");
    }

    var response = await Promise.all(
      groupPlayer.map(async (record) => {
        var profile = await PROFILE.findOne({ userId: record.userId._id });

        var obj = {
          groupPlayerId: record._id,
          groupId: record.groupId,
          userId: record.userId._id,
          name: profile.profileName,
          isDeleted: record.isDeleted,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        };
        return obj;
      })
    );
    res.status(200).json({
      status: "success",
      message: "get group player successfully",
      data: response,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

exports.removePlayerFromGroup = async function (req, res, next) {
  try {
    id = req.params.id;
    if (req.role === "superAdmin" || req.role === "organization" || req.role === "fireFighter") {
      var deletePlayer = await GROUP_PLAYER.findByIdAndDelete(id);
    } else {
      throw new Error("You can not access.");
    }
    var response = {
      groupPlayerId: deletePlayer.id,
      groupId: deletePlayer.groupId,
      userId: deletePlayer.userId,
    };
    res.status(200).json({
      status: "success",
      message: "Player Remove from Group successfully.",
      data: response,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

exports.startGame = async function (req, res, next) {
  try {

    console.log("req.userId" + req.userId);
    if (!req.body.groupId) {
      throw new Error("groupId is required");
    } else if (!req.body.responseTypeId) {
      throw new Error("responseTypeId is required");
    } else if (!req.body.incidentTypeId) {
      throw new Error("incidentTypeId is required");
    } else if (!req.body.assignmentId) {
      throw new Error("assignmentId is required");
    } else if (!req.body.tdgLibraryId) {
      throw new Error("tdgLibraryId is required");
    } else if (!req.body.tacticalDecisionGameId) {
      throw new Error("tacticalDecisionGameId is required");
    }

    // if (req.role === "superAdmin") {
    //   var user = await USER.findOne({_id : req.userId})
    //   console.log(user);

    //   var profile = await PROFILE.findOne({userId : user._id})
    //   console.log(profile);
    //   if(!profile){
    //     throw new Error("profile not found.");
    //   }
    //   var group = await GROUP.findOne({ _id: req.body.groupId });

    //   var findGroupPlayer = await GROUP_PLAYER.find({groupId : group.id})
    //   console.log(findGroupPlayer);
    //   var findUsers =await Promise.all( findGroupPlayer.map(async(record) => {

    //     var  hostRequest = await HOST_REQUEST.create({
    //       groupId : record.groupId,
    //       tdgLibraryId : req.body.tdgLibraryId,
    //       userId :  record.userId,
    //       status : "pending",
    //       sendBy : req.userId
    //     }) 
    //     return hostRequest;
    //   }))
    //   console.log("findUsers",findUsers)




    //   var responseType = await RESPONSE_TYPE.findOne({
    //     _id: req.body.responseTypeId,
    //   });
    //   var incidentType = await INCIDENT_TYPE.findOne({
    //     _id: req.body.incidentTypeId,
    //   });
    //   var assignment = await ASSIGNMENT.findOne({ _id: req.body.assignmentId });
    //   var tdg = await TDG_LIBRARY.findOne({ _id: req.body.tdgLibraryId });
    //   var bestPracticesTdg = await BEST_PRACTICES_TDG.find({
    //     tdgLibraryId: tdg.id,
    //   });
    //   if (bestPracticesTdg.length === 0) {
    //     throw new Error("No best practices found.");
    //   }

    // } 
    //else
    if (req.role === "organization" || req.role === "fireFighter") {
      var user = await USER.findOne({ _id: req.userId })
      console.log(user + 'user');

      var profile = await PROFILE.findOne({ userId: user._id })
      console.log(profile + 'profile');
      if (!profile) {
        throw new Error("profile not found.");
      }
      var group = await GROUP.findOne({ _id: req.body.groupId });

      // var findGroupPlayer = await GROUP_PLAYER.find({groupId : group.id})
      // console.log(findGroupPlayer);
      // var findUsers =await Promise.all( findGroupPlayer.map(async(record) => {

      //   var  hostRequest = await HOST_REQUEST.create({
      //     groupId : record.groupId,
      //     tdgLibraryId : req.body.tdgLibraryId,
      //     tacticalDecisionGameId :req.body.tacticalDecisionGameId,
      //     userId :  record.userId,
      //     status : "pending",
      //     sendBy : req.userId,
      //     isDeleted : false
      //   }) 
      //   return hostRequest;
      // }))
      // console.log("findUsers",findUsers)

      var responseType = await RESPONSE_TYPE.findOne({
        _id: req.body.responseTypeId,
      });
      var incidentType = await INCIDENT_TYPE.findOne({
        _id: req.body.incidentTypeId,
      });
      var assignment = await ASSIGNMENT.findOne({ _id: req.body.assignmentId });
      var tdg = await TDG_LIBRARY.findOne({ _id: req.body.tdgLibraryId });
      var bestPracticesTdg = await BEST_PRACTICES_TDG.find({
        tdgLibraryId: tdg.id,
      });
      var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findOne({ _id: req.body.tacticalDecisionGameId, isDeleted: false })

      if (bestPracticesTdg.length === 0) {
        throw new Error("No best practices found.");
      }

    } else {
      throw new Error("You can not access.");
    }

    if (tdg.audio === null || tdg.audio === '') {
      var audioUrl = '';
    } else {
      var audioUrl = req.protocol + "://" + req.get("host") + "/" + "images/" + tdg.audio;
    }

    let imageUrl;
    if (tdg.image === null || tdg.image === '') {
      imageUrl = '';
    } else {
      imageUrl = req.protocol + "://" + req.get("host") + "/" + "images/" + tdg.image;
    }

    var response = {
      hostName: profile.profileName,
      groupId: group.id,
      groupName: group.name,
      responseTypeId: responseType.id,
      responseTypeName: responseType.name,
      incidentTypeId: incidentType.id,
      incidentTypeName: incidentType.name,
      assignmentId: assignment.id,
      assignmentName: assignment.name,
      tdgLibraryId: tdg.id,
      tdgLibraryIdName: tdg.name,
      tdgLibraryImage: imageUrl,
      tdgLibraryAudio: audioUrl,
      tdgLibraryText: tdg.missionBriefing,
      bestPracticesTdg: bestPracticesTdg,
      tacticalDecisionGameId: tacticalDecisionGame.id,
      tacticalDecisionGameName: tacticalDecisionGame.text,
      //hostRequestTo  :findUsers
    };
    res.status(200).json({
      status: "success",
      message: "Starting Game successfully.",
      data: response,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

exports.statusChangeForPlayer = async function (req, res, next) {
  try {
    var id = req.params.id

    if (req.role === 'organization' || req.role === 'fireFighter' || req.role === 'superAdmin') {
      console.log(req.role)

      var find = await HOST_REQUEST.findOne({ _id: id })

      if (!find) {
        throw new Error("Couldn't find")
      }

      var hostRequest = await HOST_REQUEST.findByIdAndUpdate(id, {
        status: req.body.status,
      }, { new: true })

      console.log(hostRequest, "host request");
    } else {
      throw new Error('You can not access.')
    }

    res.status(200).json({
      status: "success",
      message: "status change for player successfully.",
      data: hostRequest,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
}

//----------------------------------------------------------------LOBBY CRUD----------------------------------------------------------------

exports.createGroupLobby = async function (req, res, next) {
  try {
    if (req.role === 'superAdmin') {

      const sanitizedFileName = req.file.filename.replace(' ', '');

      // Encode the sanitized file name for safe URL usage
      const encodedFileName = encodeURIComponent(sanitizedFileName);

      // const url = req.protocol + "://" + req.get("host") + "/images/" + encodedFileName;

      var groupPlayLobby = await GROUP_PLAY_LOBBY.create({
        type: req.body.type,
        file: encodedFileName,
        isDeleted: false
      })
    } else if (req.role === 'organization' || req.role === 'fireFighter') {
      const sanitizedFileName = req.file.filename.replace(' ', '');

      // Encode the sanitized file name for safe URL usage
      const encodedFileName = encodeURIComponent(sanitizedFileName);

      // const url = req.protocol + "://" + req.get("host") + "/images/" + encodedFileName;

      var groupPlayLobby = await GROUP_PLAY_LOBBY.create({
        type: req.body.type,
        file: encodedFileName,
        isDeleted: false
      })
    } else {
      throw new Error('You can not access.')
    }

    var response = {
      groupPlayLobbyId: groupPlayLobby.id,
      type: groupPlayLobby.type,
      file: groupPlayLobby.file,
      isDeleted: groupPlayLobby.isDeleted,
    }
    res.status(200).json({
      status: "success",
      message: "Create group lobby successfully.",
      data: response,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

exports.getGroupLobby = async function (req, res, next) {
  try {
    if (req.role === 'superAdmin') {
      console.log(req.role)
      var groupPlayLobby = await GROUP_PLAY_LOBBY.find({
        isDeleted: false
      })
      console.log(groupPlayLobby);
    } else if (req.role === 'organization' || req.role === 'fireFighter') {
      var groupPlayLobby = await GROUP_PLAY_LOBBY.find({
        isDeleted: false
      })
    } else {
      throw new Error('You can not access.')
    }

    var response = groupPlayLobby.map((record) => {
      const url = req.protocol + "://" + req.get("host") + "/images/" + record.file;

      var obj = {
        groupPlayLobbyId: record.id,
        type: record.type,
        file: url,
        isDeleted: record.isDeleted
      }
      return obj;
    })
    res.status(200).json({
      status: "success",
      message: "get group lobby successfully.",
      data: response,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

exports.updateGroupLobby = async function (req, res, next) {
  try {
    var id = req.params.id
    if (req.role === 'superAdmin') {
      console.log(req.role)
      const sanitizedFileName = req.file.filename.replace(' ', '');
      // Encode the sanitized file name for safe URL usage
      const encodedFileName = encodeURIComponent(sanitizedFileName);
      // const url = req.protocol + "://" + req.get("host") + "/images/" + encodedFileName;

      var groupPlayLobby = await GROUP_PLAY_LOBBY.findByIdAndUpdate(id, {
        type: req.body.type,
        file: encodedFileName
      }, { new: true })
      console.log(groupPlayLobby);

    } else if (req.role === 'organization' || req.role === 'fireFighter') {
      console.log(req.role)
      const sanitizedFileName = req.file.filename.replace(' ', '');

      // Encode the sanitized file name for safe URL usage
      const encodedFileName = encodeURIComponent(sanitizedFileName);

      // const url = req.protocol + "://" + req.get("host") + "/images/" + encodedFileName;

      var groupPlayLobby = await GROUP_PLAY_LOBBY.findByIdAndUpdate(id, {
        type: req.body.type,
        file: encodedFileName
      }, { new: true })
      console.log(groupPlayLobby);
    } else {
      throw new Error('You can not access.')
    }

    var response = {

      groupPlayLobbyId: groupPlayLobby.id,
      type: groupPlayLobby.type,
      file: groupPlayLobby.file,
      isDeleted: groupPlayLobby.isDeleted

    }
    res.status(200).json({
      status: "success",
      message: "update group lobby successfully.",
      data: response,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
}

exports.deleteGroupLobby = async function (req, res, next) {
  try {
    var id = req.params.id
    if (req.role === 'superAdmin') {
      console.log(req.role)
      var groupPlayLobby = await GROUP_PLAY_LOBBY.findByIdAndUpdate(id, {
        isDeleted: true
      }, { new: true })
      console.log(groupPlayLobby);

    } else if (req.role === 'organization' || req.role === 'fireFighter') {
      console.log(req.role)
      var groupPlayLobby = await GROUP_PLAY_LOBBY.findByIdAndUpdate(id, {
        isDeleted: true
      }, { new: true })
      console.log(groupPlayLobby);

    } else {
      throw new Error('You can not access.')
    }

    var response = {

      groupPlayLobbyId: groupPlayLobby.id,
      type: groupPlayLobby.type,
      file: groupPlayLobby.file,
      isDeleted: groupPlayLobby.isDeleted

    }
    res.status(200).json({
      status: "success",
      message: "delete group lobby successfully.",
      data: response,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
}

//--------------------------------------------------------------------------------------------------------------------------------------------

exports.groupPlayStart = async function (req, res, next) {
  try {
    console.log("req.userId" + req.userId);
    if (!req.body.groupId) {
      throw new Error("groupId is required");
    } else if (!req.body.tdgLibraryId) {
      throw new Error("tdgLibraryId is required");
    } else if (!req.body.tacticalDecisionGameId) {
      throw new Error("tacticalDecisionGameId is required");
    } else if (!req.body.userId) {
      throw new Error("userId is required");
    } else if (!req.body.playType) {
      throw new Error("playType is required");
    } else if (!req.body.gameStatus) {
      throw new Error("gameStatus is required");
    }
    // else if (!req.body.groupPlayLobbyId) {
    //   throw new Error("groupPlayLobbyId is required");
    // }
    var conferencing;
    if (!req.body.conferencing || req.body.conferencing === null) {
      conferencing = ''
    } else {
      conferencing = req.body.conferencing
    }

    var text;
    if (!req.body.text || req.body.text === null) {
      text = '';
    } else {
      text = req.body.text;
    }

    if (req.role === "superAdmin") {
      var playLaterTimestamps = req.body.playLaterTime
      // var currentTime = new Date();
      // var playNowTimestamps = currentTime.getTime();
      var groupPlay = await GROUP_PLAY.create({
        tdgLibraryId: req.body.tdgLibraryId,
        tacticalDecisionGameId: req.body.tacticalDecisionGameId,
        groupId: req.body.groupId,
        hostId: req.body.userId,
        playLaterTime: (playLaterTimestamps || playLaterTimestamps === 0) ? playLaterTimestamps : Math.floor(new Date().getTime() / 1000),
        playType: req.body.playType,
        gameStatus: req.body.gameStatus,
        groupPlayLobbyId: req.body.groupPlayLobbyId ? req.body.groupPlayLobbyId : null,
        conferencing: conferencing,
        text: text,
        isDeleted: false
      })
      var group = await GROUP.findOne({ _id: req.body.groupId });

      var findGroupPlayer = await GROUP_PLAYER.find({ groupId: group.id })
      // console.log(findGroupPlayer);
      var findUsers = await Promise.all(findGroupPlayer.map(async (record) => {

        var hostRequest = await HOST_REQUEST.create({
          groupPlayId: groupPlay.id,
          playLaterTime: groupPlay.playLaterTime,
          groupId: record.groupId,
          tdgLibraryId: req.body.tdgLibraryId,
          tacticalDecisionGameId: req.body.tacticalDecisionGameId,
          userId: record.userId,
          status: "pending",
          sendBy: req.userId,
          isDeleted: false
        })
        return hostRequest;
      }))
      var findHost = await PROFILE.findOne({ userId: req.body.userId })
      var findGroup = await GROUP.findOne({ _id: req.body.groupId })
      var findTdg = await TDG_LIBRARY.findOne({ _id: req.body.tdgLibraryId })
      var findGame = await TACTICAL_DECISION_GAME.findOne({ _id: req.body.tacticalDecisionGameId, isDeleted: false })

    } else if (req.role === "organization" || req.role === "fireFighter") {
      var playLaterTimestamps = req.body.playLaterTime
      // var currentTime = new Date();
      // var playNowTimestamps = currentTime.getTime();
      // console.log('enter')
      console.log("playLaterTimestamps : " + playLaterTimestamps)
      var groupPlay = await GROUP_PLAY.create({
        tdgLibraryId: req.body.tdgLibraryId,
        tacticalDecisionGameId: req.body.tacticalDecisionGameId,
        groupId: req.body.groupId,
        hostId: req.body.userId,
        playLaterTime: (playLaterTimestamps || playLaterTimestamps === 0) ? playLaterTimestamps : Math.floor(new Date().getTime() / 1000),
        playType: req.body.playType,
        gameStatus: req.body.gameStatus,
        groupPlayLobbyId: req.body.groupPlayLobbyId ? req.body.groupPlayLobbyId : null,
        conferencing: conferencing,
        text: text,
        isDeleted: false
      })
      var group = await GROUP.findOne({ _id: req.body.groupId });
      // console.log(group);
      var findGroupPlayer = await GROUP_PLAYER.find({ groupId: group._id, isDeleted: false });
      var findUsers = await Promise.all(findGroupPlayer.map(async (record) => {

        var hostRequest = await HOST_REQUEST.create({
          groupPlayId: groupPlay.id,
          playLaterTime: groupPlay.playLaterTime,
          groupId: record.groupId,
          tdgLibraryId: req.body.tdgLibraryId,
          tacticalDecisionGameId: req.body.tacticalDecisionGameId,
          userId: record.userId,
          status: "pending",
          sendBy: req.userId,
          isDeleted: false
        })

        console.log(hostRequest, "hostRequest")

        return hostRequest;
      }))
      console.log("host users length", findUsers.length);
      var findHost = await PROFILE.findOne({ userId: req.body.userId })
      // console.log(req.body.groupId);
      var findGroup = await GROUP.findOne({ _id: req.body.groupId })
      console.log(findGroup);
      var findTdg = await TDG_LIBRARY.findOne({ _id: req.body.tdgLibraryId })
      var findGame = await TACTICAL_DECISION_GAME.findOne({ _id: req.body.tacticalDecisionGameId, isDeleted: false })
    } else {
      throw new Error("You can not access.");
    }

    console.log("groupPlay id :", groupPlay._id)
    var playerUpdate = await HOST_REQUEST.find({ groupPlayId: groupPlay._id, isDeleted: false });

    for (const record of playerUpdate) {
      console.log(record, "record")
      record.status = 'pending';
      await record.save();
    }

    console.log(playerUpdate.length + "player length");

    var response = {
      groupPlayId: groupPlay.id,
      tdgLibraryId: groupPlay.tdgLibraryId,
      tacticalDecisionGameId: groupPlay.tacticalDecisionGameId,
      tdgLibraryName: findTdg.name,
      groupId: groupPlay.groupId,
      groupName: findGroup.name,
      playType: groupPlay.playType,
      gameStatus: groupPlay.gameStatus,
      tacticalDecisionGameId: findGame.id,
      tacticalDecisionGameName: findGame.text,
      hostId: groupPlay.hostId,
      hostName: findHost.profileName,
      playLaterTime: groupPlay.playLaterTime,
      groupPlayLobbyId: (groupPlay.groupPlayLobbyId === null) ? '' : groupPlay.groupPlayLobbyId,
      conferencing: groupPlay.conferencing,
      text: groupPlay.text,
      hostRequestTo: findUsers
    };

    res.status(200).json({
      status: "success",
      message: "Starting Game successfully.",
      data: response,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

exports.updateGroupPlay = async (req, res, next) => {
  try {
    console.log("req.userId" + req.userId);
    if (!req.body.groupPlayId) {
      throw new Error("groupPlayId is required");
    }

    const groupPlayId = req.body.groupPlayId

    var conferencing;
    if (!req.body.conferencing || req.body.conferencing === null) {
      conferencing = ''
    } else {
      conferencing = req.body.conferencing
    }

    var text;
    if (!req.body.text || req.body.text === null) {
      text = '';
    } else {
      text = req.body.text;
    }

    if (req.role === "organization" || req.role === "fireFighter" || req.role === "superAdmin") {
      const groupPlayFind = await GROUP_PLAY.findOne({ _id: groupPlayId, isDeleted: false })

      if (!groupPlayFind) {
        throw new Error('GroupPlay is not found');
      }
      // var playLaterTimestamps = new Date(req.body.playLaterTime).getTime();

      var groupPlayLobby;
      if (req.body.groupPlayLobbyId === null || req.body.groupPlayLobbyId === '') {
        groupPlayLobby = null;
      } else if (req.body.groupPlayLobbyId) {

        const isGroupPlayLobbyId = await GROUP_PLAY_LOBBY.findById(req.body.groupPlayLobbyId)

        if (!isGroupPlayLobbyId) {
          throw new Error('GroupPlayLobby is not found')
        }
        groupPlayLobby = req.body.groupPlayLobbyId;
      } else {
        groupPlayLobby = groupPlayFind.groupPlayLobbyId;
      }
      console.log(groupPlayLobby);
      const updateGroupPlay = await GROUP_PLAY.findByIdAndUpdate(groupPlayId, {
        groupPlayLobbyId: groupPlayLobby,
        conferencing: conferencing ? conferencing : groupPlayFind.conferencing,
        text: text ? text : groupPlayFind.text,
      }, { new: true })

      var response = {
        _id: updateGroupPlay._id,
        tdgLibraryId: updateGroupPlay.tdgLibraryId,
        groupId: updateGroupPlay.groupId,
        hostId: updateGroupPlay.hostId,
        groupPlayLobbyId: (updateGroupPlay.groupPlayLobbyId === null) ? '' : updateGroupPlay.groupPlayLobbyId,
        tacticalDecisionGameId: updateGroupPlay.tacticalDecisionGameId,
        conferencing: updateGroupPlay.conferencing,
        text: updateGroupPlay.text,
        playLaterTime: updateGroupPlay.playLaterTime,
        gameStatus: updateGroupPlay.gameStatus,
        playType: updateGroupPlay.playType,
        isDeleted: updateGroupPlay.isDeleted,
        createdAt: updateGroupPlay.createdAt,
        updatedAt: updateGroupPlay.updatedAt,
      };

      res.status(200).json({
        status: "success",
        message: "update GroupPlay successfully.",
        data: response,
      });

    } else {
      throw new Error("You can not access.");
    }
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }

}

//--------------------------------------------------------------------------------------------------------------------------------------------
exports.outGoingRequest = async function (req, res, next) {
  try {
    var id = req.params.id
    if (!id) {
      throw new Error('id is required.');
    }
    console.log("req.userId" + req.userId);
    if (req.role === "superAdmin") {
      var findGroupPlayer = await GROUP_PLAYER.find({ groupId: id })
      console.log(findGroupPlayer);

      var usersRequest = await Promise.all(findGroupPlayer.map(async (record) => {

        var hostReq = await HOST_REQUEST.find({})
        var obj = {
          groupId: hostReq
        }
        return obj;
      }))

    } else if (req.role === "organization" || req.role === "fireFighter") {
      var findGroupPlayer = await GROUP_PLAYER.find({ groupId: id })
      console.log(findGroupPlayer);

      var usersRequest = await Promise.all(findGroupPlayer.map(async (record) => {

        var hostReq = await HOST_REQUEST.find({})
        var obj = {
          groupId: hostReq
        }
        return obj;
      }))
    } else {
      throw new Error("You can not access.");
    }

    // var response = {
    //   groupId : record.groupId,
    //   tdgLibraryId : req.body.tdgLibraryId,
    //   userId :  record.userId,
    //   status : "pending",
    //   sendBy : req.userId,
    //   isDeleted : false
    // };
    res.status(200).json({
      status: "success",
      message: "out Going Request successfully.",
      data: findGroupPlayer, usersRequest,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

//----------------------------------------------------------------GROUP PLAY PLAYER APP SIDE---------------------------------------------------

// exports.groupPlayRequestsFromHost = async function (req, res, next) {
//   try {

//     if (req.role === "superAdmin") {

//       var acceptArray = [];
//       var runningArray = [];
//       var upComingArray = [];
//       var completeArray = [];
//       var requestArray = [];

//       var groupPlay = await GROUP_PLAY.find({}).populate("tdgLibraryId");
//       groupPlay.forEach((record) => {
//         if (record.gameStatus === "running") {
//           runningArray.push(record);
//         } else if (record.gameStatus === "upComing") {
//           upComingArray.push(record);
//         } else if (record.gameStatus === "complete") {
//           completeArray.push(record);
//         }
//       });

//       var playerRequest = await PLAYER_REQUEST.find({ userId : req.userId , isDeleted : false }).populate("tdgLibraryId");
//       for (const record of playerRequest) {
//         if (record.status === "pending") {
//           requestArray.push(record);
//         } else if (record.status === "accept") {
//           var group = await GROUP_PLAY.findOne({ _id : record.groupPlayId });
//           if(group.playType === "playNow") {
//             var accepted = await PLAYER_REQUEST.findOne({ _id : record._id , status : 'accept' }).populate("tdgLibraryId");
//             if(accepted) {
//               runningArray.push(record)
//             }
//           } else if(group.playType === "playLater") {
//             var notInAccept = await PLAYER_REQUEST.findOne({ _id : record._id , status : 'pending' }).populate("tdgLibraryId");
//             if(notInAccept) {
//               upComingArray.push(record)
//             }
//           }
//           acceptArray.push(record);
//         }
//       }

//       var hostRequest = await HOST_REQUEST.find({ userId : req.userId , isDeleted : false }).populate("tdgLibraryId");
//       for (const record of hostRequest) {
//         if (record.status === "accept") {
//           const group = await GROUP_PLAY.findOne({ _id: record.groupPlayId });
//           if (group.playType === "playNow") {
//             var accepted = await HOST_REQUEST.findOne({ _id : record._id , status : 'accept' }).populate("tdgLibraryId");
//             if(accepted) {
//               runningArray.push(record);
//             }
//           } else if (group.playType === "playLater") {
//             var notInAccept = await HOST_REQUEST.findOne({ _id : record._id , status : 'pending' }).populate("tdgLibraryId");
//             if(notInAccept) {
//               upComingArray.push(record);
//             }
//           }
//           acceptArray.push(record);
//         } else if (record.status === "pending") {
//           requestArray.push(record);
//         }
//       }

//     } else if (req.role === "organization" || req.role === "fireFighter") {

//       var acceptArray = [];
//       var runningArray = [];
//       var upComingArray = [];
//       var completeArray = [];
//       var requestArray = [];

//       var groupPlay = await GROUP_PLAY.find({ isDeleted : false }).populate("tdgLibraryId");
//       for (const record of groupPlay) {
//         if (record.gameStatus === "running") {
//           var acceptedPlayer = await PLAYER_REQUEST.findOne({ _id : record._id , status : 'accept' }).populate("tdgLibraryId");
//           var acceptedHost = await HOST_REQUEST.findOne({ _id : record._id , status : 'accept' }).populate("tdgLibraryId");
//           if(acceptedHost || acceptedPlayer) {
//             runningArray.push(record);
//           }
//         } else if (record.gameStatus === "upComing") {
//           upComingArray.push(record);
//         } else if (record.gameStatus === "complete") {
//           completeArray.push(record);
//         }
//       };

//       var playerRequest = await PLAYER_REQUEST.find({ userId : req.userId , isDeleted : false }).populate("tdgLibraryId");
//       for (const record of playerRequest) {
//         if (record.status === "pending") {
//           requestArray.push(record);
//         } else if (record.status === "accept") {
//           var group = await GROUP_PLAY.findOne({ _id : record.groupPlayId });
//           if(group.playType === "playNow") {
//             var accepted = await PLAYER_REQUEST.findOne({ _id : record._id , status : 'accept' }).populate("tdgLibraryId");
//             if(accepted) {
//               runningArray.push(record)
//             }
//           } else if(group.playType === "playLater") {
//             var notInAccept = await PLAYER_REQUEST.findOne({ _id : record._id , status : 'pending' }).populate("tdgLibraryId");
//             if(notInAccept) {
//               upComingArray.push(record)
//             }
//           }
//           acceptArray.push(record);
//         }
//       }

//       var hostRequest = await HOST_REQUEST.find({ userId : req.userId , isDeleted : false }).populate("tdgLibraryId");
//       for (const record of hostRequest) {
//         if (record.status === "accept") {
//           const group = await GROUP_PLAY.findOne({ _id: record.groupPlayId });
//           if (group.playType === "playNow") {
//             var accepted = await HOST_REQUEST.findOne({ _id : record._id , status : 'accept' }).populate("tdgLibraryId");
//             if(accepted) {
//               runningArray.push(record);
//             }
//           } else if (group.playType === "playLater") {
//             var notInAccept = await HOST_REQUEST.findOne({ _id : record._id , status : 'pending' }).populate("tdgLibraryId");
//             if(notInAccept) {
//               upComingArray.push(record);
//             }
//           }
//           acceptArray.push(record);
//         } else if (record.status === "pending") {
//           requestArray.push(record);
//         }
//       }
//     }

//     var response = {
//       acceptArray: acceptArray,
//       runningArray: runningArray,
//       upComingArray: upComingArray,
//       completeArray: completeArray,
//       requestArray: requestArray,
//     }
//     res.status(200).json({
//       status: "success",
//       message: "group play requests from host successfully.",
//       data: response
//     })
//   } catch (error) {
//     res.status(400).json({
//       status: "failed",
//       message: error.message
//     })
//   }
// };

exports.groupPlayRequestsFromHost = async function (req, res, next) {
  try {
    if (req.role === "superAdmin") {

      var acceptArray = [];
      var runningArray = [];
      var upComingArray = [];
      var completeArray = [];
      var requestArray = [];

      var groupPlay = await GROUP_PLAY.find({ isDeleted: false }).populate("tdgLibraryId");

      console.log('groupPlay length : ', groupPlay.length)

      for (const record of groupPlay) {
        var groupPlayer = await GROUP_PLAYER.findOne({ groupId: record._id, userId: req.userId, isDeleted: false });

        if (!groupPlayer || groupPlayer === null) {
          upComingArray.push(record);
        }
        if (record.gameStatus === "complete") {
          completeArray.push(record);
        }
      }


      var playerRequest = await PLAYER_REQUEST.find({ userId: req.userId, isDeleted: false }).populate("tdgLibraryId");

      for (const record of playerRequest) {
        //if (record.status === "pending") {
        //requestArray.push(record);

        //} else 
        if (record.status === "accept") {
          var group = await GROUP_PLAY.findOne({ _id: record.groupPlayId });
          if (group.playType === "playNow") {
            var accepted = await PLAYER_REQUEST.findOne({ _id: record._id, status: 'accept' }).populate("tdgLibraryId");
            if (accepted) {
              runningArray.push(record)
            }
          }
          acceptArray.push(record);
        }
      }

      var hostRequest = await HOST_REQUEST.find({ userId: req.userId, isDeleted: false }).populate("tdgLibraryId");
      for (const record of hostRequest) {
        if (record.status === "accept") {
          const group = await GROUP_PLAY.findOne({ _id: record.groupPlayId });
          if (group.playType === "playNow") {
            var accepted = await HOST_REQUEST.findOne({ _id: record._id, status: 'accept' }).populate("tdgLibraryId");
            if (accepted) {
              runningArray.push(record);
            }
          }
          acceptArray.push(record);
        } else if (record.status === "pending") {
          requestArray.push(record);
        }
      }

    } else if (req.role === "organization" || req.role === "fireFighter") {

      var acceptArray = [];
      var runningArray = [];
      var upComingArray = [];
      var completeArray = [];
      var requestArray = [];

      // var gameFind = await TACTICAL_DECISION_GAME.find({ organizationId :  req.userId , isDeleted : false });

      // for (const game of gameFind) { tacticalDecisionGameId : game._id ,

      var groupPlay = await GROUP_PLAY.find({ isDeleted: false, playType: 'playLater' }).populate("tdgLibraryId").populate({
        path: 'tacticalDecisionGameId',
        select: '_id text',
      });

      for (const record of groupPlay) {
        console.log('groupPlays Status : ', record.gameStatus)
        if (record.gameStatus === 'upComing') {
          var groupPlayer = await GROUP_PLAYER.findOne({ groupId: record.groupId, userId: req.userId, isDeleted: false });
          if (!groupPlayer || groupPlayer === null) {
            upComingArray.push(record);
          }
        }
      }

      for (const record of groupPlay) {
        if (record.gameStatus === "complete") {
          completeArray.push(record);
        }
      }

      var playerRequest = await PLAYER_REQUEST.find({ userId: req.userId, isDeleted: false }).populate("tdgLibraryId").populate({
        path: 'tacticalDecisionGameId',
        select: '_id text',
      });
      console.log('Player Request length : ', playerRequest.length)

      for (const record of playerRequest) {
        //if (record.status === "pending") {
        //  requestArray.push(record);
        //} else 
        if (record.status === "accept") {
          var group = await GROUP_PLAY.findOne({ _id: record.groupPlayId }).populate({
            path: 'tacticalDecisionGameId',
            select: '_id text',
          });

          if (group.gameStatus === "running") {
            var accepted = await PLAYER_REQUEST.findOne({ _id: record._id, status: 'accept' }).populate("tdgLibraryId").populate({
              path: 'tacticalDecisionGameId',
              select: '_id text',
            });

            if (accepted) {
              runningArray.push(record)
              console.log('runningArray length : ', runningArray.length)

            }
          }
          acceptArray.push(record);
        }
      }

      var hostRequest = await HOST_REQUEST.find({ userId: req.userId, isDeleted: false }).populate("tdgLibraryId").populate({
        path: 'tacticalDecisionGameId',
        select: '_id text',
      });

      console.log("hostRequest " + hostRequest.length)
      for (const record of hostRequest) {
        console.log('record.status : ' + record.status)
        if (record.status === "accept") {
          const group = await GROUP_PLAY.findOne({ _id: record.groupPlayId }).populate({
            path: 'tacticalDecisionGameId',
            select: '_id text',
          });

          if (group.gameStatus === "running") {
            var accepted = await HOST_REQUEST.findOne({ _id: record._id, status: 'accept' }).populate("tdgLibraryId").populate({
              path: 'tacticalDecisionGameId',
              select: '_id text',
            })

            if (accepted) {
              runningArray.push(record);
            }
          }
          acceptArray.push(record);
        } else if (record.status === "pending") {
          requestArray.push(record);
          console.log('requestArray length : ', requestArray.length)

        }
      }
    }

    var response = {
      acceptArray: acceptArray,
      runningArray: runningArray,
      upComingArray: upComingArray,
      completeArray: completeArray,
      requestArray: requestArray,
    }
    res.status(200).json({
      status: "success",
      message: "group play requests from host successfully.",
      data: response
    })
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message
    })
  }
};

exports.getOrganizationGames = async (req, res) => {
  try {
    var runningArray = [];
    var upComingArray = [];

    if (req.role === "superAdmin" || req.role === "organization" || req.role === "fireFighter") {

      var groupPlay = await GROUP_PLAY.find({ hostId: req.userId, isDeleted: false })
        .populate("tdgLibraryId")
        .populate({
          path: 'groupId',
          select: '_id name group',
        }).populate({
          path: 'tacticalDecisionGameId',
          select: '_id text',
        }).populate({
          path: 'hostId',
          select: '_id userName',
        }).populate('groupPlayLobbyId')

      const updateGroupPlay = await Promise.all(groupPlay.map(async (val, index) => {
        if (val.tdgLibraryId && val.tdgLibraryId.image) {
          const fileUrl = val.tdgLibraryId.image;
          if (!fileUrl.startsWith('http')) {
            val.tdgLibraryId.image = req.protocol + "://" + req.get("host") + "/images/" + fileUrl;
          }
        }
        if (val.tdgLibraryId && val.tdgLibraryId.audio) {
          const fileUrl = val.tdgLibraryId.audio;
          if (!fileUrl.startsWith('http')) {
            val.tdgLibraryId.audio = req.protocol + "://" + req.get("host") + "/images/" + fileUrl;
          }
        }
        if (val.groupPlayLobbyId && val.groupPlayLobbyId.file) {
          const fileUrl = val.groupPlayLobbyId.file;
          if (!fileUrl.startsWith('http')) {
            val.groupPlayLobbyId.file = req.protocol + "://" + req.get("host") + "/images/" + fileUrl;
          }
        }
        if (val.hostId) {
          const userProfile = await PROFILE.findOne({ userId: val.hostId })
          val.hostId.userName = userProfile.profileName
        }
        return val;
      }));

      for (const record of updateGroupPlay) {
        // Replace null or undefined groupPlayLobbyId with an empty string
        if (record.gameStatus === "upComing") {
          if (record) {
            upComingArray.push(record);
          }
        } else if (record.gameStatus === "complete") {
          if (record) {
            completeArray.push(record);
          }
        } else if (record.gameStatus === "running") {
          if (record) {
            runningArray.push(record);
          }
        }
      }
    }

    let response = {
      runningArray,
      upComingArray
    }

    res.status(200).json({
      status: "success",
      message: 'Organization game retrieved successfully.',
      data: response
    })

  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
}



exports.getDataFromGames = async function (req, res, next) {
  try {
    var id = req.params.id;

    if (req.role === "superAdmin" || req.role === "organization" || req.role === "fireFighter") {
      var groupPlay = await GROUP_PLAY.findOne({ _id: id, isDeleted: false }).populate("tdgLibraryId").populate("groupId").populate("tacticalDecisionGameId").populate("groupPlayLobbyId");
      //console.log(groupPlay);
      if (!groupPlay) {
        throw new Error("Not found")
      }
      var profile = await PROFILE.findOne({ userId: groupPlay.hostId })
      //  console.log(profile);
      var FIND = await TACTICAL_DECISION_GAME.find({ _id: groupPlay.tacticalDecisionGameId, isDeleted: false }).populate('tdgLibraryId')

      var responseOfTacticalDecisionGame = await Promise.all(FIND.map(async (record) => {
        var findImage = await TACTICAL_DECISION_GAME_IMAGE.find({ tacticalDecisionGameId: record.id })
        //console.log("findImage",findImage);
        var findAddAnswerType = await TACTICAL_DECISION_GAME_ADD_ANSWER.find({ tacticalDecisionGameId: record.id })
        //console.log("findAddAnswerType",findAddAnswerType);
        var findBestPractices = await BEST_PRACTICES_DECISION_GAME.find({ tacticalDecisionGameId: record.id })
        //console.log("findBestPractices",findBestPractices);
        var findRatingScaleText = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.find({ tacticalDecisionGameId: record.id })
        //console.log("findRatingScaleText",findRatingScaleText);
        var findTacticalFunction = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: record.id })
        // console.log("findTacticalFunction", findTacticalFunction.length);

        if (findTacticalFunction.length > 0) {
          var objectivesPromises = findTacticalFunction.map(async (o) => {
            // console.log('hello')

            var incidentPriorities = await INCIDENT_PRIORITIES.findOne(({ _id: o.incidentPrioritiesId }))
            // console.log('hello')

            // console.log("incidentPrioritiesName ======>>>>", incidentPriorities);

            var actionKeys = await ACTION_KEYS.findOne({ _id: o.actionKeysId })
            // console.log('hello')

            // console.log("actionKeyName ======>>>>", actionKeys);
            var objectivesFind = await OBJECTIVES.find({ incidentPrioritiesId: o.incidentPrioritiesId });
            var actionListFind = await ACTION_LIST.find({ actionKeysId: o.actionKeysId });

            return {
              actionKeyId: o.actionKeysId ?? '',
              actionKeyName: actionKeys ?? null,
              actionLists: actionListFind ?? [],
              incidentPrioritiesId: o.incidentPrioritiesId ?? '',
              incidentPrioritiesName: incidentPriorities ?? null,
              tacticalDecisionGameId: o.tacticalDecisionGameId ?? '',
              idType: o.idType ?? '',
              objectives: objectivesFind ?? [],
            };
          });
          var objectivesData = await Promise.all(objectivesPromises);
        }


        var obj = {
          tdgLibraryId: (record.tdgLibraryId) ? record.tdgLibraryId._id : '',
          tdgGameName: (record.tdgLibraryId.name) ? record.tdgLibraryId.name : '',
          goalObjective: (record.tdgLibraryId) ? record.tdgLibraryId.goalObjective : '',
          missionBriefing: (record.tdgLibraryId) ? record.tdgLibraryId.missionBriefing : '',
          tacticalDecisionGameId: (record._id) ? record._id : '',
          text: (record.text == null) ? '' : record.text,
          audio: (record.audio == null) ? '' : record.audio,
          image: (findImage == null) ? '' : findImage,
          addAnswerTypes: (findAddAnswerType == null) ? '' : findAddAnswerType,
          bestNames: (findBestPractices == null) ? '' : findBestPractices,
          texts: (findRatingScaleText == null) ? '' : findRatingScaleText,
          selectTargetAudience: (record.selectTargetAudience == null) ? '' : record.selectTargetAudience,
          timeLimit: (record.timeLimit == null) ? '' : record.timeLimit,
          selectAnswerType: (record.selectAnswerType == null) ? '' : record.selectAnswerType,
          selectNumberOfSliders: (record.selectNumberOfSliders == null) ? '' : record.selectNumberOfSliders,
          numeric: (record.numeric == null) ? '' : record.numeric,
          texting: (record.texting == null) ? '' : record.texting,
          publish: record?.publish ?? false,
          minimumValue: (record.minimumValue == null) ? '' : record.minimumValue,
          maximumValue: (record.maximumValue == null) ? '' : record.maximumValue,
          minimumValue1: (record.minimumValue1 == null) ? '' : record.minimumValue1,
          maximumValue1: (record.maximumValue1 == null) ? '' : record.maximumValue1,
          correctAnswer: (record.correctAnswer == null) ? '' : record.correctAnswer,
          isVoiceToText: (record.isVoiceToText == null) ? '' : record.isVoiceToText,
          selectLine: (record.selectLine == null) ? '' : record.selectLine,
          selectPosition: (record.selectPosition == null) ? '' : record.selectPosition,
          selectGoals: (record.selectGoals == null) ? '' : record.selectGoals,
          selectCategory: (record.selectCategory == null) ? '' : record.selectCategory,
          selectDecisivePointName: (record.selectDecisivePointName == null) ? '' : record.selectDecisivePointName,
          priorityType: (record.isPriorityType == null) ? '' : record.isPriorityType,
          tacticalFunctionWithObjectives: (objectivesData == null) ? [] : objectivesData,
          isDeleted: record.isDeleted,
          createdAt: record.createdAt || '',
          updatedAt: record.updatedAt || ''
        }

        return obj;
      }))
    } else {
      throw new Error("You can not access.")
    }

    var response = {
      groupPlayId: groupPlay?.id,
      userId: groupPlay?.hostId,
      hostName: profile?.profileName,
      groupId: groupPlay?.groupId.id,
      groupName: groupPlay?.groupId.name,
      tdgLibraryId: groupPlay?.tdgLibraryId?.id,
      tdgLibraryName: groupPlay?.tdgLibraryId?.name,
      // tacticalDecisionGameId : groupPlay.tacticalDecisionGameId.id,
      tacticalDecisionGameId: responseOfTacticalDecisionGame,
      tacticalDecisionGameName: groupPlay?.tacticalDecisionGameId?.text,
      playType: groupPlay?.playType,
      lobbyType: (groupPlay?.groupPlayLobbyId?.type == null) ? '' : groupPlay?.groupPlayLobbyId?.type,
      lobby: groupPlay?.groupPlayLobbyId?.file
        ? `${req.protocol}://${req.get("host")}/images/${groupPlay.groupPlayLobbyId.file}`
        : '',
    }

    res.status(200).json({
      status: "success",
      message: "get Data From Games successfully.",
      data: response
    })
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message
    })
  }
};

exports.requestToJoin = async function (req, res, next) {
  try {
    if (!req.body.groupPlayId) {
      throw new Error("groupId is required")
    } else if (!req.body.tdgLibraryId) {
      throw new Error("tdgLibraryId is required")
    } else if (!req.body.userId) {
      throw new Error("userId is required")
    } else if (!req.body.tacticalDecisionGameId) {
      throw new Error("tacticalDecisionGameId is required")
    }
    if (req.role === "superAdmin" || req.role === "organization" || req.role === "fireFighter") {

      var groupPlay = await GROUP_PLAY.findOne({ _id: req.body.groupPlayId });
      if (!groupPlay) {
        throw new Error('Please select a groupPlay.')
      }

      var playerFind = await PLAYER_REQUEST.findOne({ groupPlayId: groupPlay._id, userId: req.body.userId, isDeleted: false });
      if (playerFind) {
        throw new Error('You are already a member of this group.');
      }

      var playerRequest = await PLAYER_REQUEST.create({
        groupId: groupPlay.groupId,
        tdgLibraryId: req.body.tdgLibraryId,
        userId: req.body.userId,
        tacticalDecisionGameId: req.body.tacticalDecisionGameId,
        groupPlayId: groupPlay._id,
        playLaterTime: groupPlay.playLaterTime,
        status: "pending",
        sendBy: req.userId,
        isDeleted: false,
      })
    } else {
      throw new Error("You can not access.")
    }

    res.status(200).json({
      status: "success",
      message: "request To Join successfully.",
      data: playerRequest
    })
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message
    })
  }
};

exports.inComingRequest = async function (req, res, next) {
  try {
    let groupPlayId = req.params.id
    if (!groupPlayId) {
      throw new Error('id is required.');
    }
    console.log("req.userId" + req.userId);

    if (req.role === "superAdmin" || req.role === "organization" || req.role === "fireFighter") {
      var profile = await PROFILE.findOne({ userId: req.userId, isDeleted: false });
      console.log(profile)
      var allProfile = await PROFILE.find({ organizationId: profile.organizationId, isDeleted: false });
      var response = await Promise.all(allProfile.map(async (profile) => {
        // Initialize updatedResponse as null
        var updatedResponse = null;
        
        var playerRequest = await PLAYER_REQUEST.findOne({
            userId: profile.userId,
            status: "pending",
            groupPlayId: groupPlayId,
            isDeleted: false
        })
        
        // console.log(playerRequest, "playerRequest", playerRequest ? playerRequest.userId : null);
        if (playerRequest && playerRequest.userId) {
            let findProfile = await PROFILE.findOne({ userId: playerRequest.userId });
            if (findProfile) {
                updatedResponse = { ...playerRequest._doc, name: findProfile.profileName };
                console.log(updatedResponse, "updatedResponse");
            }
        }
        
        // Return the updatedResponse if it exists, otherwise return the original playerRequest
        return updatedResponse ? updatedResponse : playerRequest;
    }));

      var filter = response.filter((removeNull) => removeNull != null);
    } else {
      throw new Error("You can not access.");
    }
    res.status(200).json({
      status: "success",
      message: "inComingRequest successfully.",
      data: filter,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

exports.statusChangeForHost = async function (req, res, next) {
  try {
    var id = req.params.id
    if (!id) {
      throw new Error("id is required")
    }
    console.log("req.userId" + req.userId);
    if (req.role === "superAdmin" || req.role === "organization" || req.role === "fireFighter") {
      var playerRequest = await PLAYER_REQUEST.findByIdAndUpdate(id, {
        status: req.body.status
      }, { new: true })
      console.log("playerRequest", playerRequest)

    } else {
      throw new Error("You can not access.");
    }

    res.status(200).json({
      status: "success",
      message: "statusChangeForHost successfully.",
      data: playerRequest,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};



exports.singlePlayerResult = async function (req, res, next) {
  try {

    console.log("req.userId" + req.userId);
    if (req.role === "superAdmin" || req.role === "organization" || req.role === "fireFighter") {
      var answers = await TACTICAL_DECISION_GAME_LIST_ANSWER.find({ userId: req.userId }).distinct("tacticalDecisionGameId")
      var formattedAnswers = answers.map((gameId) => ({ tacticalDecisionGameId: gameId }));
      console.log(formattedAnswers.length);
      console.log(answers.length);
      var tacticalDecisionGame = await TACTICAL_DECISION_GAME.find({
        _id: { $in: formattedAnswers.map((item) => item.tacticalDecisionGameId) }, isDeleted: false
      });

      console.log("tacticalDecisionGame", tacticalDecisionGame);
    } else {
      throw new Error("You can not access.");
    }
    res.status(200).json({
      status: "success",
      message: "singlePlayerResult get successfully.",
      data: tacticalDecisionGame
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

exports.groupPlayResult = async function (req, res, next) {
  try {

    console.log("req.userId", req.userId);
    if (req.role === "superAdmin" || req.role === "organization" || req.role === "fireFighter") {
      console.log("ROLE ======", req.role);
      var answers = await TACTICAL_DECISION_GAME_LIST_ANSWER.find({ userId: req.userId })
      console.log("ANSWER ======", answers);
      var filteredAnswers = answers.filter((value) => value.groupPlayId);

      // var uniqueTacticalDecisionGameIds = []

      // filteredAnswers.forEach((answer) => {
      //   console.log("BEGIN ====>>>>", uniqueTacticalDecisionGameIds);
      //   console.log("================================================================");
      //   if (!uniqueTacticalDecisionGameIds.includes(answer.tacticalDecisionGameId)) {
      //     console.log("Ids", uniqueTacticalDecisionGameIds);
      //     console.log("================================================================");

      //     uniqueTacticalDecisionGameIds.push(answer.tacticalDecisionGameId);
      //     console.log("Ids2", uniqueTacticalDecisionGameIds);
      //     console.log("================================================================");
      //   } 
      // });
      var uniqueTacticalDecisionGameIds = [];

      filteredAnswers.forEach((answer) => {
        const idString = answer.tacticalDecisionGameId.toString();
        if (!uniqueTacticalDecisionGameIds.includes(idString)) {
          uniqueTacticalDecisionGameIds.push(idString);
        }
      });


      uniqueTacticalDecisionGameIds = Array.from(uniqueTacticalDecisionGameIds);

      var tacticalDecisionGames = [];

      for (const id of uniqueTacticalDecisionGameIds) {
        const tacticalDecisionGame = await TACTICAL_DECISION_GAME.findOne({ _id: id, isDeleted: false }).populate("tdgLibraryId");
        if (tacticalDecisionGame) {
          tacticalDecisionGames.push(tacticalDecisionGame);
        }
      }
      console.log("tacticalDecisionGame", tacticalDecisionGames);
    } else {
      throw new Error("You can not access.");
    }
    res.status(200).json({
      status: "success",
      message: "groupPlayResult get successfully.",
      data: tacticalDecisionGames
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

// exports.groupPlayResultAnalytics = async function (req, res, next) {
//   try {
//     var tacticalDecisionGameId = req.params.id;
//     if (req.role === "fireFighter") {
//       // Get all distinct players in the group
//       var allPlayersInGroup = await GROUP_PLAYER.find({}).distinct("userId");

//       // Log the distinct players in the group
//       console.log("allPlayersInGroup", allPlayersInGroup);

//       // Get game answers for the specified tactical decision game
//       var gameAnswers = await TACTICAL_DECISION_GAME_LIST_ANSWER.find({
//         tacticalDecisionGameId: tacticalDecisionGameId,
//       });

//       // Initialize counters for players who played and did not play
//       var playersWhoPlayed = 0;
//       var playersWhoDidNotPlay = 0;

//       // Iterate through game answers to count players who played
//       gameAnswers.forEach((record) => {
//         if (allPlayersInGroup.includes(record.userId)) {
//           playersWhoPlayed++;
//         }
//       });

//       // Calculate players who did not play
//       playersWhoDidNotPlay = allPlayersInGroup.length - playersWhoPlayed;

//       // Calculate percentages
//       var playedPercentage = ((playersWhoPlayed / allPlayersInGroup.length) * 100).toFixed(2);
//       var notPlayedPercentage = ((playersWhoDidNotPlay / allPlayersInGroup.length) * 100).toFixed(2);

//       var response = {
//         allPlayersInGroup: allPlayersInGroup,
//         playersWhoPlayed: playersWhoPlayed,
//         playedPercentage: playedPercentage,
//         playersWhoDidNotPlay: playersWhoDidNotPlay,
//         notPlayedPercentage: notPlayedPercentage,
//       };

//       res.status(200).json({
//         status: "success",
//         message: "groupPlayResultAnalytics get successfully.",
//         data: response,
//       });
//     } else {
//       throw new Error("You cannot access.");
//     }
//   } catch (error) {
//     res.status(400).json({
//       status: "failed",
//       message: error.message,
//     });
//   }
// };

exports.getGroupPlayToGamePlayers = async (req, res) => {
  try {
    let groupPlayId = req.params.id

    if (!groupPlayId) {
      throw new Error('please provide a groupPlay id')
    }

    let FindGroupPlay = await GROUP_PLAY.findOne({ _id: groupPlayId, isDeleted: false })

    if (!FindGroupPlay) {
      throw new Error('GroupPlay not found.')
    }

    const gamePlayers = await GROUP_PLAYER.find({ groupId: FindGroupPlay.groupId, isDeleted: false }).populate('userId')

    const response = await Promise.all(gamePlayers.map(async (gamePlayer) => {

      let playerRequest = await PLAYER_REQUEST.findOne({ groupPlayId: groupPlayId, groupId: gamePlayer.groupId, userId: gamePlayer.userId, isDeleted: false })
      let hostRequest = await HOST_REQUEST.findOne({ groupPlayId: groupPlayId, groupId: gamePlayer.groupId, userId: gamePlayer.userId, isDeleted: false })
      var profile = await PROFILE.findOne({ userId: gamePlayer.userId })

      let status;

      if (hostRequest) {
        status = hostRequest.status
      } else if (playerRequest) {
        status = playerRequest.status
      } else {
        status = "pending"
      }
      // status = FindGroupPlay.gameStatus
      const name = profile.profileName
      return { status, name };
    }));

    res.status(200).json({
      status: "success",
      message: "groupPlay Player get successfully.",
      data: response
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
}