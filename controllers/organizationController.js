const ORGANIZATION = require('../models/organizationModel');
const USER = require('../models/userModel');
const PROFILE = require('../models/profileModel');
var bcrypt = require("bcrypt");
const TACTICAL_DECISION_GAME = require("../models/tacticalDecisionGameModel");
const TACTICAL_DECISION_GAME_IMAGE = require("../models/tacticalDecisionGameImageModel");
const TACTICAL_DECISION_GAME_ADD_ANSWER = require("../models/tacticalDecisionGameAddAnswerModel");
const BEST_PRACTICES_DECISION_GAME = require("../models/bestPracticesDecisionGameModel")
const TACTICAL_DECISION_GAME_RATING_SCALE_TEXT = require("../models/tacticalDecisionGameRatingScaleTextModel");
const TDG_LIBRARY = require("../models/tdgLibraryModel");
const BEST_PRACTICES_TDG = require("../models/bestPracticesTdgModel");
var fs = require('fs');
var util = require('util');
const path = require('path');
const ASSIGNMENT = require('../models/assignmentModel')
const INCIDENT_TYPE = require('../models/incidentTypeModel')
const RESPONSE_TYPE = require('../models/responseTypeModel');
const ACTION_KEYS = require('../models/actionKeysModel');
const INCIDENT_PRIORITIES = require('../models/incidentPrioritiesModel');
const OBJECTIVES = require('../models/objectivesModel');
const THINKING_PLANNING = require('../models/thinkingPlanningModel')
const THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST = require('../models/thinkingPlaningSelectAnswerTypeListModel');
const THINKING_PLANNING_TEXT = require('../models/thinkingPlanningTextModel');
const ACTION_LIST = require('../models/actionListModel');
const APPARATUS = require('../models/apparatusModel')
const SCENARIO = require('../models/scenarioModel')
const SCENARIO_ASSIGNMENT = require('../models/scenarioAssignmentsModel')
const SCENARIO_ASSIGNMENT_IMAGES = require('../models/scenarioAssignmentImagesModel')
const SCENARIO_ASSIGNMENT_BEST_PRACTICES = require('../models/scenarioAssignmentBestPracticesModel');
const FUNCTION_KEY_ANSWER = require('../models/appFunctionKeyAnswerModel');


function isImage(mimeType) {
    return mimeType.startsWith('image/');
}
exports.createOrganization = async function (req, res, next) {
    try {
        if (req.role === "superAdmin") {
            // Input validation
            if (!req.body.name || !req.body.email || !req.body.station || !req.body.contactNumber || !req.body.subscriptionDate || !req.body.shift || !req.body.rank || !req.body.password) {
                throw new Error("All fields must be provided.");
            }

            // Check if email already exists
            const existingUser = await USER.findOne({ email: req.body.email });
            const existingOrganization = await ORGANIZATION.findOne({ email: req.body.email });
            if (existingUser || existingOrganization) {
                throw new Error("Email already exists.");
            }

            // Process image upload
            let imagePath = '';
            if (req.file) {
                if (!isImage(req.file.mimetype)) {
                    throw new Error("Only image files are allowed.");
                }
                imagePath = req.file.filename;
            }

            // Calculate subscription and expire dates
            const subscriptionDate = new Date(req.body.subscriptionDate);
            const expireDate = new Date(subscriptionDate);
            expireDate.setMonth(expireDate.getMonth() + 2);
            const subscriptionDateTimestamp = subscriptionDate.getTime();
            const expireDateTimestamp = expireDate.getTime();
            req.body.password = await bcrypt.hash(req.body.password, 10);

            // Create new user
            const user = await USER.create({
                email: req.body.email,
                userName: "",
                password: req.body.password,
                isEmailVerified: "",
                deletedAt: "",
                isActive: true,
                isDeleted: false,
                role: "organization",
            });

            // Create new organization
            const organization = await ORGANIZATION.create({
                userId: user.id,
                name: req.body.name,
                email: req.body.email,
                station: req.body.station,
                logo: imagePath,
                contactName: req.body.contactName,
                contactNumber: req.body.contactNumber,
                subscriptionDate: subscriptionDateTimestamp,
                expireDate: expireDateTimestamp,
                status: getStatus(subscriptionDate, expireDate), // Calculate status based on subscription and expire dates
                isDeleted: false,
            });

            // Create new profile
            const profile = await PROFILE.create({
                profileName: organization.contactName,
                rank: req.body.rank || '',
                shift: req.body.shift || '',
                profileImage: imagePath,
                status: getStatus(subscriptionDate, expireDate), // Calculate status based on subscription and expire dates
                station: organization.station,
                userId: organization.userId,
                organizationId: organization.id,
                isDeleted: false,
            });

            // Prepare response data
            const response = {
                userId: user.id,
                organizationId: organization.id,
                name: organization.name,
                rank: profile.rank,
                shift: profile.shift,
                email: organization.email,
                station: organization.station,
                logo: organization.logo,
                status: organization.status,
                contactName: organization.contactName,
                contactNumber: organization.contactNumber,
                subscriptionDate: organization.subscriptionDate,
                expireDate: organization.expireDate,
                profileName: profile.profileName,
                profileImage: profile.profileImage,
            };

            // Send success response
            res.status(200).json({
                status: 'success',
                message: 'Your organization has been created',
                data: response,
            });
        } else {
            throw new Error('You cannot access.');
        }
    } catch (error) {
        res.status(400).json({
            status: "failed",
            message: error.message,
        });
    }
};

// Function to calculate status based on subscription and expire dates
function getStatus(subscriptionDate, expireDate) {
    const today = new Date();
    if (expireDate <= today) {
        return 'red';
    } else if (expireDate.getTime() - today.getTime() <= 30 * 24 * 60 * 60 * 1000) { // 30 days before expiration
        return 'yellow';
    } else {
        return 'green';
    }
}


exports.getOrganization = async function (req, res, next) {
    try {
        if (req.role === "superAdmin") {
            const organizations = await ORGANIZATION.find({ isDeleted: false }).populate("userId");
            console.log("organizations")
            var response = organizations.map((record) => {
                var url;
                if (record.logo === null || record.logo === '') {
                    url = '';
                } else {
                    url = req.protocol + "://" + req.get("host") + "/" + "images/" + record.logo;
                }

                // Determine status based on subscription and expire dates
                let status = null;
                var exDate = formatDate(record.expireDate);
                var subDate = formatDate(record.subscriptionDate)
                // console.log('record.expireDate :>> ', exDate);
                // console.log('record.subscriptionDate :>> ', subDate);

                var subParts = subDate.split("/");
                // console.log("subParts :>> ", subParts);
                var formattedSubDate = `${subParts[1]}/${subParts[0]}/${subParts[2]}`;
                // console.log('formattedSubDate :>> ', formattedSubDate);

                var exParts = exDate.split("/");
                // console.log("exParts :>> ", exParts);
                var formattedExDate = `${exParts[1]}/${exParts[0]}/${exParts[2]}`;
                // console.log('formattedDate :>> ', formattedExDate);

                const today = new Date();
                const expireDate = new Date(formattedExDate);
                console.log("expireDate: ", expireDate);
                const subscriptionDate = new Date(formattedSubDate);
                console.log("sub", subscriptionDate)
                const daysUntilExpire = Math.floor((expireDate - today) / (1000 * 60 * 60 * 24));
                console.log("daysexpire", daysUntilExpire)
                if (daysUntilExpire < 0) {
                    status = "red";
                } else if (daysUntilExpire <= 30 && daysUntilExpire >= 0) {
                    status = "yellow";
                } else {
                    status = "green";
                }
                console.log("status", status);

                var obj = {
                    userId: record.userId,
                    organizationId: record.id,
                    name: record.name,
                    email: record.email,
                    station: record.station,
                    logo: url,
                    status: status,
                    contactName: record.contactName,
                    contactNumber: record.contactNumber,
                    subscriptionDate: formatDate(record.subscriptionDate),
                    expireDate: formatDate(record.expireDate),
                    isDeleted: record.isDeleted
                }
                return obj;
            });
        } else {
            throw new Error('You cannot access.');
        }
        res.status(200).json({
            status: "success",
            message: "Organization get successfully.",
            data: response
        });
    } catch (error) {
        res.status(400).json({
            status: "failed",
            message: error.message
        });
    }
};


exports.updateOrganization = async function (req, res, next) {
    try {
        console.log("0000000000");
        const subscriptionDate = new Date(req.body.subscriptionDate);
        const expireDate = new Date(subscriptionDate);
        expireDate.setMonth(expireDate.getMonth() + 2);
        const subscriptionDateTimestamp = subscriptionDate.getTime();
        const expireDateTimestamp = expireDate.getTime();

        if (req.role === "superAdmin") {

            id = req.params.id
            const organizationFind = await ORGANIZATION.findOne({ _id: id })
            const userFind = await USER.findOne({ _id : organizationFind.userId })
            // console.log(organizationFind);
            if (!organizationFind) {
                throw new Error("Organization not found.")
            }
            const isOrgEmail = await ORGANIZATION.findOne({ email: req.body.email , _id : { $ne : organizationFind._id } })
            const isUserEmail = await USER.findOne({ email: req.body.email,  _id : { $ne : userFind._id } })

            console.log(isOrgEmail ,isUserEmail)
            console.log(organizationFind ,userFind)
            if(isOrgEmail){
                throw new Error('Email already exists.')
            }

            if(isUserEmail){
                throw new Error('Email already exists.')
            }
            
            // if (req.body.email) {
            //     const isEmail = await ORGANIZATION.find({ email: req.body.email })
            //     if(isEmail.length > 0) {
            //         // if ((isEmail.email === req.body.email) && isEmail.email) {
            //         //     throw new Error("Email already exists.");
            //         // }
            //     }
            // }

            if (req.file && req.file.filename) {

                var image;
                if (req.file === null || req.file === '') {
                    image = '';
                } else {
                    image = req.file.filename
                }



                // var url = req.protocol + "://" + req.get("host") + "/" + "images/" + req.file.filename;
                var organization = await ORGANIZATION.findByIdAndUpdate(id, {
                    name: req.body.name,
                    email: req.body.email,
                    station: req.body.station,
                    logo: image,
                    contactName: req.body.contactName,
                    contactNumber: req.body.contactNumber,
                    subscriptionDate: subscriptionDateTimestamp,
                    expireDate: expireDateTimestamp,
                    status: true,
                    isDeleted: false,
                }, { new: true })

                var user = await USER.findByIdAndUpdate(organizationFind.userId, {
                    email: req.body.email,
                }, { new: true })

                var user = await PROFILE.findOneAndUpdate({ userId: organizationFind.userId }, {
                    profileImage: image,
                }, { new: true })

            } else {

                var organization = await ORGANIZATION.findByIdAndUpdate(id, {
                    name: req.body.name,
                    email: req.body.email,
                    station: req.body.station,
                    contactName: req.body.contactName,
                    contactNumber: req.body.contactNumber,
                    subscriptionDate: subscriptionDateTimestamp,
                    expireDate: expireDateTimestamp,
                    status: true,
                    isDeleted: false,
                }, { new: true })

                var user = await USER.findByIdAndUpdate(organizationFind.userId, {
                    email: req.body.email,
                }, { new: true })
            }

            if (!req.body.contactNumber || !/^\d{10}$/.test(req.body.contactNumber)) {
                throw new Error("Contact number must be a 10-digit numeric value.");
            }

            var find = await ORGANIZATION.findOne({ _id: id })
            console.log(find);

            var response = {
                organizationId: find.id,
                name: find.name,
                email: user.email,
                station: find.station,
                contactName: find.contactName,
                contactNumber: find.contactNumber,
                subscriptionDate: find.subscriptionDate,
                expireDate: find.expireDate,
                logo: find.logo,
                status: find.status
            }
        } else {
            throw new Error('You can not access.')
        }
        res.status(200).json({
            status: "success",
            message: "Organization update successfully.",
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: "failed",
            message: error.message
        })
    }
};

exports.deleteOrganization = async function (req, res, next) {
    try {
        if (req.role === "superAdmin") {
            var id = req.params.id
            var organizationFind = await ORGANIZATION.findOne({ _id: id })
            console.log(organizationFind);
            if (!organizationFind) {
                throw new Error("Organization not found.")
            }

            //----------------------------------------------------------------tactical Decision------ START ----------------------------------------------------------------

            var tacticalDecisionGame = await TACTICAL_DECISION_GAME.find({ organizationId: id })
            console.log("tacticalDecisionGame =>", tacticalDecisionGame);

            var responseTacticalDecisionGame = await Promise.all(tacticalDecisionGame.map(async (record) => {
                var bestPracticesDecisionGame = await BEST_PRACTICES_DECISION_GAME.deleteMany({ tacticalDecisionGameId: record.id })
                var tacticalDecisionGameAddAnswerModel = await TACTICAL_DECISION_GAME_ADD_ANSWER.deleteMany({ tacticalDecisionGameId: record.id })
                var functionKeyAnswer = await FUNCTION_KEY_ANSWER.deleteMany({ tacticalDecisionGameId: record.id })
                var tacticalDecisionGameImageModel = await TACTICAL_DECISION_GAME_IMAGE.find({ tacticalDecisionGameId: record.id })


                const deleteImagePromises = tacticalDecisionGameImageModel.map(async (imageModel) => {


                    console.log("IMAGESS =>>>>>>>>>", imageModel.image);
                    const url = imageModel.image;
                    console.log("url =>", url);
                    const filePath = url.substring(url.lastIndexOf("/") + 1);
                    console.log("filePath =>", filePath);
                    const directoryPath = path.join("public", "images");
                    console.log("directoryPath =>", directoryPath);
                    const completeFilePath = path.join(directoryPath, filePath);
                    console.log("completeFilePath =>", completeFilePath);

                    fs.unlink(completeFilePath, (err) => {
                        if (err) {
                            console.error("Error deleting file:", err);
                        } else {
                            console.log("File deleted successfully:", completeFilePath);
                        }
                    });
                });
                console.log("delete Image of TacticalDecisionGame =>");

                await Promise.all(deleteImagePromises);

                var tacticalDecisionGameRatingScaleText = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.deleteMany({ tacticalDecisionGameId: record.id })
                if (record.audio != null) {
                    const url = record.audio;
                    console.log("url =>", url);
                    const filePath = url.substring(url.lastIndexOf("/") + 1);
                    console.log("filePath =>", filePath);
                    const directoryPath = path.join("public", "images");
                    console.log("directoryPath =>", directoryPath);
                    const completeFilePath = path.join(directoryPath, filePath);
                    console.log("completeFilePath =>", completeFilePath);

                    fs.unlink(completeFilePath, (err) => {
                        if (err) {
                            console.error("Error deleting file:", err);
                        } else {
                            console.log("File deleted successfully:", completeFilePath);
                        }
                    });
                    console.log("tacticalDecisionGame audio deleted  =>");
                }
                var tacticalDecisionGameDelete = await TACTICAL_DECISION_GAME.findOneAndDelete({ _id: record.id })

                var obj = {
                    bestPracticesDecisionGame: bestPracticesDecisionGame,
                    tacticalDecisionGameAddAnswerModel: tacticalDecisionGameAddAnswerModel,
                    tacticalDecisionGameImageModel: tacticalDecisionGameImageModel,
                    tacticalDecisionGameRatingScaleText: tacticalDecisionGameRatingScaleText,
                    tacticalDecisionGame: tacticalDecisionGame
                }
                return obj;
            }))

            //----------------------------------------------------------------tactical Decision PART------ END ----------------------------------------------------------------

            //----------------------------------------------------------------TDG------ START ----------------------------------------------------------------
            var tdgLibrary = await TDG_LIBRARY.find({ organizationId: id })
            var responseTdgLibrary = await Promise.all(tdgLibrary.map(async (record) => {

                console.log("IMAGESS =>>>>>>>>>", record.image);
                const url = record.image;
                console.log("url", url);
                const filePath = url.substring(url.lastIndexOf("/") + 1);
                console.log("filePath", filePath);
                const directoryPath = path.join("public", "images");
                console.log("directoryPath", directoryPath);
                const completeFilePath = path.join(directoryPath, filePath);
                console.log("completeFilePath", completeFilePath);

                fs.unlink(completeFilePath, (err) => {
                    if (err) {
                        console.error("Error deleting file:", err);
                    } else {
                        console.log("File deleted successfully:", completeFilePath);
                    }
                });
                console.log("delete Complete IMAGE");

                if (record.audio) {
                    console.log("audio ");
                    const audioUrl = record.audio;
                    console.log("audioUrl", audioUrl);
                    const audioFilePath = audioUrl.substring(audioUrl.lastIndexOf("/") + 1);
                    console.log("audioFilePath", audioFilePath);
                    const audioDirectoryPath = path.join("public", "audio");
                    console.log("audioDirectoryPath", audioDirectoryPath);
                    const completeAudioFilePath = path.join(audioDirectoryPath, audioFilePath);
                    console.log("completeAudioFilePath", completeAudioFilePath);
                    fs.unlink(completeAudioFilePath, (err) => {
                        if (err) {
                            console.error("Error deleting audio file:", err);
                        } else {
                            console.log("Audio file deleted successfully:", completeAudioFilePath);
                        }
                    });
                }
                console.log("delete Complete AUDIO");

                var bestPracticesTdg = await BEST_PRACTICES_TDG.deleteMany({ tdgLibraryId: record.id })
                var deleteTdg = await TDG_LIBRARY.findOneAndDelete({ _id: record.id })

                var obj = {
                    bestPracticesTdg: bestPracticesTdg
                }
                return obj;
            }))
            //----------------------------------------------------------------TDG------ END ----------------------------------------------------------------



            //----------------------------------------------------------------thinking planning------ START --------------------------------------------------------------
            var thinkingPlanning = await THINKING_PLANNING.find({ organizationId: id })
            console.log("thinkingPlanning =>", thinkingPlanning,id);

            var responseThinkingPlanning = await Promise.all(thinkingPlanning.map(async (record) => {
                console.log('/')
                var thinkingPlaningSelectAnswerTypeList = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.deleteMany({ thinkingPlanningId: record?.id })
                console.log("thinkingPlaningSelectAnswerTypeList = >>>>>>>>>>", thinkingPlaningSelectAnswerTypeList);
                var thinkingPlanningText = await THINKING_PLANNING_TEXT.deleteMany({ thinkingPlanningId: record.id })
                console.log("thinkingPlanningText = >>>>>>>>>>", thinkingPlanningText);

                var thinkingPlanning = await THINKING_PLANNING.findOneAndDelete({ _id: record.id })
                var obj = {
                    thinkingPlaningSelectAnswerTypeList: thinkingPlaningSelectAnswerTypeList,
                    thinkingPlanningText: thinkingPlanningText,
                    thinkingPlanning: thinkingPlanning
                }
                return obj;
            }))
            //----------------------------------------------------------------thinking planning------ END ----------------------------------------------------------------
            var incidentPriorities = await INCIDENT_PRIORITIES.deleteMany({ organizationId: id })
            var objectives = await OBJECTIVES.deleteMany({ organizationId: id })

            var actionKey = await ACTION_KEYS.deleteMany({ organizationId: id })
            var actionList = await ACTION_LIST.deleteMany({ organizationId: id })


            //----------------------------------------------------------------scenario assignments------ START --------------------------------------------------------------
            var scenarioAssignment = await SCENARIO_ASSIGNMENT.find({ organizationId: id })
            var responseScenarioAssignment = await Promise.all(scenarioAssignment.map(async (record) => {

                var scenarioAssignmentBestPractices = await SCENARIO_ASSIGNMENT_BEST_PRACTICES.deleteMany({ scenarioAssignmentId: record.id })
                var scenarioAssignmentImages = await SCENARIO_ASSIGNMENT_IMAGES.find({ scenarioAssignmentId: record.id })

                const deleteImagePromises = scenarioAssignmentImages.map(async (imageModel) => {
                    console.log("IMAGES =>>>>>>>>>", imageModel.image);
                    const url = imageModel.image;
                    console.log("url of scenario assignment images =>", url);
                    const filePath = url.substring(url.lastIndexOf("/") + 1);
                    console.log("filePath", filePath);
                    const directoryPath = path.join("public", "images");
                    console.log("directoryPath", directoryPath);
                    const completeFilePath = path.join(directoryPath, filePath);
                    console.log("completeFilePath", completeFilePath);
                    fs.unlink(completeFilePath, (err) => {
                        if (err) {
                            console.error("Error deleting file:", err);
                        } else {
                            console.log("File deleted successfully:", completeFilePath);
                        }
                    });
                });
                await Promise.all(deleteImagePromises);

                console.log("delete of scenario assignment images is complete");
                var scenarioAssignmentImages = await SCENARIO_ASSIGNMENT_IMAGES.deleteMany({ scenarioAssignmentId: record.id })
                var scenarioAssignment = await SCENARIO_ASSIGNMENT.findOneAndDelete({ _id: record.id })
                var obj = {
                    scenarioAssignmentBestPractices: scenarioAssignmentBestPractices,
                    scenarioAssignmentImages: scenarioAssignmentImages,
                    scenarioAssignment: scenarioAssignment
                }
                return obj;
            }))
            //----------------------------------------------------------------scenario assignments------ END --------------------------------------------------------------
            var apparatus = await APPARATUS.deleteMany({ organizationId: id })
            var scenario = await SCENARIO.deleteMany({ organizationId: id })
            var incidentType = await INCIDENT_TYPE.deleteMany({ organizationId: id })
            var assignments = await ASSIGNMENT.deleteMany({ organizationId: id })
            var responseType = await RESPONSE_TYPE.deleteMany({ organizationId: id })
            var deleteUser = await USER.findOneAndDelete({ _id: organizationFind.userId })
            console.log(deleteUser,"ddd");
            var deleteProfile = await PROFILE.findOneAndDelete({ userId: deleteUser._id })
            console.log(deleteProfile);
            var organization = await ORGANIZATION.findByIdAndDelete({ _id: organizationFind._id })

        } else {
            throw new Error('You can not access.')
        }
        console.log("responseType", responseType);
        console.log("incidentType", incidentType);
        console.log("assignments", assignments);
        console.log("tdgLibrary", tdgLibrary);
        console.log("responseTdgLibrary", responseTdgLibrary);
        console.log("tacticalDecisionGame", tacticalDecisionGame);
        console.log("responseTacticalDecisionGame", responseTacticalDecisionGame);
        console.log("incidentPriorities", incidentPriorities);
        console.log("objectives", objectives);
        console.log("thinkingPlanning", thinkingPlanning);
        console.log("responseThinkingPlanning", responseThinkingPlanning);
        console.log("actionKey", actionKey);
        console.log("actionList", actionList);
        console.log("apparatus", apparatus);
        console.log("scenario", scenario);
        console.log("scenarioAssignment", scenarioAssignment);
        console.log("responseScenarioAssignment", responseScenarioAssignment);
        // console.log("deleteUser", deleteUser);
        // console.log("deleteProfile", deleteProfile);

        var response = {
            responseType: responseType,
            incidentType: incidentType,
            assignments: assignments,
            tdgLibrary: tdgLibrary,
            responseTdgLibrary: responseTdgLibrary,
            tacticalDecisionGame: tacticalDecisionGame,
            responseTacticalDecisionGame: responseTacticalDecisionGame,
            incidentPriorities: incidentPriorities,
            objectives: objectives,
            thinkingPlanning: thinkingPlanning,
            responseThinkingPlanning: responseThinkingPlanning,
            actionKey: actionKey,
            actionList: actionList,
            apparatus: apparatus,
            scenario: scenario,
            scenarioAssignment: scenarioAssignment,
            responseScenarioAssignment: responseScenarioAssignment,
            deleteUser: deleteUser,
            deleteProfile: deleteProfile,
            organization: organization
        }
        res.status(200).json({
            status: "success",
            message: "Organization deleted successfully.",
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: "failed",
            message: error.message
        })
    }
};

// exports.deleteOrganization = async function (req, res, next) {
//     try {
//         if (req.role === "superAdmin"){
//             id = req.params.id
//             var organizationFind = await ORGANIZATION.findOne({_id : id})
//             console.log(organizationFind);
//             if (!organizationFind) {
//                 throw new Error("Organization not found.")
//             }else if (organizationFind.isDeleted === "true"){
//                 throw new Error("Organization is already deleted")
//             }
//             var organization = await ORGANIZATION.findByIdAndUpdate(organizationFind.id,{
//                 isDeleted : true
//             })
//         }else {
//             throw new Error ('you can not access.')
//         }
//         res.status(200).json({
//             status : "success",
//             message : "Organization deleted successfully",
//             data : organization
//         });
//     } catch (error) {
//         res.status(400).json({
//             status : "failed",
//             message : error.message
//         });
//     }
// };

exports.updatePassword = async function (req, res, next) {
    try {
        console.log(req.body)
        var id = req.params.id
        
        if(!req.body.password) {
            throw new Error('password is required.')
        }

        const organization = await ORGANIZATION.findOne({ _id: id }).populate("userId")
        console.log("organization", organization);
        req.body.password = await bcrypt.hash(req.body.password, 10);
        var user = await USER.findByIdAndUpdate({ _id: organization.userId._id }, { password: req.body.password }, { new: true });
        console.log(user);

        res.status(200).json({
            status: "success",
            message: "Password updated successfully"
        })
    } catch (error) {
        res.status(400).json({
            status: "failed",
            message: error.message
        })
    }
};

function formatDate(timestamp) {
    const date = new Date(parseInt(timestamp));
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}