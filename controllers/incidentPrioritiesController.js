const { default: mongoose } = require("mongoose");
const INCIDENT_PRIORITIES = require("../models/incidentPrioritiesModel")
const ORGANIZATION = require("../models/organizationModel");
const RESPONSE_TYPE = require("../models/responseTypeModel");
const OBJECTIVES = require("../models/objectivesModel");
const THINKING_PLANNING = require("../models/thinkingPlanningModel");
const { compareObjects, isBoolean } = require("../utility/date");
const PROFILE = require('../models/profileModel')

exports.createIncidentPriorities = async function (req, res, next) {
    try {

        if (!req.body.name) {
            throw new Error("name is required");
        } else if (!req.body.responseTypeId) {
            throw new Error("functionKeyId is required");
        } else if (!req.body.color) {
            throw new Error("color is required");
        } else if (!req.file) {
            throw new Error("icon is required");
        }

        var icon;
        if (req.file) {
            if (req.file === null) {
                icon = '';
            } else {
                icon = req.file.filename;
            }
        } else {
            icon = '';
        }
        if (req.role === "superAdmin") {
            // const url = req.protocol + "://" + req.get("host") + "/images/" + req.file.filename;

            var getLastIncidentPriorities = await INCIDENT_PRIORITIES.findOne({ isDeleted: false, organizationId: '', responseTypeId: req.body.responseTypeId }).sort({ index: -1 });
            var maxIndex = 1;

            if (getLastIncidentPriorities) {
                maxIndex = getLastIncidentPriorities.index + 1;
            }

            const incidentPriority = await INCIDENT_PRIORITIES.create({
                responseTypeId: req.body.responseTypeId,
                organizationId: '',
                parentId: '',
                name: req.body.name,
                icon: icon,
                color: req.body.color,
                isDeleted: false,
                index: maxIndex,
                isUpdated: false
            })
            var response = {
                incidentPrioritiesId: incidentPriority._id,
                responseTypeId: incidentPriority.responseTypeId,
                organizationId: incidentPriority.organizationId,
                parentId: incidentPriority.parentId,
                name: incidentPriority.name,
                icon: incidentPriority.icon,
                color: incidentPriority.color,
                createdAt: incidentPriority.createdAt,
                updatedAt: incidentPriority.updatedAt,
                index: incidentPriority.index
            }
        } else if (req.role === 'organization') {


            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            var responseType = await RESPONSE_TYPE.findOne({ _id: req.body.responseTypeId, organizationId: organizationFind._id })
            if (!responseType) {
                throw new Error("responseType not created by your organization.")
            } else if (responseType.isDeleted === true) {
                throw new Error("This response is already deleted.")
            }
            // const url = req.protocol + "://" + req.get("host") + "/images/" + req.file.filename;

            var getLastIncidentPriorities = await INCIDENT_PRIORITIES.findOne({ isDeleted: false, organizationId: organizationFind._id, responseTypeId: responseType._id }).sort({ index: -1 });
            var maxIndex = 1;

            if (getLastIncidentPriorities) {
                maxIndex = getLastIncidentPriorities.index + 1;
            }
            var organization = new mongoose.Types.ObjectId(organizationFind.id)
            const incidentPriority = await INCIDENT_PRIORITIES.create({
                responseTypeId: req.body.responseTypeId,
                organizationId: organization,
                parentId: '',
                name: req.body.name,
                icon: icon,
                color: req.body.color,
                isDeleted: false,
                index: maxIndex,
                isUpdated: false
            })
            var response = {
                incidentPrioritiesId: incidentPriority.id,
                responseTypeId: incidentPriority.responseTypeId,
                organizationId: incidentPriority.organizationId,
                parentId: incidentPriority.parentId,
                name: incidentPriority.name,
                icon: incidentPriority.icon,
                color: incidentPriority.color,
                createdAt: incidentPriority.createdAt,
                updatedAt: incidentPriority.updatedAt,
                index: incidentPriority.index
            }
        } else {
            throw new Error('You can not access.')
        }
        res.status(200).json({
            status: "success",
            message: 'incident priorities created successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};

exports.getIncidentPriorities = async function (req, res, next) {
    try {
        var id = req.params.id;

        if (req.role === "superAdmin") {
            var incidentPriorities = await INCIDENT_PRIORITIES.find({ responseTypeId: id, isDeleted: false }).sort({ index: 1 })
            if (!incidentPriorities) {
                throw new Error('Could not find incidentPriorities')
            }
        } else if (req.role === "organization") {

            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            var responseType = await RESPONSE_TYPE.findOne({ _id: id, organizationId: organizationFind._id })
            if (!responseType) {
                throw new Error("responseType not created by your organization.")
            } else if (responseType.isDeleted === true) {
                throw new Error("This response is already deleted.")
            }

            var incidentPriorities = await INCIDENT_PRIORITIES.find({ responseTypeId: id, isDeleted: false }).sort({ index: 1 })
            if (!incidentPriorities) {
                throw new Error('Could not find incidentPriorities')
            }
        } else if (req.role === "fireFighter") {
            let findProfile = await PROFILE.findOne({ userId : req.userId })
            var incidentPriorities = await INCIDENT_PRIORITIES.find({ responseTypeId: id, isDeleted: false ,organizationId : findProfile.organizationId }).sort({ index: 1 })
            if (!incidentPriorities) {
                throw new Error('Could not find incidentPriorities')
            }
        } else {
            throw new Error("You can not access.")
        }
        var response = await Promise.all(
            incidentPriorities.map(async (record) => {

                if (record.originalDataId) {

                    let originalIncidentPriority = await INCIDENT_PRIORITIES.findOne({ _id: record.originalDataId, isDeleted: false })

                    if (originalIncidentPriority) {

                        console.log(record,'record')
                        console.log(originalIncidentPriority,'originalIncidentPriority')

                        const keysToIgnore = ["_id", "organizationId", "index", "createdAt", "updatedAt", "originalDataId", "isUpdated","responseTypeId"];

                        const areEqual = await compareObjects(originalIncidentPriority, record, keysToIgnore);
                        let isMatch = areEqual ? true : false;
                        console.log(areEqual, "isUpdated")

                        if (isBoolean(isMatch) && record.isUpdated === true) {
                            record.isMatch = isMatch
                        } else {
                            record.isMatch = true
                        }
                    }

                }

                var url;
                if (record.icon === null || record.icon === '') {
                    url = '';
                } else {
                    url = req.protocol + "://" + req.get("host") + "/images/" + record.icon;
                }

                const obj = {
                    incidentPrioritiesId: record.id,
                    responseTypeId: record.responseTypeId,
                    organizationId: record.organizationId,
                    parentId: record.parentId,
                    name: (record.name === null || record.name === '') ? '' : record.name,
                    icon: url,
                    color: (record.color === null || record.color === '') ? '' : record.color,
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
            message: 'Get incident type priority successfully.',
            data: response
        });
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};

exports.updateIncidentPriorities = async function (req, res, next) {
    try {
        var id = req.params.id;

        if (req.role === 'superAdmin') {
            if (req.file) {

                var icon;
                if (req.file === null || req.file === '') {
                    icon = '';
                } else {
                    icon = req.file.filename
                }
                // const url = req.protocol + "://" + req.get("host") + "/images/" + req.file.filename;
                var incidentPriorities = await INCIDENT_PRIORITIES.findByIdAndUpdate(id, {
                    name: req.body.name,
                    icon: icon,
                    color: req.body.color
                }, { new: true })
            } else {
                var incidentPriorities = await INCIDENT_PRIORITIES.findByIdAndUpdate(id, {
                    name: req.body.name,
                    color: req.body.color
                }, { new: true })
            }
            if (!incidentPriorities) {
                throw new Error('Could not find incidentPriorities')
            }

            await INCIDENT_PRIORITIES.updateMany(
                { originalDataId: id },
                { $set: { isUpdated: true } }
            );

        } else if (req.role === 'organization') {

            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            var incident = await INCIDENT_PRIORITIES.findOne({ _id: id, organizationId: organizationFind._id })
            if (!incident) {
                throw new Error("incidentPriorities not created by your organization.")
            } else if (incident.isDeleted === true) {
                throw new Error("This incidentPriorities is already deleted.")
            }

            if (req.file) {

                var icon;
                if (req.file === null || req.file === '') {
                    icon = '';
                } else {
                    icon = req.file.filename
                }
                // const url = req.protocol + "://" + req.get("host") + "/images/" + req.file.filename;
                var incidentPriorities = await INCIDENT_PRIORITIES.findByIdAndUpdate(id, {
                    name: req.body.name,
                    icon: icon,
                    color: req.body.color
                }, { new: true })
            } else {
                var incidentPriorities = await INCIDENT_PRIORITIES.findByIdAndUpdate(id, {
                    name: req.body.name,
                    color: req.body.color
                }, { new: true })
            }
            if (!incidentPriorities) {
                throw new Error('Could not find incidentPriorities')
            }
        }

        const response = {
            incidentPrioritiesId: incidentPriorities.id,
            organizationId: incidentPriorities.organizationId,
            parentId: incidentPriorities.parentId,
            name: incidentPriorities.name,
            icon: incidentPriorities.icon,
            color: incidentPriorities.color,
            createdAt: incidentPriorities.createdAt,
            updatedAt: incidentPriorities.updatedAt
        }
        res.status(200).json({
            status: 'success',
            message: 'Incident Priorities updated successfully.',
            data: response
        });
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};

exports.deleteIncidentPriorities = async function (req, res, next) {
    try {

        var id = req.params.id;
        if (req.role === 'superAdmin') {
            var incidentPriorities = await INCIDENT_PRIORITIES.findByIdAndUpdate(id, { isDeleted: true }, { new: true })

            if (!incidentPriorities) {
                throw new Error('Could not find incidentPriorities')
            }
            var objectives = await OBJECTIVES.updateMany({ incidentPrioritiesId: id }, { isDeleted: true })
            var thinkingPlanning = await THINKING_PLANNING.updateMany({ incidentPrioritiesId: id }, { isDeleted: true });
        } else if (req.role === 'organization') {

            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            var incident = await INCIDENT_PRIORITIES.findOne({ _id: id, organizationId: organizationFind._id })
            if (!incident) {
                throw new Error("incidentPriorities not created by your organization.")
            } else if (incident.isDeleted === true) {
                throw new Error("This incidentPriorities is already deleted.")
            }
            var incidentPriorities = await INCIDENT_PRIORITIES.findByIdAndUpdate(id, { isDeleted: true }, { new: true })

            if (!incidentPriorities) {
                throw new Error('Could not find incidentPriorities')
            }
        }
        res.status(200).json({
            status: 'success',
            message: 'Incident priorities has been deleted.'
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
        var responseTypeId = req.params.id

        if (req.role === "superAdmin") {

            for (let index = 0; index < updateData.length; index++) {
                const element = updateData[index];

                var updateIndexResponseType = await INCIDENT_PRIORITIES.findByIdAndUpdate(element.incidentPrioritiesId, { index: element.index }, { new: true });
            }

            var incidentPriorities = await INCIDENT_PRIORITIES.find({ isDeleted: false, responseTypeId: responseTypeId, organizationId: '' }).populate('responseTypeId').sort({ index: 1 })
            var response = incidentPriorities.map((record) => {
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

                var updateIndexResponseType = await INCIDENT_PRIORITIES.findByIdAndUpdate(element.incidentPrioritiesId, { index: element.index }, { new: true });

            }

            var incidentPriorities = await INCIDENT_PRIORITIES.find({ isDeleted: false, responseTypeId: responseTypeId, organizationId: organization._id }).populate('responseTypeId').sort({ index: 1 })
            var response = incidentPriorities.map((record) => {
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
            message: 'Incident priorities updated successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};