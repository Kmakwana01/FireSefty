const TDG_LIBRARY = require("../models/tdgLibraryModel");
const DEMO = require("../models/demoModel")
const BEST_PRACTICES_TDG = require("../models/bestPracticesTdgModel");
const ORGANIZATION = require("../models/organizationModel")
const ASSIGNMENT = require("../models/assignmentModel");
const RESPONSE_TYPE = require("../models/responseTypeModel");
const INCIDENT_TYPE = require("../models/incidentTypeModel");
const TACTICAL_DECISION_GAME = require("../models/tacticalDecisionGameModel");
const { isBoolean, compareObjects } = require('../utility/date');
const mongoose = require("mongoose");
const PROFILE = require("../models/profileModel");

const allowedAudioFormats = [
  "audio/mpeg",
  "audio/wav",
  "audio/aac",
  "audio/mp3",
];

exports.createTdgLibrary = async function (req, res, next) {
  try {
    var responseTypeId = req.body.responseTypeId;
    var incidentTypeId = req.body.incidentTypeId;
    var assignmentId = req.body.assignmentId;

    if (!responseTypeId) {
      throw new Error("responseTypeId is required.");
    } else if (!incidentTypeId) {
      throw new Error("incidentTypeId is required.");
    } else if (!assignmentId) {
      throw new Error("assignmentId is required.");
    } else if (!req.body.targetAudience || req.body.targetAudience.length === 0) {
      throw new Error("target audience is required.");
    } else if (!req.body.text) {
      throw new Error("text is required.");
    } else if (!req.body.name) {
      throw new Error("name is required.");
    }

    if (!mongoose.Types.ObjectId.isValid(responseTypeId)) {
      throw new Error('Please provide a valid ObjectId for responseTypeId.');
    } else if (!mongoose.Types.ObjectId.isValid(incidentTypeId)) {
      throw new Error('Please provide a valid ObjectId for incidentTypeId.');
    } else if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      throw new Error('Please provide a valid ObjectId for assignmentId.');
    }

    console.log("ROLE : -", req.role);

    if (req.role === "superAdmin") {
      if (!req.files["image"]) {
        throw new Error("'image' file is required.");
      }
      if (!req.body.text) {
        throw new Error("text is required.");
      }

      let audioFile = null;
      let imageFile = null;

      if (req.files["audio"]) {
        audioFile = req.files["audio"][0]; // Get the first file uploaded with the name 'audio'

        if (!allowedAudioFormats.includes(audioFile.mimetype)) {
          throw new Error(
            "Invalid audio format. Allowed formats are: " +
            allowedAudioFormats.join(", ")
          );
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (audioFile.size > maxSize) {
          throw new Error("Audio file size exceeds the maximum allowed size.");
        }
      }

      if (req.files["image"]) {
        imageFile = req.files["image"][0]; // Get the first file uploaded with the name 'image'
      }

      let url = null;

      if (imageFile) {
        url =
          req.protocol +
          "://" +
          req.get("host") +
          "/" +
          "images/" +
          imageFile.filename;
      }

      // console.log(req.body.targetAudience + '========><');

      var targetAudience;

      if (typeof req.body.targetAudience === "string") {
        targetAudience = JSON.parse(req.body.targetAudience)
      } else {
        targetAudience = req.body.targetAudience
      }
      // console.log("Target audience: ", targetAudience);

      const bestNames = req.body.bestNames || [];
      var tdgLibrary = await TDG_LIBRARY.create({
        responseTypeId: responseTypeId,
        incidentTypeId: incidentTypeId,
        assignmentId: assignmentId,
        organizationId: null,
        parentId: null,
        name: req.body.name || null,
        goalObjective: req.body.goalObjective || null,
        missionBriefing: req.body.missionBriefing || null,
        text: req.body.text || null,
        audio: audioFile ? audioFile.filename : null,
        image: imageFile ? imageFile.filename : null,
        publish: req.body.publish || false,
        targetAudience: targetAudience || [],
        isDeleted: false,
        isUpdated: false
      });

      const bestPracticesArray = [];
      for (const bestName of bestNames) {
        const bestPracticesTdg = await BEST_PRACTICES_TDG.create({
          tdgLibraryId: tdgLibrary.id,
          name: bestName,
          isDeleted: false,
        });
        bestPracticesArray.push(bestPracticesTdg);
      }

      const FindTdg = await TDG_LIBRARY.findOne({ _id: tdgLibrary.id });
      //const FindBestPractices = await BEST_PRACTICES_TDG.findOne({_id : bestPracticesTdg.id})
      var response = {
        tdgLibraryId: FindTdg.id,
        responseTypeId: FindTdg.responseTypeId,
        incidentTypeId: FindTdg.incidentTypeId,
        assignmentId: FindTdg.assignmentId,
        organizationId: FindTdg.organizationId,
        parentId: FindTdg.parentId || null,
        name: FindTdg.name || null,
        goalObjective: FindTdg.goalObjective || null,
        missionBriefing: FindTdg.missionBriefing || null,
        text: FindTdg.text || null,
        audio: FindTdg.audio || null,
        image: FindTdg.image || null,
        publish: FindTdg.publish,
        targetAudience: FindTdg.targetAudience || null,
        isDeleted: FindTdg.isDeleted,
        bestPractices: bestPracticesArray,
        createdAt: FindTdg.createdAt || null,
        updatedAt: FindTdg.updatedAt || null
      };
    } else if (req.role === "organization") {

      if (!req.files["image"]) {
        throw new Error("'image' file is required.");
      }

      let audioFile = null;
      let imageFile = null;

      if (req.files["audio"]) {
        audioFile = req.files["audio"][0]; // Get the first file uploaded with the name 'audio'

        if (!allowedAudioFormats.includes(audioFile.mimetype)) {
          throw new Error(
            "Invalid audio format. Allowed formats are: " +
            allowedAudioFormats.join(", ")
          );
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (audioFile.size > maxSize) {
          throw new Error("Audio file size exceeds the maximum allowed size.");
        }
      }

      if (req.files["image"]) {
        imageFile = req.files["image"][0]; // Get the first file uploaded with the name 'image'
      }

      let url = null;

      if (imageFile) {
        url =
          req.protocol +
          "://" +
          req.get("host") +
          "/" +
          "images/" +
          imageFile.filename;
      }

      const bestNames = req.body.bestNames || [];

      var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
      console.log("organization=>", organizationFind.id);

      var assignment = await ASSIGNMENT.findOne({ _id: assignmentId, organizationId: organizationFind._id })
      console.log("assignment=>", assignment);
      if (!assignment) {
        throw new Error("Assignment not created by your organization.")
      } else if (assignment.isDeleted === true) {
        throw new Error("Assignment is already deleted")
      }
      var responseType = await RESPONSE_TYPE.findOne({ _id: responseTypeId, organizationId: organizationFind._id })
      console.log("responseType=>", responseType);
      if (!responseType) {
        throw new Error("responseType not created by your organization.")
      } else if (responseType.isDeleted === true) {
        throw new Error("responseType is already deleted")
      }
      var incidentType = await INCIDENT_TYPE.findOne({ _id: incidentTypeId, organizationId: organizationFind._id })
      console.log("incidentType=>", incidentType);
      if (!incidentType) {
        throw new Error("incidentType not created by your organization.")
      } else if (incidentType.isDeleted === true) {
        throw new Error("incidentType is already deleted")
      }
      console.log("enter--=-")

      var targetAudience;

      if (typeof req.body.targetAudience === "string") {
        targetAudience = JSON.parse(req.body.targetAudience)
      } else {
        targetAudience = req.body.targetAudience
      }
      console.log("Target audience: ", targetAudience);

      var tdgLibrary = await TDG_LIBRARY.create({
        responseTypeId: responseTypeId,
        incidentTypeId: incidentTypeId,
        assignmentId: assignmentId,
        organizationId: organizationFind.id,
        parentId: null,
        name: req.body.name || null,
        goalObjective: req.body.goalObjective || null,
        missionBriefing: req.body.missionBriefing || null,
        text: req.body.text || null,
        audio: audioFile ? audioFile.filename : null,
        image: imageFile ? imageFile.filename : null,
        publish: req.body.publish || false,
        targetAudience: targetAudience || null,
        isDeleted: false,
        isUpdated: false
      });
      const bestPracticesArray = [];

      for (const bestName of bestNames) {
        const bestPracticesTdg = await BEST_PRACTICES_TDG.create({
          tdgLibraryId: tdgLibrary.id,
          name: bestName,
          isDeleted: false,
        });
        bestPracticesArray.push(bestPracticesTdg);
      }
      const FindTdg = await TDG_LIBRARY.findOne({ _id: tdgLibrary.id });
      console.log(FindTdg);
      //const FindBestPractices = await BEST_PRACTICES_TDG.findOne({_id : bestPracticesTdg.id})
      var response = {
        tdgLibraryId: FindTdg.id,
        responseTypeId: FindTdg.responseTypeId,
        incidentTypeId: FindTdg.incidentTypeId,
        assignmentId: FindTdg.assignmentId,
        organizationId: FindTdg.organizationId,
        parentId: FindTdg.parentId,
        name: FindTdg.name || null,
        goalObjective: FindTdg.goalObjective || null,
        missionBriefing: FindTdg.missionBriefing || null,
        text: FindTdg.text || null,
        audio: FindTdg.audio || null,
        image: FindTdg.image || null,
        publish: FindTdg.publish,
        targetAudience: FindTdg.targetAudience || null,
        isDeleted: FindTdg.isDeleted,
        bestPractices: bestPracticesArray,
        createdAt: FindTdg.createdAt || null,
        updatedAt: FindTdg.updatedAt || null
      };
    } else {
      throw new Error("You can not access.");
    }

    res.status(200).json({
      status: "success",
      message: "Tdg Library created successfully.",
      data: response,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

exports.getTdgLibrary = async function (req, res, next) {
  try {
    // console.log(req.files);
    var id = req.params.id;
    console.log("ROLE: -", req.role);
    if (req.role === "superAdmin") {
      var tdgLibrary = await TDG_LIBRARY.find({ assignmentId: id, isDeleted: false });

      var response = await Promise.all(
        tdgLibrary.map(async (record) => {
          var bestPracticesTdg = await BEST_PRACTICES_TDG.find({ tdgLibraryId: record.id, isDeleted: false });
          console.log(bestPracticesTdg);
          // var url = req.protocol + "://" + req.get("host") + "/" + "images/" + record.image;
          var audioUrl;
          if (record?.audio === null || !record.audio) {
            audioUrl = null
          } else {
            audioUrl = req.protocol + "://" + req.get("host") + "/" + "images/" + record.audio;
          }

          var imageUrl;
          if (record?.image === null || !record.image) {
            imageUrl = null;
          } else {
            imageUrl = req.protocol + "://" + req.get("host") + "/" + "images/" + record.image;
          }

          var obj = {
            tdgLibraryId: record.id,
            responseTypeId: record.responseTypeId,
            incidentTypeId: record.incidentTypeId,
            assignmentId: record.assignmentId,
            organizationId: record.organizationId,
            parentId: record.parentId,
            name: record.name || null,
            goalObjective: record.goalObjective || null,
            missionBriefing: record.missionBriefing || null,
            text: record.text || null,
            audio: audioUrl || null,
            image: imageUrl || null,
            publish: record.publish,
            targetAudience: record.targetAudience,
            isDeleted: record.isDeleted,
            bestPracticesTdg: bestPracticesTdg,
            createdAt: record.createdAt || null,
            updatedAt: record.updatedAt || null,
            originalDataId: record?.originalDataId || null,
          };
          return obj;
        })
      );
    } else if (req.role === "organization") {


      var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
      console.log("organization=>", organizationFind.id);
      var assignment = await ASSIGNMENT.findOne({ _id: id, organizationId: organizationFind._id })
      console.log("assignment=>", assignment);
      if (!assignment) {
        throw new Error("Assignment not created by your organization.")
      } else if (assignment.isDeleted === true) {
        throw new Error("Assignment is already deleted")
      }

      var tdgLibrary = await TDG_LIBRARY.find({ assignmentId: id, isDeleted: false });

      var response = await Promise.all(
        tdgLibrary.map(async (record) => {



          var bestPracticesTdg = await BEST_PRACTICES_TDG.find({ tdgLibraryId: record.id, isDeleted: false });
          var url = req.protocol + "://" + req.get("host") + "/" + "images/" + record.image;
          var audioUrl;
          if (record?.audio === null || !record.audio) {
            audioUrl = null
          } else {
            audioUrl = req.protocol + "://" + req.get("host") + "/" + "images/" + record.audio;
          }

          var obj = {
            tdgLibraryId: record._id,
            responseTypeId: record.responseTypeId,
            incidentTypeId: record.incidentTypeId,
            assignmentId: record.assignmentId,
            organizationId: record.organizationId,
            parentId: record.parentId,
            name: record.name || null,
            goalObjective: record.goalObjective || null,
            missionBriefing: record.missionBriefing || null,
            text: record.text || null,
            audio: audioUrl || null,
            image: url || null,
            publish: record.publish,
            targetAudience: record.targetAudience || null,
            isDeleted: record.isDeleted,
            bestPracticesTdg: bestPracticesTdg,
            createdAt: record.createdAt || null,
            updatedAt: record.updatedAt || null,
            originalDataId: record?.originalDataId || null,
            isMatch: isBoolean(record?.isMatch) ? record.isMatch : null
          };

          if (record.originalDataId) {

            let originalTdgLibrary = await TDG_LIBRARY.findOne({ _id: record.originalDataId, isDeleted: false })

            if (originalTdgLibrary) {

              let bestPracticesTdg = await BEST_PRACTICES_TDG.find({ tdgLibraryId: originalTdgLibrary._id, isDeleted: false });
              let url = req.protocol + "://" + req.get("host") + "/" + "images/" + record.image;
              let audioUrl;
              if (originalTdgLibrary?.audio === null || !originalTdgLibrary.audio) {
                audioUrl = null
              } else {
                audioUrl = req.protocol + "://" + req.get("host") + "/" + "images/" + originalTdgLibrary.audio;
              }

              let newTdgResponse = {
                tdgLibraryId: record._id,
                responseTypeId: record.responseTypeId,
                incidentTypeId: record.incidentTypeId,
                assignmentId: record.assignmentId,
                organizationId: record.organizationId,
                parentId: record.parentId,
                name: record.name || null,
                goalObjective: record.goalObjective || null,
                missionBriefing: record.missionBriefing || null,
                text: record.text || null,
                audio: audioUrl || null,
                image: url || null,
                publish: record.publish,
                targetAudience: record.targetAudience || null,
                isDeleted: record.isDeleted,
                bestPracticesTdg: bestPracticesTdg,
                createdAt: record.createdAt || null,
                updatedAt: record.updatedAt || null,
                originalDataId: record?.originalDataId || null,
              };

              const keysToIgnore = ["_id", "responseTypeId", "incidentTypeId", "assignmentId", "organizationId", "originalDataId", "createdAt", "updatedAt", "isUpdated", "tdgLibraryId"];

              console.log(obj, 'record')
              console.log(originalTdgLibrary, 'originalTdgLibrary')

              const areEqual = await compareObjects(newTdgResponse, obj, keysToIgnore);

              let isMatch = areEqual ? true : false;
              console.log(isMatch, 'isMatch', record.isUpdated)

              if (isBoolean(isMatch) && record.isUpdated === true) {
                record.isMatch = isMatch
              } else {
                record.isMatch = true
              }
            }

          }

          obj.isMatch = record.isMatch
          return obj;
        })
      );
    } else if (req.role === "fireFighter") {
      let findProfile = await PROFILE.findOne({ userId : req.userId })
      var tdgLibrary = await TDG_LIBRARY.find({ assignmentId: id, isDeleted: false, publish: true , organizationId : findProfile.organizationId });

      var response = await Promise.all(
        tdgLibrary.map(async (record) => {
          var bestPracticesTdg = await BEST_PRACTICES_TDG.find({ tdgLibraryId: record.id, isDeleted: false });
          var url = req.protocol + "://" + req.get("host") + "/" + "images/" + record.image;
          var audioUrl;
          if (record?.audio === null || !record.audio) {
            audioUrl = null
          } else {
            audioUrl = req.protocol + "://" + req.get("host") + "/" + "images/" + record.audio;
          }

          var obj = {
            tdgLibraryId: record.id,
            responseTypeId: record.responseTypeId,
            incidentTypeId: record.incidentTypeId,
            assignmentId: record.assignmentId,
            organizationId: record.organizationId,
            parentId: record.parentId,
            name: record.name || null,
            goalObjective: record.goalObjective || null,
            missionBriefing: record.missionBriefing || null,
            text: record.text || null,
            audio: audioUrl || null,
            image: url || null,
            publish: record.publish,
            targetAudience: record.targetAudience || null,
            isDeleted: record.isDeleted,
            bestPracticesTdg: bestPracticesTdg,
            createdAt: record.createdAt || null,
            updatedAt: record.updatedAt || null
          };
          return obj;
        })
      );
    } else {
      throw new Error("You can not access.");
    }

    res.status(200).json({
      status: "success",
      message: "Tdg Library get successfully.",
      data: response
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

exports.updateTdgLibrary = async function (req, res, next) {
  try {
    // console.log(req.body, '----', req.body);
    var id = req.params.id;
    var responseTypeId = req.body.responseTypeId;
    var incidentTypeId = req.body.incidentTypeId;
    var assignmentId = req.body.assignmentId;
    var targetAudience = req.body.targetAudience;



    if (!responseTypeId) {
      throw new Error("responseTypeId is required.");
    } else if (!incidentTypeId) {
      throw new Error("incidentTypeId is required.");
    } else if (!assignmentId) {
      throw new Error("assignmentId is required.");
    } else if (!targetAudience) {
      throw new Error("target audience is required.");
    }

    if (!mongoose.Types.ObjectId.isValid(responseTypeId)) {
      throw new Error('Please provide a valid ObjectId for responseTypeId.');
    } else if (!mongoose.Types.ObjectId.isValid(incidentTypeId)) {
      throw new Error('Please provide a valid ObjectId for incidentTypeId.');
    } else if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      throw new Error('Please provide a valid ObjectId for assignmentId.');
    }

    if (req.role === "superAdmin") {
      console.log("ROLE : -", req.role);
      console.log('enter----');


      // Check if audio and image files are provided in the request
      const audioFile = req.files && req.files["audio"] ? req.files["audio"][0] : null;
      const imageFile = req.files && req.files["image"] ? req.files["image"][0] : null;


      // console.log(audioFile + "%%%%%%%%%%" + imageFile )

      const existingTdgLibrary = await TDG_LIBRARY.findById(id);

      var targetAudience;

      console.log(typeof req.body.targetAudience, req.body.targetAudience, "targetAudience---->");
      if (typeof req.body.targetAudience == "string") {
        targetAudience = JSON.parse(req.body.targetAudience)
      } else {
        targetAudience = req.body.targetAudience
      }
      console.log(typeof targetAudience, targetAudience, "targetAudience---->");

      var tdgLibraryData = {
        responseTypeId: responseTypeId,
        incidentTypeId: incidentTypeId,
        assignmentId: assignmentId,
        name: req.body.name,
        goalObjective: req.body.goalObjective,
        missionBriefing: req.body.missionBriefing,
        text: req.body.text,
        publish: req.body?.publish || existingTdgLibrary?.publish,
        targetAudience: targetAudience || [],
        isDeleted: false,
      };


      // Validate and process audio file if provided
      let audio = null;
      if (audioFile) {
        if (!allowedAudioFormats.includes(audioFile.mimetype)) {
          throw new Error(
            "Invalid audio format. Allowed formats are: " +
            allowedAudioFormats.join(", ")
          );
        }
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (audioFile.size > maxSize) {
          throw new Error("Audio file size exceeds the maximum allowed size.");
        }
        const url1 = audioFile ? req.protocol + "://" + req.get("host") + "/" + "images/" + audioFile.filename : null;
        audio = audioFile.filename;
        tdgLibraryData.audio = audio;
      } else if (req.body.audio !== 'null') {
        tdgLibraryData.audio = existingTdgLibrary.audio;
      } else {
        tdgLibraryData.audio = null;
      }

      let image = null;
      if (imageFile) {
        const url =
          req.protocol +
          "://" +
          req.get("host") +
          "/" +
          "images/" +
          imageFile.filename;
        image = imageFile.filename;
        tdgLibraryData.image = image;
      } else if (req.body.image != 'null') {
        tdgLibraryData.image = existingTdgLibrary.image
      } else {
        tdgLibraryData.image = null;
      }





      // if (imageFile === null) {
      //   tdgLibraryData.image = null;
      // } else if (image) {
      //   tdgLibraryData.image = image
      // } else {
      //   tdgLibraryData.image = existingTdgLibrary.image
      // }
      // console.log(req.body.audio + 'ok', + audio);

      // if (audioFile === null) {
      //   tdgLibraryData.audio = null;
      // } else if(audio) {
      //     tdgLibraryData.audio = audio;
      // }else{
      //   tdgLibraryData.audio = existingTdgLibrary.audio;
      // }




      // if (audio) {
      //   tdgLibraryData.audio = audio;
      // } else if(audio === null) {
      //   tdgLibraryData.audio = null
      // }
      //   else if (image) {
      //   tdgLibraryData.image = image;
      // }  else{
      //   tdgLibraryData.audio = existingTdgLibrary.audio;
      //   tdgLibraryData.image = existingTdgLibrary.image;
      // }
      // Update the TDG Library record
      // console.log(id);
      var tdgLibrary = await TDG_LIBRARY.findByIdAndUpdate(id, tdgLibraryData, { new: true });
      // console.log('tdglibrary-----' + tdgLibrary);

      var bestPractices = await BEST_PRACTICES_TDG.deleteMany({ tdgLibraryId: id })
      const bestNames = req.body.bestNames || [];
      const bestPracticesArray = [];
      for (const bestName of bestNames) {
        const bestPracticesTdg = await BEST_PRACTICES_TDG.create({
          tdgLibraryId: tdgLibrary.id,
          name: bestName,
          isDeleted: false,
        });
        bestPracticesArray.push(bestPracticesTdg);
      }


      const FindTdg = await TDG_LIBRARY.findOne({ _id: tdgLibrary.id });

      //const FindBestPractices = await BEST_PRACTICES_TDG.findOne({_id : bestPracticesTdg.id})
      var response = {
        tdgLibraryId: FindTdg.id,
        responseTypeId: FindTdg.responseTypeId,
        incidentTypeId: FindTdg.incidentTypeId,
        assignmentId: FindTdg.assignmentId,
        organizationId: FindTdg.organizationId,
        parentId: FindTdg.parentId,
        name: FindTdg.name,
        goalObjective: FindTdg.goalObjective,
        missionBriefing: FindTdg.missionBriefing,
        text: FindTdg.text,
        audio: FindTdg.audio,
        image: FindTdg.image,
        publish: FindTdg.publish,
        targetAudience: FindTdg.targetAudience,
        isDeleted: FindTdg.isDeleted,
        bestPractices: bestPracticesArray,
        createdAt: FindTdg.createdAt,
        updatedAt: FindTdg.updatedAt
      };

      await TDG_LIBRARY.updateMany(
        { originalDataId: id },
        { $set: { isUpdated: true } }
      );
    } else if (req.role === "organization") {
      // Check if audio and image files are provided in the request
      const audioFile = req.files && req.files["audio"] ? req.files["audio"][0] : null;
      const imageFile = req.files && req.files["image"] ? req.files["image"][0] : null;

      // console.log("url1", url1);

      // Validate and process audio file if provided
      // let audio = null;
      // if (audioFile) {
      //   if (!allowedAudioFormats.includes(audioFile.mimetype)) {
      //     throw new Error(
      //       "Invalid audio format. Allowed formats are: " +
      //       allowedAudioFormats.join(", ")
      //     );
      //   }
      //   const maxSize = 10 * 1024 * 1024; // 10MB
      //   if (audioFile.size > maxSize) {
      //     throw new Error("Audio file size exceeds the maximum allowed size.");
      //   }
      //   audio = audioFile.filename;
      // }

      // // Process image file if provided
      // let image = null;
      // if (imageFile) {
      //   const url =
      //     req.protocol +
      //     "://" +
      //     req.get("host") +
      //     "/" +
      //     "images/" +
      //     imageFile.filename;
      //   image = url;
      // }

      var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
      // console.log("organization=>", organizationFind.id);
      var tdg = await TDG_LIBRARY.findOne({ _id: id, organizationId: organizationFind._id })
      // console.log("assignment=>", tdg);
      if (!tdg) {
        throw new Error("TDG not created by your organization.")
      } else if (tdg.isDeleted === true) {
        throw new Error("Tdg is already deleted")
      }

      const existingTdgLibrary = await TDG_LIBRARY.findById(id);
      // if (audio && image) {
      //   throw new Error("Either 'audio' or 'image' file is required, but not both.");
      // }
      // Update the TDG Library record with the provided or existing data
      var targetAudience;
      console.log('enter----', req.role, req.body.targetAudience)
      if (typeof req.body.targetAudience === "string") {
        targetAudience = JSON.parse(req.body.targetAudience);
      } else {
        targetAudience = req.body.targetAudience;
      }
      console.log('enter----', req.role, req.body.targetAudience)


      var tdgLibraryData = {
        responseTypeId: responseTypeId,
        incidentTypeId: incidentTypeId,
        assignmentId: assignmentId,
        name: req.body.name,
        goalObjective: req.body.goalObjective,
        missionBriefing: req.body.missionBriefing,
        text: req.body.text,
        publish: req.body?.publish || existingTdgLibrary?.publish,
        targetAudience: targetAudience,
        isDeleted: false,
      };

      // Update audio and image fields based on provided files
      let audio = null;
      if (audioFile) {
        if (!allowedAudioFormats.includes(audioFile.mimetype)) {
          throw new Error(
            "Invalid audio format. Allowed formats are: " +
            allowedAudioFormats.join(", ")
          );
        }
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (audioFile.size > maxSize) {
          throw new Error("Audio file size exceeds the maximum allowed size.");
        }
        const url1 = audioFile ? req.protocol + "://" + req.get("host") + "/" + "images/" + audioFile.filename : null;
        audio = audioFile.filename;
        tdgLibraryData.audio = audio;
      } else if (req.body.audio !== 'null') {
        tdgLibraryData.audio = existingTdgLibrary.audio;
      } else {
        tdgLibraryData.audio = null;
      }

      let image = null;
      if (imageFile) {
        const url =
          req.protocol +
          "://" +
          req.get("host") +
          "/" +
          "images/" +
          imageFile.filename;
        image = imageFile.filename;
        tdgLibraryData.image = image;
      } else if (req.body.image != 'null') {
        tdgLibraryData.image = existingTdgLibrary.image
      } else {
        tdgLibraryData.image = null;
      }

      // Update the TDG Library record
      var tdgLibrary = await TDG_LIBRARY.findByIdAndUpdate(id, tdgLibraryData);

      var bestPractices = await BEST_PRACTICES_TDG.deleteMany({ tdgLibraryId: id })
      const bestNames = req.body.bestNames || [];
      const bestPracticesArray = [];
      for (const bestName of bestNames) {
        const bestPracticesTdg = await BEST_PRACTICES_TDG.create({
          tdgLibraryId: tdgLibrary.id,
          name: bestName,
          isDeleted: false,
        });
        bestPracticesArray.push(bestPracticesTdg);
      }
      const FindTdg = await TDG_LIBRARY.findOne({ _id: tdgLibrary.id });
      //const FindBestPractices = await BEST_PRACTICES_TDG.findOne({_id : bestPracticesTdg.id})
      var response = {
        tdgLibraryId: FindTdg.id,
        responseTypeId: FindTdg.responseTypeId,
        incidentTypeId: FindTdg.incidentTypeId,
        assignmentId: FindTdg.assignmentId,
        organizationId: FindTdg.organizationId,
        parentId: FindTdg.parentId,
        name: FindTdg.name,
        goalObjective: FindTdg.goalObjective,
        missionBriefing: FindTdg.missionBriefing,
        text: FindTdg.text,
        audio: FindTdg.audio,
        image: FindTdg.image,
        publish: FindTdg.publish,
        targetAudience: FindTdg.targetAudience,
        isDeleted: FindTdg.isDeleted,
        bestPractices: bestPracticesArray,
        createdAt: FindTdg.createdAt,
        updatedAt: FindTdg.updatedAt
      };
    } else {
      throw new Error("You can not access.");
    }
    res.status(200).json({
      status: 'success',
      message: 'Tdg Library update successfully.',
      data: response
    })
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: error.message
    })
  }
};

exports.deleteTdgLibrary = async function (req, res, next) {
  try {
    var id = req.params.id;

    console.log("ROLE : -", req.role);
    if (req.role === "superAdmin") {
      var tdg = await TDG_LIBRARY.findOne({ _id: id, isDeleted: false })
      console.log("assignment=>", tdg);
      if (!tdg) {
        throw new Error("TDG not found.")
      } else if (tdg.isDeleted === true) {
        throw new Error("Tdg is already deleted")
      }

      var tdgLibrary = await TDG_LIBRARY.findByIdAndUpdate(id, {
        isDeleted: true,
      }, { new: true });
      var tacticalDecisionGame = await TACTICAL_DECISION_GAME.updateMany({ tdgLibraryId: id }, { isDeleted: true }, { new: true })

      var bestPractices = await BEST_PRACTICES_TDG.updateMany({ tdgLibraryId: id }, { isDeleted: true }, { new: true });


    } else if (req.role === "organization") {


      var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
      console.log("organization=>", organizationFind.id);
      var tdg = await TDG_LIBRARY.findOne({ _id: id, organizationId: organizationFind._id })
      console.log("assignment=>", tdg);
      if (!tdg) {
        throw new Error("TDG not created by your organization.")
      } else if (tdg.isDeleted === true) {
        throw new Error("Tdg is already deleted")
      }

      var tdgLibrary = await TDG_LIBRARY.findByIdAndUpdate(id, {
        isDeleted: true,
      }, { new: true });

      var bestPractices = await BEST_PRACTICES_TDG.updateMany({ tdgLibraryId: id }, { isDeleted: true });

    } else {
      throw new Error("You can not access.");
    }
    res.status(200).json({
      status: 'success',
      message: 'Tdg Library deleted successfully.',
      //data : response
    })
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: error.message
    })
  }
};

exports.form = async function (req, res, next) {
  try {

    if (req.file) {
      var imgPath = req.file.filename;
      var url = req.protocol + "://" + req.get("host") + "/" + "images/" + imgPath;
    }

    var createDemo = await DEMO.create({
      image: url || null,
      name: req.body.name,
      isDeleted: false
    })

    res.status(200).json({
      status: "Success",
      message: "Created successfully",
      data: createDemo
    });
  } catch (error) {
    res.status(200).json({
      status: "failed",
      message: error.message
    });
  }
}

exports.updateTdgPublish = async function (req, res, next) {
  try {
    if (!req.params.id) {
      throw new Error("id is required.")
    }
    var find = await TDG_LIBRARY.findById(req.params.id)
    var tdg = await TDG_LIBRARY.findByIdAndUpdate(req.params.id, {
      publish: req.body.publish
    }, { new: true });

    let message;
    if (tdg.publish === true) {
      message = 'TdgLibrary published successfully'
    } else if (tdg.publish === false) {
      message = 'TdgLibrary unpublished successfully'
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