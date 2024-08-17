
const RESPONSE_TYPE = require("../models/responseTypeModel")
const ORGANIZATION = require("../models/organizationModel");
const INCIDENT_TYPE = require('../models/incidentTypeModel')

const { default: mongoose } = require("mongoose");
const ASSIGNMENT = require("../models/assignmentModel");
const TDG_LIBRARY = require("../models/tdgLibraryModel");
const TACTICAL_DECISION_GAME = require("../models/tacticalDecisionGameModel");
const SCENARIO = require("../models/scenarioModel");
const INCIDENT_PRIORITIES = require("../models/incidentPrioritiesModel");
const OBJECTIVES = require("../models/objectivesModel");
const THINKING_PLANNING = require("../models/thinkingPlanningModel");
const ACTION_KEYS = require("../models/actionKeysModel");
const ACTION_LIST = require("../models/actionListModel");
const SCENARIO_ASSIGNMENT = require("../models/scenarioAssignmentsModel");
const PROFILE = require("../models/profileModel");
const { isBoolean, compareObjects } = require("../utility/date");


exports.createResponseType = async function (req, res, next) {
    try {
        if (!req.body.name) {
            throw new Error("You must provide a name")
        }
        console.log("ROLE : -", req.role);
        if (req.role === "superAdmin") {

            var getLastResponseType = await RESPONSE_TYPE.findOne({ isDeleted: false, organizationId: '' }).sort({ index: -1 });
            var maxIndex = 1;

            if (getLastResponseType) {
                maxIndex = getLastResponseType.index + 1;
            }

            var responseType = await RESPONSE_TYPE.create({
                organizationId: '',
                parentId: '',
                name: (req.body.name === null || req.body.name === '') ? '' : req.body.name,
                isDeleted: false,
                index: maxIndex,
                isUpdated: false
            })

            var FIND = await RESPONSE_TYPE.findOne({ _id: responseType.id })
            var response = {
                responseTypeId: FIND.id,
                organizationId: FIND.organizationId,
                parentId: FIND.parentId,
                name: FIND.name,
                isDeleted: FIND.isDeleted,
                createdAt: FIND.createdAt,
                updatedAt: FIND.updatedAt,
                index: FIND.index,
            }

        } else if (req.role === "organization") {
            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            // console.log(organizationFind);
            if (!organizationFind) {
                throw new Error("Organization not found.")
            }
            var organization = new mongoose.Types.ObjectId(organizationFind._id)
            console.log("ORGANIZATION", organization)

            var getLastResponseType = await RESPONSE_TYPE.findOne({ isDeleted: false, organizationId: organizationFind._id }).sort({ index: -1 });
            var maxIndex = 1;

            if (getLastResponseType) {
                maxIndex = getLastResponseType.index + 1;
            }

            var responseType = await RESPONSE_TYPE.create({
                organizationId: organization,
                parentId: '',
                name: (req.body.name === null || req.body.name === '') ? '' : req.body.name,
                isDeleted: false,
                index: maxIndex,
                isUpdated: false
            })

            var FIND = await RESPONSE_TYPE.findOne({ _id: responseType.id })
            var response = {
                organizationId: FIND.organizationId,
                parentId: FIND.parentId,
                responseTypeId: FIND.id,
                name: FIND.name,
                isDeleted: FIND.isDeleted,
                createdAt: FIND.createdAt,
                updatedAt: FIND.updatedAt,
                index: FIND.index,
            }
        } else {
            throw new Error("You can not access.")
        }
        res.status(200).json({
            status: 'success',
            message: 'Response created successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};

exports.getResponseType = async function (req, res, next) {
    try {
        console.log("ROLE : -", req.role);
        if (req.role === "superAdmin") {
            var FIND = await RESPONSE_TYPE.find({ isDeleted: false, organizationId: '' }).sort({ index: 1 })
            var response = FIND.map((record) => {
                var obj = {
                    responseTypeId: record.id,
                    organizationId: record.organizationId,
                    parentId: record.parentId,
                    name: record.name,
                    isDeleted: record.isDeleted,
                    createdAt: record.createdAt,
                    updatedAt: record.updatedAt,
                    index: record.index,
                    originalDataId: record?.originalDataId || null
                }
                return obj;
            })
        } else if (req.role === "organization") {

            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            console.log("ORGANIZATION", organizationFind)
            var FIND = await RESPONSE_TYPE.find({ isDeleted: false, organizationId: organizationFind._id }).sort({ index: 1 })
            console.log("FIND", FIND)

            var response = await Promise.all(FIND.map(async (record) => {

                if (record.originalDataId) {

                    let originalResponseType = await RESPONSE_TYPE.findOne({ _id: record.originalDataId  , isDeleted : false})

                    if (originalResponseType) {

                        const keysToIgnore = ["_id", "organizationId", "index", "createdAt", "updatedAt", "originalDataId","isUpdated"];

                        const areEqual = await compareObjects(originalResponseType, record, keysToIgnore);
                        let isMatch = areEqual ? true : false;
                        console.log(areEqual, "isUpdated")

                        if (isBoolean(isMatch) && record.isUpdated === true) {
                            record.isMatch = isMatch
                        } else {
                            record.isMatch = true
                        }
                    }

                }

                let obj = {
                    responseTypeId: record.id,
                    organizationId: record.organizationId,
                    parentId: record.parentId,
                    name: record.name,
                    isDeleted: record.isDeleted,
                    createdAt: record.createdAt,
                    updatedAt: record.updatedAt,
                    index: record.index,
                    originalDataId: record?.originalDataId || null,
                    isMatch: isBoolean(record?.isMatch) ? record.isMatch : null
                    // isUpdated: record.isUpdated
                }
                return obj;
            }))
        }
        else if (req.role === "fireFighter") {

            var profile = await PROFILE.findOne({ userId: req.userId, isDeleted: false });

            if (profile) {
                var FIND = await RESPONSE_TYPE.find({ isDeleted: false, organizationId: profile.organizationId })
                var response = FIND.map((record) => {
                    var obj = {
                        responseTypeId: record.id,
                        organizationId: record.organizationId,
                        parentId: record.parentId,
                        name: record.name,
                        isDeleted: record.isDeleted,
                        createdAt: record.createdAt,
                        updatedAt: record.updatedAt,
                        index: record.index
                    }
                    return obj;
                })
            }
        }
        else {
            throw new Error("You can not access.")
        }

        if (response.length == 0) {
            res.status(200).json({
                status: 'success',
                message: 'Response is Empty.',
                data: response
            });
        } else {
            res.status(200).json({
                status: 'success',
                message: 'Response get successfully.',
                data: response
            });
        }
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};

exports.updateResponseType = async function (req, res, next) {
    try {
        console.log("ROLE : -", req.role);
        var id = req.params.id;
        if (!req.body.name) {
            throw new Error("You must provide a name")
        }
        if (req.role === "superAdmin") {
            const responseFind = await RESPONSE_TYPE.findOne({ _id: id })

            if (!responseFind) {
                throw new Error("Response type doesn't exist.")
            }

            var responseType = await RESPONSE_TYPE.findByIdAndUpdate(id, {
                name: req.body.name
            }, { new: true })

            var FIND = await RESPONSE_TYPE.findOne({ _id: responseType.id })
            var response = {
                responseTypeId: FIND.id,
                organizationId: FIND.organizationId,
                parentId: FIND.parentId,
                name: FIND.name,
                isDeleted: FIND.isDeleted,
                createdAt: FIND.createdAt,
                updatedAt: FIND.updatedAt,
            }

            await RESPONSE_TYPE.updateMany(
                { originalDataId: id },
                { $set: { isUpdated: true } }
            );

        } else if (req.role === "organization") {

            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId, isDeleted: false })

            const responseFind = await RESPONSE_TYPE.findOne({ _id: id, isDeleted: false })

            if (!responseFind) {
                throw new Error("Response type doesn't exist.")
            }

            var responseType = await RESPONSE_TYPE.findByIdAndUpdate(id, {
                name: req.body.name,
            }, { new: true })

            var FIND = await RESPONSE_TYPE.findOne({ _id: responseType.id })
            var response = {
                responseTypeId: FIND.id,
                organizationId: FIND.organizationId,
                parentId: FIND.parentId,
                name: FIND.name,
                isDeleted: FIND.isDeleted,
                createdAt: FIND.createdAt,
                updatedAt: FIND.updatedAt
            }
        } else {
            throw new Error("You can not access.")
        }

        res.status(200).json({
            status: 'success',
            message: 'Response update successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
}

exports.deleteResponseType = async function (req, res, next) {
    try {
        console.log("ROLE : -", req.role);
        var id = req.params.id;

        if (req.role === "superAdmin") {

            const responseFind = await RESPONSE_TYPE.findOne({ _id: id, isDeleted: false })

            if (!responseFind) {
                throw new Error("Response type doesn't exist.")
            }

            var responseType = await RESPONSE_TYPE.findByIdAndUpdate(id, {
                isDeleted: true,
            }, { new: true })

            console.log("Response type: " + responseType._id);

            var incidentType = await INCIDENT_TYPE.updateMany({ responseTypeId: responseType._id }, { isDeleted: true }, { new: true })
            var assignment = await ASSIGNMENT.updateMany({ responseTypeId: responseType._id }, { isDeleted: true }, { new: true })
            var tdgLibrary = await TDG_LIBRARY.updateMany({ responseTypeId: responseType._id }, { isDeleted: true }, { new: true })
            var getTDGLibrary = await TDG_LIBRARY.findOne({ responseTypeId: responseType._id }, { isDeleted: true })
            console.log('getTDGLibrary :>> ', getTDGLibrary);
            if (getTDGLibrary) {
                var tacticalDecisionGame = await TACTICAL_DECISION_GAME.updateMany({ tdgLibraryId: getTDGLibrary._id }, { isDeleted: true }, { new: true })
                console.log("tacticalDecisionGame====>>>>", tacticalDecisionGame);
            }


            var incidentPriorities = await INCIDENT_PRIORITIES.updateMany({ responseTypeId: responseType._id }, { isDeleted: true }, { new: true })
            var objectives = await OBJECTIVES.updateMany({ responseTypeId: responseType._id }, { isDeleted: true }, { new: true })
            var thinkingPlanning = await THINKING_PLANNING.updateMany({ responseTypeId: responseType._id }, { isDeleted: true }, { new: true });
            var actionKey = await ACTION_KEYS.updateMany({ responseTypeId: responseType._id }, { isDeleted: true }, { new: true })
            var getActionKeys = await ACTION_KEYS.findOne({ responseTypeId: responseType._id }, { isDeleted: true });
            if (getActionKeys) {
                var actionList = await ACTION_LIST.updateMany({ actionKeysId: getActionKeys._id }, { isDeleted: true }, { new: true })
            }

            var scenario = await SCENARIO.updateMany({ responseTypeId: responseType._id }, { isDeleted: true }, { new: true })
            var scenarioAssignment = await SCENARIO_ASSIGNMENT.updateMany({ responseTypeId: responseType._id }, { isDeleted: true }, { new: true })

        } else if (req.role === "organization") {

            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            console.log("ORGANIZhdv", organizationFind)
            const responseFind = await RESPONSE_TYPE.findOne({ _id: id, isDeleted: false })
            console.log("=======?>>>>", responseFind)

            if (!responseFind) {
                throw new Error("Response type doesn't exist.")
            }

            var responseType = await RESPONSE_TYPE.findByIdAndUpdate(id, {
                isDeleted: true,
            }, { new: true })
            // var incidentType = await INCIDENT_TYPE.updateMany({responseTypeId : responseType._id},{isDeleted : true})
            // var assignment = await ASSIGNMENT.updateMany({responseTypeId : responseType._id},{isDeleted : true})
            // // var tdgLibrary = await TDG_LIBRARY.updateMany({responseTypeId : responseFind._id},{isDeleted : true})
            // var tacticalDecisionGame = await TACTICAL_DECISION_GAME.updateMany({responseTypeId : responseFind._id},{isDeleted : true})
            var incidentPriorities = await INCIDENT_PRIORITIES.updateMany({ responseTypeId: responseType._id }, { isDeleted: true })
            // var objectives = await OBJECTIVES.updateMany({responseTypeId : responseType._id},{isDeleted: true})
            var actionKey = await ACTION_KEYS.updateMany({ responseTypeId: responseType._id }, { isDeleted: true })
            // var actionList = await ACTION_LIST.updateMany({responseTypeId : responseType._id},{isDeleted: true})
            var scenario = await SCENARIO.updateMany({ responseTypeId: responseType._id }, { isDeleted: true })
            var scenarioAssignment = await SCENARIO.updateMany({ responseTypeId: responseType._id }, { isDeleted: true })
        } else {
            throw new Error("You can not access.")
        }
        res.status(200).json({
            status: 'success',
            message: 'ResponseType deleted successfully'
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
}

exports.updateIndex = async function (req, res, next) {
    try {
        console.log("ROLE : -", req.role);

        var updateData = req.body

        if (req.role === "superAdmin") {

            for (let index = 0; index < updateData.length; index++) {
                const element = updateData[index];

                var updateIndexResponseType = await RESPONSE_TYPE.findByIdAndUpdate(element.responseTypeId, { index: element.index }, { new: true });
            }

            var FIND = await RESPONSE_TYPE.find({ isDeleted: false, organizationId: '' }).sort({ index: 1 });
            var response = FIND.map((record) => {
                var obj = {
                    responseTypeId: record.id,
                    organizationId: record.organizationId,
                    parentId: record.parentId,
                    name: record.name,
                    isDeleted: record.isDeleted,
                    createdAt: record.createdAt,
                    updatedAt: record.updatedAt,
                    index: record.index
                }
                return obj;
            })


        } else if (req.role === "organization") {
            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            if (!organizationFind) {
                throw new Error("Organization not found.")
            }
            var organization = new mongoose.Types.ObjectId(organizationFind._id)
            console.log("ORGANIZATION", organization)

            for (let index = 0; index < updateData.length; index++) {
                const element = updateData[index];

                var updateIndexResponseType = await RESPONSE_TYPE.findByIdAndUpdate(element.responseTypeId, { index: element.index }, { new: true });

            }

            var FIND = await RESPONSE_TYPE.find({ isDeleted: false, organizationId: organizationFind._id }).sort({ index: 1 })
            console.log("FIND", FIND)

            var response = FIND.map((record) => {
                var obj = {
                    responseTypeId: record.id,
                    organizationId: record.organizationId,
                    parentId: record.parentId,
                    name: record.name,
                    isDeleted: record.isDeleted,
                    createdAt: record.createdAt,
                    updatedAt: record.updatedAt,
                    index: record.index
                }
                return obj;
            })



        } else {
            throw new Error("You can not access.")
        }
        res.status(200).json({
            status: 'success',
            message: 'Response type index update successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};