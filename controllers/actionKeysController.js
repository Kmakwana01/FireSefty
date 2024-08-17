var ACTION_KEYS = require('../models/actionKeysModel');
const RESPONSE_TYPE = require('../models/responseTypeModel');
const ORGANIZATION = require('../models/organizationModel');
const mongoose = require('mongoose');
const ACTION_LIST = require('../models/actionListModel');
const { compareObjects, isBoolean } = require('../utility/date');
const PROFILE = require('../models/profileModel');

exports.createActionKeys = async function (req, res, next) {
    try {
        // console.log(req.body ,"@@@@@@");
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
            if (req.file === null || req.file === '') {
                icon = '';
            } else {
                icon = req.file.filename;
            }
        } else {
            icon = '';
        }
        if (req.role === 'superAdmin') {
            const responseType = await RESPONSE_TYPE.findOne({ _id: req.body.responseTypeId });
            if (!responseType) {
                throw new Error("responseType not found");
            } else if (responseType.isDeleted === true) {
                throw new Error("responseType is already deleted");
            }

            var getLastActionKey = await ACTION_KEYS.findOne({ isDeleted: false, organizationId: '', responseTypeId: responseType._id }).sort({ index: -1 });
            var maxIndex = 1;

            if (getLastActionKey) {
                maxIndex = getLastActionKey.index + 1;
            }

            // UPDATE UPDATE UPDATE
            // const url = req.protocol + "://" + req.get("host") + "/images/" + req.file.filename;

            var actionKeys = await ACTION_KEYS.create({
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
        } else if (req.role === 'organization') {

            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            var responseType = await RESPONSE_TYPE.findOne({ _id: req.body.responseTypeId, organizationId: organizationFind._id })

            if (!responseType) {
                throw new Error("responseType not created by your organization.");
            } else if (responseType.isDeleted === true) {
                throw new Error("responseType is already deleted.");
            }

            var getLastActionKey = await ACTION_KEYS.findOne({ isDeleted: false, organizationId: organizationFind._id, responseTypeId: responseType._id }).sort({ index: -1 });
            var maxIndex = 1;

            if (getLastActionKey) {
                maxIndex = getLastActionKey.index + 1;
            }

            // const url = req.protocol + "://" + req.get("host") + "/images/" + req.file.filename;
            var organization = new mongoose.Types.ObjectId(organizationFind._id);

            var actionKeys = await ACTION_KEYS.create({
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
        } else {
            throw new Error('you can not access.')
        }
        const response = {
            actionKeyId: actionKeys.id,
            responseTypeId: actionKeys.responseTypeId,
            organizationId: actionKeys.organizationId,
            parentId: actionKeys.parentId,
            name: actionKeys.name,
            icon: actionKeys.icon,
            color: actionKeys.color,
            isDeleted: actionKeys.isDeleted,
            createdAt: actionKeys.createdAt,
            updatedAt: actionKeys.updatedAt,
            index: actionKeys.index

        }
        res.status(200).json({
            status: 'success',
            message: 'Action keys created successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};

exports.getActionKeys = async function (req, res, next) {
    try {
        var id = req.params.id
        if (req.role === 'superAdmin') {

            const responseType = await RESPONSE_TYPE.findOne({ _id: id })
            if (!responseType) {
                throw new Error('ResponseType not found.')
            } else if (responseType.isDeleted === true) {
                throw new Error('ResponseType is already deleted')
            }

            var actionKeys = await ACTION_KEYS.find({ responseTypeId: id, isDeleted: false }).sort({ index: 1 })
            if (!actionKeys) {
                throw new Error('ActionKeys not found.')
            }

        } else if (req.role === 'organization') {

            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            var responseType = await RESPONSE_TYPE.findOne({ _id: id, organizationId: organizationFind._id })
            if (!responseType) {
                throw new Error("responseType not created by your organization.");
            } else if (responseType.isDeleted === true) {
                throw new Error("responseType is already deleted.");
            }

            var actionKeys = await ACTION_KEYS.find({ responseTypeId: id, isDeleted: false }).sort({ index: 1 })
            if (!actionKeys) {
                throw new Error('Could not find action')
            }
        } else if (req.role === 'fireFighter') {

            let findProfile = await PROFILE.findOne({ userId : req.userId })

            const responseType = await RESPONSE_TYPE.findOne({ _id: id })
            if (!responseType) {
                throw new Error('ResponseType not found.')
            } else if (responseType.isDeleted === true) {
                throw new Error('ResponseType is already deleted')
            }

            var actionKeys = await ACTION_KEYS.find({ responseTypeId: id, organizationId : findProfile.organizationId , isDeleted: false }).sort({ index: 1 })
            if (!actionKeys) {
                throw new Error('ActionKeys not found.')
            }
        } else {
            throw new Error('you can not access.')
        }
        var response = await Promise.all(
            actionKeys.map(async (record) => {

                if (record.originalDataId) {

                    let originalActionKey = await ACTION_KEYS.findOne({ _id: record.originalDataId, isDeleted: false })

                    if (originalActionKey) {

                        console.log(record, 'record')
                        console.log(originalActionKey, 'originalActionKey')

                        const keysToIgnore = ["_id", "responseTypeId", "organizationId", "index","createdAt", "updatedAt", "originalDataId", "isUpdated"];

                        const areEqual = await compareObjects(originalActionKey, record, keysToIgnore);
                        let isMatch = areEqual ? true : false;
                        console.log(areEqual, "isUpdated")
                        console.log(isBoolean(isMatch) , record.isUpdated === true ,isMatch, 'check')

                        if (isBoolean(isMatch) && record.isUpdated === true) {
                            record.isMatch = isMatch
                        } else {
                            record.isMatch = true
                        }
                    }
                }

                const url = (record.icon === '' || record.icon === null) ? '' : req.protocol + "://" + req.get("host") + "/images/" + record.icon

                var obj = {
                    actionKeyId: record.id,
                    responseTypeId: record.responseTypeId,
                    organizationId: record.organizationId,
                    parentId: record.parentId,
                    name: record.name,
                    icon: url,
                    color: record.color,
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
        res.status(200).json({
            status: 'success',
            message: 'Action Key get successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};

exports.updateActionKeys = async function (req, res, next) {
    try {
        var id = req.params.id;

        if (req.role === 'superAdmin') {

            const find = await ACTION_KEYS.findOne({ _id: id });
            if (!find) {
                throw new Error('ActionKeys not found.')
            } else if (find.isDeleted === true) {
                throw new Error('ActionKeys is already deleted.')
            }
            if (req.file) {
                // var url = req.protocol + "://" + req.get("host") + "/images/" + req.file.filename;
                var icon;
                if (req.file === null) {
                    icon = ''
                } else {
                    icon = req.file.filename
                }
                var actionKey = await ACTION_KEYS.findByIdAndUpdate(id, {
                    name: req.body.name,
                    icon: icon,
                    color: req.body.color,
                }, { new: true });
            } else {
                var actionKey = await ACTION_KEYS.findByIdAndUpdate(id, {
                    name: req.body.name,
                    color: req.body.color,
                }, { new: true });
            }
            if (!actionKey) {
                throw new Error('Could not find action')
            }

            await ACTION_KEYS.updateMany(
                { originalDataId: id },
                { $set: { isUpdated: true } }
            );

        } else if (req.role === 'organization') {
            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            var actionKey = await ACTION_KEYS.findOne({ _id: id, organizationId: organizationFind._id })
            if (!actionKey) {
                throw new Error("actionKey not created by your organization.");
            } else if (actionKey.isDeleted === true) {
                throw new Error("actionKey is already deleted.");
            }
            // const url = req.protocol + "://" + req.get("host") + "/images/" + req.file.filename;

            if (req.file) {
                // var url = req.protocol + "://" + req.get("host") + "/images/" + req.file.filename;

                var icon;
                if (req.file === null) {
                    icon = ''
                } else {
                    icon = req.file.filename
                }

                var actionKey = await ACTION_KEYS.findByIdAndUpdate(id, {
                    name: req.body.name,
                    icon: icon,
                    color: req.body.color,
                }, { new: true });
            } else {
                var actionKey = await ACTION_KEYS.findByIdAndUpdate(id, {
                    name: req.body.name,
                    color: req.body.color,
                }, { new: true });
            }
            if (!actionKey) {
                throw new Error('Could not find action')
            }
        } else {
            throw new Error('you can not access.')
        }
        var response = {
            actionKeyId: actionKey.id,
            organizationId: actionKey.organizationId,
            parentId: actionKey.parentId,
            name: actionKey.name,
            icon: actionKey.icon,
            color: actionKey.color,
            createdAt: actionKey.createdAt,
            updatedAt: actionKey.updatedAt
        }

        res.status(200).json({
            status: 'success',
            message: 'Action Key update successfully.',
            data: response
        });
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};

exports.deleteActionKeys = async function (req, res, next) {
    try {
        var id = req.params.id;
        if (req.role === 'superAdmin') {

            const action = await ACTION_KEYS.findOne({ _id: id })
            if (!action) {
                throw new Error('ActionKey not found')
            } else if (action.isDeleted === true) {
                throw new Error('ActionKey already deleted.')
            }
            var actionKey = await ACTION_KEYS.findByIdAndUpdate(id, {
                isDeleted: true
            })
            if (!actionKey) {
                throw new Error('Could not find action')
            }
            // var actionList = await ACTION_LIST.updateMany({actionKeysId : id},{isDeleted: true})
        } else if (req.role === 'organization') {

            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            var actionKey = await ACTION_KEYS.findOne({ _id: id, organizationId: organizationFind._id })
            if (!actionKey) {
                throw new Error("actionKey not created by your organization.");
            } else if (actionKey.isDeleted === true) {
                throw new Error("actionKey is already deleted.");
            }

            var actionKey = await ACTION_KEYS.findByIdAndUpdate(id, {
                isDeleted: true
            })
            if (!actionKey) {
                throw new Error('Could not find action')
            }
        } else {
            throw new Error('you can not access')
        }
        res.status(200).json({
            status: 'success',
            message: 'Action Key deleted successfully.'
        });
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
        console.log(updateData, "updateData")

        if (req.role === "superAdmin") {

            for (let index = 0; index < updateData.length; index++) {
                // console.log('UPDATE', updateData[index]);
                const element = updateData[index];
                var updateIndexResponseType = await ACTION_KEYS.findByIdAndUpdate(element.actionKeyId, { index: element.index }, { new: true });
            }

            var actionKey = await ACTION_KEYS.find({ isDeleted: false, responseTypeId: responseTypeId, organizationId: '' }).populate('responseTypeId').sort({ index: 1 })
            var response = actionKey.map((record) => {
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
            console.log('?????')

            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            // console.log(organizationFind,"####");
            if (!organizationFind) {
                throw new Error("Organization not found.")
            }
            var organization = new mongoose.Types.ObjectId(organizationFind._id)
            // console.log("ORGANIZATION--", organization._id.toString())

            for (let index = 0; index < updateData.length; index++) {
                console.log('UPDATE', updateData[index]);
                const element = updateData[index];
                var updateIndexResponseType = await ACTION_KEYS.findByIdAndUpdate(element.actionKeyId, { index: element.index }, { new: true });
            }

            var actionKey = await ACTION_KEYS.find({ isDeleted: false, responseTypeId: responseTypeId, organizationId: organization._id }).populate('responseTypeId').sort({ index: 1 })
            console.log('running=====', actionKey);

            var response = actionKey.map((record) => {
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
            message: 'Action keys update successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};