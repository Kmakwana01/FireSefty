const { default: mongoose } = require('mongoose');
const ASSIGNMENT = require('../models/assignmentModel')
const INCIDENT_TYPE = require('../models/incidentTypeModel')
const ORGANIZATION = require('../models/organizationModel');
const RESPONSE_TYPE = require('../models/responseTypeModel');
const TDG_LIBRARY = require('../models/tdgLibraryModel');
const TACTICAL_DECISION_GAME = require('../models/tacticalDecisionGameModel');
const { isBoolean, compareObjects } = require('../utility/date');
const PROFILE = require('../models/profileModel')

exports.createAssignment = async function (req, res, next) {
    try {
        var responseTypeId = req.body.responseTypeId
        var incidentTypeId = req.body.incidentTypeId

        if (!responseTypeId) {
            throw new Error("responseTypeId is required.")
        } else if (!incidentTypeId) {
            throw new Error("incidentTypeId is required.")
        } else if (!req.body.name) {
            throw new Error("name is required.")
        }
        console.log("ROLE : -", req.role);
        if (req.role === "superAdmin") {

            var getLastIncidentType = await ASSIGNMENT.findOne({ isDeleted: false, organizationId: '', responseTypeId: responseTypeId }).sort({ index: -1 });
            var maxIndex = 1;

            if (getLastIncidentType) {
                maxIndex = getLastIncidentType.index + 1;
            }
            var assignment = await ASSIGNMENT.create({
                responseTypeId: responseTypeId,
                incidentTypeId: incidentTypeId,
                organizationId: '',
                parentId: '',
                name: (req.body.name === null || req.body.name === '') ? '' : req.body.name,
                isDeleted: false,
                index: maxIndex,
                isUpdated: false
            })
            var FIND = await ASSIGNMENT.findOne({ _id: assignment.id })
            var response = {
                assignmentId: FIND.id,
                responseTypeId: FIND.responseTypeId,
                incidentTypeId: FIND.incidentTypeId,
                organizationId: FIND.organizationId,
                parentId: FIND.parentId,
                name: FIND.name,
                isDeleted: FIND.isDeleted,
                createdAt: FIND.createdAt,
                updatedAt: FIND.updatedAt,
                index: FIND.index
            }
        } else if (req.role === "organization") {
            console.log(responseTypeId, "asdffff");


            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            // console.log("organization", organizationFind);
            var incidentType = await INCIDENT_TYPE.findOne({ _id: incidentTypeId, organizationId: organizationFind._id })
            // console.log("incidentType", incidentType);
            if (!incidentType) {
                throw new Error("IncidentType not created by your organization")
            } else if (incidentType.isDeleted === true) {
                throw new Error("IncidentType is already deleted")
            }
            var responseType = await RESPONSE_TYPE.findOne({ _id: responseTypeId, organizationId: organizationFind._id })
            // console.log("responseType", responseType);
            if (!responseType) {
                throw new Error("responseType not created by your organization")
            } else if (responseType.isDeleted === true) {
                throw new Error("responseType is already deleted")
            }
            console.log("running")

            var getLastIncidentType = await ASSIGNMENT.findOne({ isDeleted: false, organizationId: organizationFind._id, responseTypeId: responseTypeId }).sort({ index: -1 });
            var maxIndex = 1;

            if (getLastIncidentType) {
                maxIndex = getLastIncidentType.index + 1;
            }


            var organization = new mongoose.Types.ObjectId(organizationFind.id)
            var assignment = await ASSIGNMENT.create({
                responseTypeId: responseTypeId,
                incidentTypeId: incidentTypeId,
                organizationId: organization,
                parentId: '',
                name: (req.body.name === null || req.body.name === '') ? '' : req.body.name,
                isDeleted: false,
                index: maxIndex,
                isUpdated: false
            })
            var FIND = await ASSIGNMENT.findOne({ _id: assignment.id })
            var response = {
                assignmentId: FIND.id,
                incidentTypeId: FIND.incidentTypeId,
                responseTypeId: FIND.responseTypeId,
                organizationId: FIND.organizationId,
                parentId: FIND.parentId,
                name: FIND.name,
                isDeleted: FIND.isDeleted,
                createdAt: FIND.createdAt,
                updatedAt: FIND.updatedAt,
                index: FIND.index
            }
        } else {
            throw new Error("You can not access.")
        }
        res.status(200).send({
            status: 'success',
            message: 'Assignment created successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};

exports.getAssignment = async function (req, res, next) {
    try {
        var incidentTypeId = req.params.id
        var incidentTypeIdFind = await INCIDENT_TYPE.findOne({ _id: incidentTypeId });
        console.log("ROLE : -", req.role);
        if (req.role === "superAdmin") {
            var assignment = await ASSIGNMENT.find({ isDeleted: false, responseTypeId: incidentTypeIdFind.responseTypeId }).populate("incidentTypeId").populate("responseTypeId").sort({ index: 1 })

            var response = assignment.map((record) => {
                console.log(record,'rrr',assignment.length)
                var obj = {
                    assignmentId: record._id,
                    responseTypeId: record.responseTypeId?._id,
                    responseTypeName: record.responseTypeId?.name,
                    incidentTypeId: record.incidentTypeId?.id,
                    incidentTypeName: record.incidentTypeId?.name,
                    organizationId: record.organizationId,
                    parentId: record.parentId,
                    name: record.name,
                    isDeleted: record.isDeleted,
                    createdAt: record.createdAt,
                    updatedAt: record.updatedAt,
                    index: record.index,
                    // originalDataId: record?.originalDataId || null,
                }
                return obj;
            })
        } else if (req.role === "organization") {

            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            // console.log("organization",organizationFind);
            var incidentType = await INCIDENT_TYPE.findOne({ _id: incidentTypeId })
            // console.log("responseType",incidentType);
            if (!incidentType) {
                throw new Error("Assignment not created by your organization")
            } else if (incidentType.isDeleted === true) {
                throw new Error("incidentType is already deleted ")
            }

            var assignment = await ASSIGNMENT.find({ isDeleted: false, responseTypeId: incidentTypeIdFind.responseTypeId }).populate("incidentTypeId").populate("responseTypeId").sort({ index: 1 })
            var response = await Promise.all(
                assignment.map(async (record) => {
                    console.log('first')
                    if (record?.originalDataId) {

                        let originalAssignment = await ASSIGNMENT.findOne({ _id: record.originalDataId, isDeleted: false })

                        if (originalAssignment) {
                            console.log('enter')
                            console.log([originalAssignment,record], "isUpdated")
                            const keysToIgnore = ["_id", "organizationId", "index", "createdAt", "updatedAt", "originalDataId","incidentTypeId","responseTypeId"];

                            const areEqual = await compareObjects(originalAssignment, record, keysToIgnore);
                            let isMatch = areEqual ? true : false;

                            if (isBoolean(isMatch) && record.isUpdated === true) {
                                record.isMatch = isMatch
                            } else {
                                record.isMatch = true
                            }
                        }
                    }

                    var obj = {
                        assignmentId: record.id,
                        responseTypeId: record.responseTypeId.id,
                        responseTypeName: record.responseTypeId.name,
                        incidentTypeId: record.incidentTypeId.id,
                        incidentTypeName: record.incidentTypeId.name,
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
        } else if (req.role === "fireFighter") {
            
            let findProfile = await PROFILE.findOne({ userId : req.userId })
            var assignment = await ASSIGNMENT.find({ isDeleted: false, responseTypeId: incidentTypeIdFind.responseTypeId , organizationId : findProfile.organizationId }).populate("incidentTypeId").populate("responseTypeId").sort({ index: 1 })
            var response = assignment.map((record) => {
                var obj = {
                    assignmentId: record.id,
                    responseTypeId: record.responseTypeId.id,
                    responseTypeName: record.responseTypeId.name,
                    incidentTypeId: record.incidentTypeId.id,
                    incidentTypeName: record.incidentTypeId.name,
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
        else {
            throw new Error("You can not access.")
        }
        res.status(200).send({
            status: 'success',
            message: 'Assignment get by incidentTypeId successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};

exports.updateAssignment = async function (req, res, next) {
    try {
        var id = req.params.id
        if (!id) {
            throw new Error('Assignment id is required.')
        }
        console.log("ROLE : -", req.role);
        if (req.role === "superAdmin") {
            var assignment = await ASSIGNMENT.findByIdAndUpdate(id, {
                name: req.body.name,
            }, { new: true });
            var FIND = await ASSIGNMENT.findOne({ _id: assignment.id })
            var response = {
                assignmentId: FIND.id,
                name: FIND.name,
                createdAt: FIND.createdAt,
                updatedAt: FIND.updatedAt
            }

            await ASSIGNMENT.updateMany(
                { originalDataId: id },
                { $set: { isUpdated: true } }
            );
        } else if (req.role === "organization") {

            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            // console.log("organization",organizationFind);
            var assign = await ASSIGNMENT.findOne({ _id: id, organizationId: organizationFind._id })
            // console.log("responseType",incidentType);
            if (!assign) {
                throw new Error("Assignment not created by your organization")
            } else if (assign.isDeleted === true) {
                throw new Error("Assignment is already deleted")
            }

            var assignment = await ASSIGNMENT.findByIdAndUpdate(id, {
                name: req.body.name,
            }, { new: true })
            var FIND = await ASSIGNMENT.findOne({ _id: assignment.id })
            var response = {
                assignmentId: FIND.id,
                name: FIND.name,
                createdAt: FIND.createdAt,
                updatedAt: FIND.updatedAt
            }

        } else {
            throw new Error("You can not access.")
        }
        res.status(200).send({
            status: 'success',
            message: 'Assignment updated successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};

exports.deleteAssignment = async function (req, res, next) {
    try {
        var id = req.params.id
        if (!id) {
            throw new Error('Assignment id is required.')
        }

        console.log("ROLE : -", req.role);
        if (req.role === "superAdmin") {
            var find = await ASSIGNMENT.findOne({ _id: id, isDeleted: false })
            if (!find) {
                throw new Error('Assignment not found')
            }
            console.log("find : >>", find);
            var assignment = await ASSIGNMENT.findByIdAndUpdate(id, {
                isDeleted: true
            }, { new: true });
            var tdgLibrary = await TDG_LIBRARY.updateMany({ assignmentId: assignment._id }, { isDeleted: true }, { new: true })
            var getTDGLibrary = await TDG_LIBRARY.findOne({ assignmentId: id }, { isDeleted: true })
            if (getTDGLibrary) {
                console.log('getTDGLibrary :>> ', getTDGLibrary);
                var tacticalDecisionGame = await TACTICAL_DECISION_GAME.updateMany({ tdgLibraryId: getTDGLibrary._id }, { isDeleted: true }, { new: true })
                console.log("tacticalDecisionGame====>>>>", tacticalDecisionGame);
            }

            var response = {
                assignmentId: find.id,
                name: find.name,
                createdAt: find.createdAt,
                updatedAt: find.updatedAt
            }
        } else if (req.role === "organization") {

            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            // console.log("organization",organizationFind);
            var assign = await ASSIGNMENT.findOne({ _id: id, organizationId: organizationFind._id })
            // console.log("responseType",incidentType);
            if (!assign) {
                throw new Error("Assignment not created by your organization")
            } else if (assign.isDeleted === true) {
                throw new Error("This assignment is already deleted")
            }
            console.log("iS DELETED ====>>>>", assign.isDeleted);

            var assignment = await ASSIGNMENT.findByIdAndUpdate(id, {
                isDeleted: true
            }, { new: true })
            var FIND = await ASSIGNMENT.findOne({ _id: assignment.id })
            var response = {
                assignmentId: FIND.id,
                name: FIND.name,
                createdAt: FIND.createdAt,
                updatedAt: FIND.updatedAt
            }
        } else {
            throw new Error("You can not access.")
        }
        res.status(200).send({
            status: 'success',
            message: 'Assignment deleted successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};

exports.updateIndex = async function (req, res, next) {
    try {
        console.log(req.body)
        var updateData = req.body
        var responseTypeId = req.params.id
        console.log(req.role)

        if (req.role === "superAdmin") {

            for (let index = 0; index < updateData.length; index++) {
                const element = updateData[index];

                var updateIndexResponseType = await ASSIGNMENT.findOneAndUpdate({ _id: element.assignmentId }, { index: element.index }, { new: true });
            }

            var incidentType = await ASSIGNMENT.find({ isDeleted: false, responseTypeId: responseTypeId }).populate('responseTypeId').sort({ index: 1 })
            var response = incidentType.map((record) => {
                var obj = {
                    incidentTypeId: record._id,
                    responseTypeId: record.responseTypeId._id,
                    responseTypeName: record.responseTypeId.name,
                    organizationId: (record.organizationId === '') ? '' : record.organizationId,
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

                var updateIndexResponseType = await ASSIGNMENT.findByIdAndUpdate(element.assignmentId, { index: element.index }, { new: true });

            }

            var incidentType = await ASSIGNMENT.find({ isDeleted: false, responseTypeId: responseTypeId }).populate('responseTypeId').sort({ index: 1 })
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
            message: 'Assignment update successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};