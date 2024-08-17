const { default: mongoose } = require('mongoose');
const ACTION_KEYS = require('../models/actionKeysModel');
const ACTION_LIST = require('../models/actionListModel');
const ORGANIZATION = require('../models/organizationModel');
const { compareObjects , isBoolean } = require('../utility/date');

exports.createActionList = async function (req, res, next) {
    try {
        if (!req.body.name) {
            throw new Error("name is required");
        } else if (!req.body.actionKeysId) {
            throw new Error("actionKeyId is required");
        }
        if (req.role === 'superAdmin') {
            const actionKey = await ACTION_KEYS.findOne({ _id: req.body.actionKeysId })
            if (!actionKey) {
                throw new Error("actionKey not found.");
            } else if (actionKey.isDeleted === true) {
                throw new Error("actionKey is already deleted.");
            }

            var getLastActionList = await ACTION_LIST.findOne({ isDeleted: false, organizationId: '', actionKeysId: actionKey._id }).sort({ index: -1 });
            var maxIndex = 1;

            if (getLastActionList) {
                maxIndex = getLastActionList.index + 1;
            }

            var actionList = await ACTION_LIST.create({
                actionKeysId: req.body.actionKeysId,
                organizationId: '',
                parentId: '',
                name: req.body.name,
                isDeleted: false,
                index: maxIndex
            })

            await ACTION_LIST.updateMany(
                { originalDataId: actionKey._id },
                { $set: { isUpdated: true } }
            );

        } else if (req.role === 'organization') {
            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            const actionKey = await ACTION_KEYS.findOne({ _id: req.body.actionKeysId, organizationId: organizationFind._id })
            if (!actionKey) {
                throw new Error("actionKey not created by your organization.");
            } else if (actionKey.isDeleted === true) {
                throw new Error("actionKey is already deleted.");
            }

            var getLastActionKey = await ACTION_LIST.findOne({ isDeleted: false, organizationId: organizationFind._id, actionKeysId: actionKey._id }).sort({ index: -1 });
            var maxIndex = 1;

            if (getLastActionKey) {
                maxIndex = getLastActionKey.index + 1;
            }

            var organization = new mongoose.Types.ObjectId(organizationFind.id);
            var actionList = await ACTION_LIST.create({
                actionKeysId: req.body.actionKeysId,
                organizationId: organization,
                parentId: '',
                name: req.body.name,
                isDeleted: false,
                index: maxIndex
            })

        } else {
            throw new Error("you can not access")
        }
        var response = {
            actionListId: actionList.id,
            actionKeyId: actionList.actionKeysId,
            organizationId: actionList.organizationId,
            parentId: actionList.parentId,
            name: actionList.name,
            isDeleted: actionList.isDeleted,
            createdAt: actionList.createdAt,
            updatedAt: actionList.updatedAt,
            index: actionList.index
        }
        res.status(200).json({
            status: 'success',
            message: 'Action List created successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};

exports.getActionList = async function (req, res, next) {
    try {
        var id = req.params.id
        if (req.role === 'superAdmin') {

            const actionKey = await ACTION_KEYS.findOne({ _id: id })
            if (!actionKey) {
                throw new Error('Action Key not found.')
            } else if (actionKey.isDeleted === true) {
                throw new Error('Action key is already deleted.')
            }
            var actionList = await ACTION_LIST.find({ actionKeysId: id, isDeleted: false }).sort({ index: 1 })
            var response = actionList.map((record) => {
                const obj = {
                    actionListId: record.id,
                    actionKeyId: record.actionKeysId,
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
        } else if (req.role === 'organization') {

            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            const actionKey = await ACTION_KEYS.findOne({ _id: id, organizationId: organizationFind._id })
            if (!actionKey) {
                throw new Error("actionKey not created by your organization.");
            } else if (actionKey.isDeleted === true) {
                throw new Error("actionKey is already deleted.");
            }
            var actionList = await ACTION_LIST.find({ actionKeysId: id, isDeleted: false }).sort({ index: 1 })
            var response = await Promise.all(
                actionList.map(async (record) => {

                    if (record.originalDataId) {

                        let originalActionList = await ACTION_LIST.findOne({ _id: record.originalDataId, isDeleted: false })
    
                        if (originalActionList) {
    
                            console.log(record, 'record')
                            console.log(originalActionList, 'originalActionList')
    
                            const keysToIgnore = ["_id", "actionKeysId", "organizationId", "index","createdAt", "updatedAt", "originalDataId", "isUpdated"];
    
                            const areEqual = await compareObjects(originalActionList, record, keysToIgnore);
                            let isMatch = areEqual ? true : false;
                            console.log(areEqual, "isUpdated")
                            console.log(isMatch,'isMatch')
                            if (isBoolean(isMatch) && record.isUpdated === true) {
                                record.isMatch = isMatch
                            } else {
                                record.isMatch = true
                            }
                            console.log(record.isMatch,'record updated')
                        }
                    }

                    const obj = {
                        actionListId: record.id,
                        actionKeyId: record.actionKeysId,
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
        } else if (req.role === 'fireFighter') {
            
            const actionKey = await ACTION_KEYS.findOne({ _id: id })
            if (!actionKey) {
                throw new Error('Action Key not found.')
            } else if (actionKey.isDeleted === true) {
                throw new Error('Action key is already deleted.')
            }

            var actionList = await ACTION_LIST.find({ actionKeysId: id, isDeleted: false })
            var response = actionList.map((record) => {
                const obj = {
                    actionListId: record.id,
                    actionKeyId: record.actionKeysId,
                    organizationId: record.organizationId,
                    parentId: record.parentId,
                    name: record.name,
                    isDeleted: record.isDeleted,
                    createdAt: record.createdAt,
                    updatedAt: record.updatedAt,
                    index: record.index
                }
                console.log(obj)
                return obj;
            }).sort({ index: 1 })

        } else {
            throw new Error("you can not access")
        }
        res.status(200).json({
            status: 'success',
            message: 'Action List get successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};

exports.updateActionList = async function (req, res, next) {
    try {
        var id = req.params.id;
        if (req.role === 'superAdmin') {
            const find = await ACTION_LIST.findOne({ _id: id })
            if (!find) {
                throw new Error('Action list not found.');
            } else if (find.isDeleted === true) {
                throw new Error('Action list is already deleted');
            }
            var actionList = await ACTION_LIST.findByIdAndUpdate(id, {
                name: req.body.name
            }, { new: true })
            var Find = await ACTION_LIST.findOne({ _id: id })
            //console.log(actionList);
            var response = {
                actionListId: Find.id,
                actionKeyId: Find.actionKeysId,
                organizationId: Find.organizationId,
                parentId: Find.parentId,
                name: Find.name,
                isDeleted: Find.isDeleted,
                createdAt: Find.createdAt,
                updatedAt: Find.updatedAt
            }

            await ACTION_LIST.updateMany(
                { originalDataId: id },
                { $set: { isUpdated: true } }
            );
        } else if (req.role === 'organization') {

            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            console.log("organizationFind", organizationFind);

            var actionListFind = await ACTION_LIST.findOne({ _id: id, organizationId: organizationFind._id })
            console.log("actionListFind", actionListFind);
            if (!actionListFind) {
                throw new Error("actionListFind not created by your organization.");
            } else if (actionListFind.isDeleted === true) {
                throw new Error("actionListFind is already deleted.");
            }

            var actionList = await ACTION_LIST.findByIdAndUpdate(id, {
                name: req.body.name
            }, { new: true })
            //var Find = await ACTION_LIST.findOne({_id : id})
            //console.log(actionList);
            var response = {
                actionListId: actionList.id,
                actionKeyId: actionList.actionKeysId,
                organizationId: actionList.organizationId,
                parentId: actionList.parentId,
                name: actionList.name,
                isDeleted: actionList.isDeleted,
                createdAt: actionList.createdAt,
                updatedAt: actionList.updatedAt
            }
        } else {
            throw new Error('you can not access.')
        }
        res.status(200).json({
            status: 'success',
            message: 'Action List updated successfully.',
            data: response
        });
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
}

exports.deleteActionList = async function (req, res, next) {
    try {
        var id = req.params.id;
        if (req.role === 'superAdmin') {
            const find = await ACTION_LIST.findOne({ _id: id })
            if (!find) {
                throw new Error('Action list not found.');
            } else if (find.isDeleted === true) {
                throw new Error('Action list is already deleted');
            }
            var actionList = await ACTION_LIST.findByIdAndUpdate(id, {
                isDeleted: true
            }, { new: true })
            var Find = await ACTION_LIST.findOne({ _id: id })
            //console.log(actionList);
            var response = {
                actionListId: Find.id,
                actionKeyId: Find.actionKeysId,
                name: Find.name,
                isDeleted: Find.isDeleted,
                createdAt: Find.createdAt,
                updatedAt: Find.updatedAt
            }
        } else if (req.role === 'organization') {
            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            console.log("organizationFind", organizationFind);

            var actionListFind = await ACTION_LIST.findOne({ _id: id, organizationId: organizationFind._id })
            console.log("actionListFind", actionListFind);
            if (!actionListFind) {
                throw new Error("actionListFind not created by your organization.");
            } else if (actionListFind.isDeleted === true) {
                throw new Error("actionListFind is already deleted.");
            }
            var actionList = await ACTION_LIST.findByIdAndUpdate(id, {
                isDeleted: true
            }, { new: true })
            var Find = await ACTION_LIST.findOne({ _id: id })
            //console.log(actionList);
            var response = {
                actionListId: Find.id,
                actionKeyId: Find.actionKeysId,
                name: Find.name,
                isDeleted: Find.isDeleted,
                createdAt: Find.createdAt,
                updatedAt: Find.updatedAt
            }
        } else {
            throw new Error('you can not access.')
        }
        res.status(200).json({
            status: 'success',
            message: 'Action List deleted successfully.',
            data: response
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
        var actionKeyId = req.params.id

        if (req.role === "superAdmin") {
            for (let index = 0; index < updateData.length; index++) {
                const element = updateData[index];
                var updateIndexResponseType = await ACTION_LIST.findByIdAndUpdate(element.actionListId, { index: element.index }, { new: true });
            }

            var actionKey = await ACTION_LIST.find({ isDeleted: false, actionKeysId: actionKeyId, organizationId: '' }).sort({ index: 1 })
            var response = actionKey.map((record) => {
                var obj = {
                    actionListId: record._id,
                    actionKeyId: record.actionKeysId,
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
                var updateIndexResponseType = await ACTION_LIST.findByIdAndUpdate(element.actionListId, { index: element.index }, { new: true });
            }

            var actionList = await ACTION_LIST.find({ isDeleted: false, organizationId: organizationFind._id }).sort({ index: 1 })
            var response = actionList.map((record) => {
                var obj = {
                    incidentTypeId: record.id,
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
            message: 'Action list update successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};