const { default: mongoose } = require('mongoose');
const INCIDENT_TYPE = require('../models/incidentTypeModel')
const ORGANIZATION = require('../models/organizationModel')
const RESPONSE_TYPE = require('../models/responseTypeModel');
const ASSIGNMENT = require('../models/assignmentModel');
const TDG_LIBRARY = require('../models/tdgLibraryModel');
const TACTICAL_DECISION_GAME = require('../models/tacticalDecisionGameModel');
const { isBoolean, compareObjects } = require('../utility/date');
const PROFILE = require('../models/profileModel');

exports.createIncidentType = async function (req, res, next) {
    try {
        var id = req.body.responseTypeId

        if (!id) {
            throw new Error('Please provide a responseTypeId.')
        } else if (!req.body.name) {
            throw new Error('Please provide a name.')
        }

        if (req.role === "superAdmin") {

            var getLastIncidentType = await INCIDENT_TYPE.findOne({ isDeleted: false, organizationId: '', responseTypeId: id }).sort({ index: -1 });
            var maxIndex = 1;

            if (getLastIncidentType) {
                maxIndex = getLastIncidentType.index + 1;
            }

            var incidentType = await INCIDENT_TYPE.create({
                responseTypeId: id,
                organizationId: '',
                parentId: '',
                name: (req.body.name === null || req.body.name === '') ? '' : req.body.name,
                isDeleted: false,
                index: maxIndex,
                isUpdated: false
            })
            var FIND = await INCIDENT_TYPE.findOne({ _id: incidentType.id })
            var response = {
                incidentTypeId: FIND.id,
                responseTypeId: FIND.responseTypeId,
                organizationId: FIND.organizationId,
                parentId: FIND.parentId,
                name: FIND.name,
                isDeleted: FIND.isDeleted,
                createdAt: FIND.createdAt,
                updatedAt: FIND.updatedAt,
                index: FIND.index
            }
        }

        else if (req.role === "organization") {

            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            console.log("organization", organizationFind);

            var responseType = await RESPONSE_TYPE.findOne({ _id: id, organizationId: organizationFind._id })
            console.log("responseType", responseType);

            if (!responseType) {
                throw new Error("ResponseType not created by your organization")
            } else if (responseType.isDeleted === true) {
                throw new Error("ResponseType is already deleted")
            }

            var organization = new mongoose.Types.ObjectId(organizationFind._id);

            var getLastIncidentType = await INCIDENT_TYPE.findOne({ isDeleted: false, organizationId: organizationFind._id, responseTypeId: id }).sort({ index: -1 });
            var maxIndex = 1;

            if (getLastIncidentType) {
                maxIndex = getLastIncidentType.index + 1;
            }

            var incidentType = await INCIDENT_TYPE.create({
                responseTypeId: id,
                organizationId: organization,
                parentId: '',
                name: (req.body.name === null || req.body.name === '') ? '' : req.body.name,
                isDeleted: false,
                index: maxIndex,
                isUpdated: false
            })
            var FIND = await INCIDENT_TYPE.findOne({ _id: incidentType.id })
            var response = {
                incidentTypeId: FIND.id,
                responseTypeId: FIND.responseTypeId,
                organizationId: FIND.organizationId,
                parentId: FIND.parentId,
                name: FIND.name,
                isDeleted: FIND.isDeleted,
                createdAt: FIND.createdAt,
                updatedAt: FIND.updatedAt,
                index: FIND.index
            }
        }

        else {
            throw new Error("You can not access.")
        }
        res.status(200).json({
            status: 'success',
            message: 'Incident created successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'success',
            message: error.message
        })
    }
};

exports.getIncidentType = async function (req, res, next) {
    try {
        var responseTypeId = req.params.id
        console.log("ROLE : -", req.role);
        if (req.role === "superAdmin") {
            var incidentType = await INCIDENT_TYPE.find({ isDeleted: false, responseTypeId: responseTypeId }).populate('responseTypeId').sort({ index: 1 })
            var response = incidentType.map((record) => {
                var obj = {
                    incidentTypeId: record.id,
                    responseTypeId: record.responseTypeId.id,
                    responseTypeName: record.responseTypeId.name,
                    organizationId: record.organizationId,
                    parentId: record.parentId,
                    name: record.name,
                    isDeleted: record.isDeleted,
                    createdAt: record.createdAt,
                    updatedAt: record.updatedAt,
                    index: record.index,
                    originalDataId: record?.originalDataId || null,

                }
                return obj;
            })
        } else if (req.role === "organization") {

            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            console.log("organization", organizationFind);
            var responseType = await RESPONSE_TYPE.findOne({ _id: responseTypeId, organizationId: organizationFind._id })
            console.log("responseType", responseType);
            if (!responseType) {
                throw new Error("IncidentType not created by your organization")
            } else if (responseType.isDeleted === true) {
                throw new Error("IncidentType is already deleted")
            }
            var incidentType = await INCIDENT_TYPE.find({ isDeleted: false, responseTypeId: responseTypeId }).populate('responseTypeId').sort({ index: 1 })
            var response = await Promise.all(

                incidentType.map(async (record) => {

                    if (record.originalDataId) {

                        let originalIncidentType = await INCIDENT_TYPE.findOne({ _id: record.originalDataId, isDeleted: false })

                        if (originalIncidentType) {

                            console.log(originalIncidentType, record, "updated record")

                            const keysToIgnore = ["_id", "organizationId", "index", "createdAt", "updatedAt", "originalDataId", "responseTypeId", "incidentTypeId", "isUpdated", "isUpdated"];
                            const areEqual = await compareObjects(originalIncidentType, record, keysToIgnore);
                            console.log(areEqual, 'areEqual')
                            let isMatch = areEqual ? true : false;
                            // console.log(originalResponseType.isUpdated, "isUpdated")
                            if (isBoolean(isMatch) && record.isUpdated === true) {
                                record.isMatch = isMatch
                            } else {
                                record.isMatch = true
                            }
                        }

                    }

                    let obj = {
                        incidentTypeId: record.id,
                        responseTypeId: record.responseTypeId,
                        organizationId: record.organizationId,
                        parentId: record.parentId,
                        name: record.name,
                        isDeleted: record.isDeleted,
                        createdAt: record.createdAt,
                        updatedAt: record.updatedAt,
                        index: record.index,
                        originalDataId: record?.originalDataId || null,
                        isMatch: isBoolean(record?.isMatch) ? record.isMatch : null
                    }
                    return obj;
                })
            )
        }
        else if (req.role === "fireFighter") {

            let findProfile = await PROFILE.findOne({ userId : req.userId })
            var incidentType = await INCIDENT_TYPE.find({ isDeleted: false, responseTypeId: responseTypeId , organizationId : findProfile.organizationId }).populate('responseTypeId')
            var response = incidentType.map((record) => {
                var obj = {
                    incidentTypeId: record.id,
                    responseTypeId: record.responseTypeId.id,
                    responseTypeName: record.responseTypeId.name,
                    organizationId: record.organizationId,
                    parentId: record.parentId,
                    name: record.name,
                    isDeleted: record.isDeleted,
                    createdAt: record.createdAt,
                    updatedAt: record.updatedAt
                }
                return obj;
            })
        }
        else {
            throw new Error("You can not access.")
        }
        res.status(200).json({
            status: 'success',
            message: 'Incident get by responseTypeId successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'success',
            message: error.message
        })
    }
};

exports.updateIncidentType = async function (req, res, next) {
    try {
        var id = req.params.id
        if (!id) {
            throw new Error('please provide a incidentTypeId.')
        } else if (!req.body.name) {
            throw new Error('please provide a name.')
        }
        console.log("ROLE : -", req.role);
        if (req.role === "superAdmin") {

            console.log("Hello");
            var incidentType = await INCIDENT_TYPE.findByIdAndUpdate(id, {
                name: req.body.name,
            }, { new: true })
            console.log("incidentType", incidentType);


            var FIND = await INCIDENT_TYPE.findOne({ _id: incidentType.id })
            var response = {
                incidentTypeId: FIND.id,
                responseTypeId: FIND.responseTypeId,
                organizationId: FIND.organizationId,
                parentId: FIND.parentId,
                name: FIND.name,
                isDeleted: FIND.isDeleted,
                createdAt: FIND.createdAt,
                updatedAt: FIND.updatedAt
            }

            await INCIDENT_TYPE.updateMany(
                { originalDataId: id },
                { $set: { isUpdated: true } }
            );

        } else if (req.role === "organization") {

            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            console.log("organization", organizationFind);
            var incidentType = await INCIDENT_TYPE.findOne({ _id: id, organizationId: organizationFind._id })
            console.log("responseType", incidentType);
            if (!incidentType) {
                throw new Error("IncidentType not created by your organization")
            } else if (incidentType.isDeleted === true) {
                throw new Error("IncidentType is already deleted")
            }

            var incidentType = await INCIDENT_TYPE.findByIdAndUpdate(id, {
                name: req.body.name,
            }, { new: true })

            var FIND = await INCIDENT_TYPE.findOne({ _id: incidentType.id })
            var response = {
                incidentTypeId: FIND.id,
                responseTypeId: FIND.responseTypeId,
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
            message: 'Incident updated successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'success',
            message: error.message
        })
    }
};

exports.deleteIncidentType = async function (req, res, next) {
    try {
        var id = req.params.id
        if (!id) {
            throw new Error('please provide a incidentTypeId.')
        }
        console.log("ROLE : -", req.role);
        if (req.role === "superAdmin") {
            var find = await INCIDENT_TYPE.findOne({ _id: id, isDeleted: false })
            if (!find) {
                throw new Error('IncidentType not found.')
            }
            console.log("find ===>", find);
            var incidentType = await INCIDENT_TYPE.findByIdAndUpdate(id, {
                isDeleted: true,
            }, { new: true })
            console.log("incidentType", incidentType);
            var assignment = await ASSIGNMENT.updateMany({ responseTypeId: find.responseTypeId,incidentTypeId: find._id }, { isDeleted: true }, { new: true })
            var tdgLibrary = await TDG_LIBRARY.updateMany({ responseTypeId: find.responseTypeId, incidentTypeId: find._id }, { isDeleted: true }, { new: true })
            // var getTDGLibrary = await TDG_LIBRARY.findOne({ responseTypeId: find.responseTypeId }, { isDeleted: true })
            // if (getTDGLibrary) {
            //     console.log('getTDGLibrary :>> ', getTDGLibrary);
            //     var tacticalDecisionGame = await TACTICAL_DECISION_GAME.updateMany({ tdgLibraryId: getTDGLibrary._id }, { isDeleted: true }, { new: true })
            // }
            var deletedTdgLibraries = await TDG_LIBRARY.find(
                { responseTypeId: find.responseTypeId, incidentTypeId: find._id, isDeleted: true },
                '_id'
            );
            var deletedTdgLibraryIds = deletedTdgLibraries.map(lib => lib._id);

            await TACTICAL_DECISION_GAME.updateMany(
                { tdgLibraryId: { $in: deletedTdgLibraryIds } },
                { isDeleted: true }
            );

            // console.log("tacticalDecisionGame====>>>>", tacticalDecisionGame);
            const deleteAssignment = await ASSIGNMENT.updateMany({ incidentTypeId: find._id }, { isDeleted: true }, { new: true })

            var FIND = await INCIDENT_TYPE.findOne({ _id: incidentType._id })
            var response = {
                incidentTypeId: FIND.id,
                responseTypeId: FIND.responseTypeId,
                organizationId: FIND.organizationId,
                parentId: FIND.parentId,
                name: FIND.name,
                isDeleted: FIND.isDeleted,
                createdAt: FIND.createdAt,
                updatedAt: FIND.updatedAt
            }
        } else if (req.role === "organization") {

            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            console.log("organization", organizationFind);
            var incidentTypeFIND = await INCIDENT_TYPE.findOne({ _id: id, organizationId: organizationFind._id })
            console.log("responseType", incidentTypeFIND);
            if (!incidentTypeFIND) {
                throw new Error("IncidentType not created by your organization")
            } else if (incidentTypeFIND.isDeleted === true) {
                throw new Error("IncidentType is already deleted")
            }

            var incidentType = await INCIDENT_TYPE.findByIdAndUpdate(id, {
                isDeleted: true,
            }, { new: true })
            var FIND = await INCIDENT_TYPE.findOne({ _id: incidentType.id })
            var response = {
                incidentTypeId: FIND.id,
                responseTypeId: FIND.responseTypeId,
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
            message: 'Incident deleted successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'success',
            message: error.message
        })
    }
};

exports.updateIndex = async function (req, res, next) {
    try {

        var updateData = req.body
        var responseTypeId = req.params.id

        if (req.role === "superAdmin") {

            for (let index = 0; index < updateData.length; index++) {
                const element = updateData[index];

                var updateIndexResponseType = await INCIDENT_TYPE.findByIdAndUpdate(element.incidentTypeId, { index: element.index }, { new: true });
            }

            var incidentType = await INCIDENT_TYPE.find({ isDeleted: false, responseTypeId: responseTypeId }).populate('responseTypeId').sort({ index: 1 })
            var response = incidentType.map((record) => {
                var obj = {
                    incidentTypeId: record.id,
                    responseTypeId: record.responseTypeId.id,
                    responseTypeName: record.responseTypeId.name,
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

                var updateIndexResponseType = await INCIDENT_TYPE.findByIdAndUpdate(element.incidentTypeId, { index: element.index }, { new: true });

            }

            var incidentType = await INCIDENT_TYPE.find({ isDeleted: false, responseTypeId: responseTypeId }).populate('responseTypeId').sort({ index: 1 })
            var response = incidentType.map((record) => {
                var obj = {
                    incidentTypeId: record.id,
                    responseTypeId: record.responseTypeId.id,
                    responseTypeName: record.responseTypeId.name,
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
            message: 'IncidentType index update successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};