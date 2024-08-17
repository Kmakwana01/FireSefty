const INCIDENT_PRIORITIES = require('../models/incidentPrioritiesModel');
const ORGANIZATION = require('../models/organizationModel')
var OBJECTIVES = require('../models/objectivesModel');
const RESPONSE_TYPE = require('../models/responseTypeModel');
const { request } = require('express');
const { default: mongoose } = require('mongoose');
const THINKING_PLANNING = require('../models/thinkingPlanningModel');
const { compareObjects , isBoolean } = require('../utility/date');
const PROFILE = require('../models/profileModel')


exports.createObjectives = async function (req, res, next) {
    try {

        if (!req.body.incidentPrioritiesId) {
            throw new Error('incidentPrioritiesId required')
        } else if (!req.body.responseTypeId) {
            throw new Error('responseTypeId required')
        }
        if (!req.body.name) {
            throw new Error('name required.')
        }
        if (req.role === 'superAdmin') {
            const responseType = await RESPONSE_TYPE.findOne({ _id: req.body.responseTypeId })
            if (!responseType) {
                throw new Error('responseType not found.')
            } else if (responseType.isDeleted === true) {
                throw new Error('responseType is already deleted')
            }
            const incidentPriorities = await INCIDENT_PRIORITIES.findOne({ _id: req.body.incidentPrioritiesId })
            if (!incidentPriorities) {
                throw new Error('incidentPriorities not found')
            } else if (incidentPriorities.isDeleted === true) {
                throw new Error('incidentPriorities is already deleted')
            }

            var getLastObjective = await OBJECTIVES.findOne({ isDeleted: false, organizationId: '', incidentPrioritiesId: incidentPriorities._id }).sort({ index: -1 });
            var maxIndex = 1;

            if (getLastObjective) {
                maxIndex = getLastObjective.index + 1;
            }

            var objectives = await OBJECTIVES.create({
                incidentPrioritiesId: req.body.incidentPrioritiesId,
                responseTypeId: req.body.responseTypeId,
                organizationId: '',
                parentId: '',
                name: (req.body.name === null || req.body.name === '') ? '' : req.body.name,
                isDeleted: false,
                index: maxIndex,
                isUpdated: false
            })
        } else if (req.role === 'organization') {

            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            var responseType = await RESPONSE_TYPE.findOne({ _id: req.body.responseTypeId })
            if (!responseType) {
                throw new Error("responseType not created by your organization.")
            } else if (responseType.isDeleted === true) {
                throw new Error("This response is already deleted.")
            }
            const incidentPriorities = await INCIDENT_PRIORITIES.findOne({ _id: req.body.incidentPrioritiesId })

            if (!incidentPriorities) {
                throw new Error('incidentPriorities not created by your organization')
            } else if (incidentPriorities.isDeleted === true) {
                throw new Error('incidentPriorities is already deleted')
            }


            var getLastObjective = await OBJECTIVES.findOne({ isDeleted: false, incidentPrioritiesId: incidentPriorities._id }).sort({ index: -1 });
            var maxIndex = 1;
            console.log(getLastObjective, "lastObjective");

            if (getLastObjective) {
                maxIndex = getLastObjective.index + 1;
            }

            var organization = new mongoose.Types.ObjectId(organizationFind.id);
            var objectives = await OBJECTIVES.create({
                incidentPrioritiesId: req.body.incidentPrioritiesId,
                responseTypeId: req.body.responseTypeId,
                organizationId: organization,
                parentId: '',
                name: (req.body.name === null || req.body.name === '') ? '' : req.body.name,
                isDeleted: false,
                index: maxIndex,
                isUpdated: false
            })
        } else {
            throw new Error("you can not access")
        }
        var response = {
            objectivesId: objectives.id,
            incidentPrioritiesId: objectives.incidentPrioritiesId,
            responseTypeId: objectives.responseTypeId,
            organizationId: objectives.organizationId,
            parentId: objectives.parentId,
            name: objectives.name,
            isDeleted: objectives.isDeleted,
            createdAt: objectives.createdAt,
            updatedAt: objectives.updatedAt,
            index: objectives.index
        }
        res.status(200).json({
            status: 'success',
            message: 'Objectives created successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};

exports.getObjectives = async function (req, res, next) {
    try {
        var id = req.params.id
        console.log(id);
        if (req.role === 'superAdmin') {
            const incident = await INCIDENT_PRIORITIES.findOne({ _id: id })
            if (!incident) {
                throw new Error('incident not found.')
            } else if (incident.isDeleted === true) {
                throw new Error('incident already deleted')
            }
            var objectives = await OBJECTIVES.find({ incidentPrioritiesId: id, isDeleted: false }).sort({ index: 1 })
            if (!objectives) {
                throw new Error('could not find objectives.')
            }
        } else if (req.role === 'organization') {

            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            var incident = await INCIDENT_PRIORITIES.findOne({ _id: id })
            console.log(incident);
            if (!incident) {
                throw new Error("incidentPriorities not created by your organization.")
            } else if (incident.isDeleted === true) {
                throw new Error("This incidentPriorities is already deleted.")
            }

            var objectives = await OBJECTIVES.find({ incidentPrioritiesId: id, isDeleted: false }).sort({ index: 1 })
            if (!objectives) {
                throw new Error('could not find objectives.')
            }
        } else if (req.role === 'fireFighter') {
             let findProfile = await PROFILE.findOne({ userId : req.userId })
            const incident = await INCIDENT_PRIORITIES.findOne({ _id: id })
            if (!incident) {
                throw new Error('incident not found.')
            } else if (incident.isDeleted === true) {
                throw new Error('incident already deleted')
            }
            var objectives = await OBJECTIVES.find({ incidentPrioritiesId: id, isDeleted: false , organizationId : findProfile.organizationId }).sort({ index: 1 })
            if (!objectives) {
                throw new Error('could not find objectives.')
            }
        } else {
            throw new Error("you can not access")
        }
        var response = await Promise.all(
            objectives.map(async (record) => {

                if (record.originalDataId) {

                    let originalObjectives = await OBJECTIVES.findOne({ _id: record.originalDataId, isDeleted: false })

                    if (originalObjectives) {

                        console.log(record,'record')
                        console.log(originalObjectives,'originalObjectives')

                        const keysToIgnore = ["_id", "incidentPrioritiesId","responseTypeId","organizationId", "index","originalDataId", "createdAt", "updatedAt", "isUpdated"];

                        const areEqual = await compareObjects(originalObjectives, record, keysToIgnore);
                        let isMatch = areEqual ? true : false;
                        console.log(areEqual, "isUpdated")

                        if (isBoolean(isMatch) && record.isUpdated === true) {
                            record.isMatch = isMatch
                        } else {
                            record.isMatch = true
                        }
                    }
                }

                var obj = {
                    objectivesId: record.id,
                    incidentPrioritiesId: record.incidentPrioritiesId,
                    responseTypeId: record.responseTypeId,
                    organizationId: record.organizationId,
                    parentId: record.parentId,
                    name: record.name,
                    createdAt: record.createdAt,
                    updatedAt: record.updatedAt,
                    index: record.index,
                    originalDataId: record?.originalDataId || null,
                    isMatch: isBoolean(record?.isMatch) ? record.isMatch : null
                }
                return obj;
            })
        )

        res.status(200).json({
            status: 'success',
            message: 'Objectives get successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};

exports.updateObjectives = async function (req, res, next) {
    try {
        var id = req.params.id
        if (req.role === 'superAdmin') {
            var objectives = await OBJECTIVES.findByIdAndUpdate(id, {
                name: req.body.name,
            }, { new: true })
            if (!objectives) {
                throw new Error('could not find objectives')
            }
            await OBJECTIVES.updateMany(
                { originalDataId: id },
                { $set: { isUpdated: true } }
            );
        } else if (req.role === 'organization') {

            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            var objectivesFind = await OBJECTIVES.findOne({ _id: id })
            if (!objectivesFind) {
                throw new Error("objectives not created by your organization.")
            } else if (objectivesFind.isDeleted === true) {
                throw new Error("This objectives is already deleted.")
            }

            var objectives = await OBJECTIVES.findByIdAndUpdate(id, {
                name: req.body.name,
            }, { new: true })
        } else {
            throw new Error("you can not access")
        }
        const response = {
            objectivesId: objectives.id,
            incidentPrioritiesId: objectives.incidentPrioritiesId,
            responseTypeId: objectives.responseTypeId,
            organizationId: objectives.organizationId,
            parentId: objectives.parentId,
            name: objectives.name,
            isDeleted: objectives.isDeleted,
            createdAt: objectives.createdAt,
            updatedAt: objectives.updatedAt
        }
        res.status(200).json({
            status: 'success',
            message: 'Objectives updated successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};

exports.deleteObjectives = async function (req, res, next) {
    try {
        var id = req.params.id
        if (req.role === 'superAdmin') {
            var objectives = await OBJECTIVES.findByIdAndUpdate(id, {
                isDeleted: true,
            }, { new: true })
            if (!objectives) {
                throw new Error('could not find objectives')
            }
            var thinkingPlanning = await THINKING_PLANNING.updateMany({ objectivesId: id }, { isDeleted: true });
        } else if (req.role === 'organization') {
            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            var objectivesFind = await OBJECTIVES.findOne({ _id: id })
            if (!objectivesFind) {
                throw new Error("objectives not created by your organization.")
            } else if (objectivesFind.isDeleted === true) {
                throw new Error("This objectives is already deleted.")
            }
            var objectives = await OBJECTIVES.findByIdAndUpdate(id, {
                isDeleted: true,
            }, { new: true })
        } else {
            throw new Error('you can not access.')
        }
        const response = {
            objectivesId: objectives.id,
            incidentPrioritiesId: objectives.incidentPrioritiesId,
            responseTypeId: objectives.responseTypeId,
            name: objectives.name,
            isDeleted: objectives.isDeleted,
            createdAt: objectives.createdAt,
            updatedAt: objectives.updatedAt
        }
        res.status(200).json({
            status: 'success',
            message: 'Objectives delete successfully.',
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

        var updateData = req.body
        var incidentPrioritiesId = req.params.id

        if (req.role === "superAdmin") {

            for (let index = 0; index < updateData.length; index++) {
                const element = updateData[index];

                var updateIndexResponseType = await OBJECTIVES.findByIdAndUpdate(element.objectivesId, { index: element.index }, { new: true });
            }

            var incidentType = await OBJECTIVES.find({ isDeleted: false, incidentPrioritiesId: incidentPrioritiesId }).populate('responseTypeId').sort({ index: 1 })
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

                var updateIndexResponseType = await OBJECTIVES.findByIdAndUpdate(element.objectivesId, { index: element.index }, { new: true });

            }

            var incidentType = await OBJECTIVES.find({ isDeleted: false, incidentPrioritiesId: incidentPrioritiesId }).populate('responseTypeId').sort({ index: 1 })
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
            message: 'Objective update successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};