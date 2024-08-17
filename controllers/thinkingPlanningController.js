const THINKING_PLANNING = require('../models/thinkingPlanningModel')
const THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST = require('../models/thinkingPlaningSelectAnswerTypeListModel');
const THINKING_PLANNING_TEXT = require('../models/thinkingPlanningTextModel');
const RESPONSE_TYPE = require('../models/responseTypeModel');
const INCIDENT_PRIORITIES = require('../models/incidentPrioritiesModel');
const OBJECTIVES = require('../models/objectivesModel');
const ORGANIZATION = require('../models/organizationModel');
const { compareObjects, isBoolean } = require('../utility/date');
const PROFILE = require('../models/profileModel')

exports.createThinkingPlanning = async function (req, res) {
    try {
        var responseTypeId = req.body.responseTypeId;
        var incidentPrioritiesId = req.body.incidentPrioritiesId;
        var objectivesId = req.body.objectivesId;
        if (!responseTypeId) {
            throw new Error("responseTypeId is required.");
        } else if (!incidentPrioritiesId) {
            throw new Error("incidentPrioritiesId is required.");
        } else if (!objectivesId) {
            throw new Error("objectivesId is required.");
        } else if (!req.body.name) {
            throw new Error("name is required.");
        }
        console.log("ROLE : -", req.role);


        if (req.role === "superAdmin") {

            var responseType = await RESPONSE_TYPE.findOne({ _id: responseTypeId })
            if (!responseType) {
                throw new Error("responseType not found.");
            } else if (responseType.isDeleted === true) {
                throw new Error("responseType is already deleted.");
            }
            var incidentPriorities = await INCIDENT_PRIORITIES.findOne({ _id: incidentPrioritiesId })
            if (!incidentPriorities) {
                throw new Error("incidentPriorities not found.");
            } else if (incidentPriorities.isDeleted === true) {
                throw new Error("incidentPriorities is already deleted.");
            }
            var objectives = await OBJECTIVES.findOne({ _id: objectivesId })
            if (!objectives) {
                throw new Error("objectives not found.");
            } else if (objectives.isDeleted === true) {
                throw new Error("objectives is already deleted.");
            }
            var thinkingPlanning = await THINKING_PLANNING.create({
                responseTypeId: req.body.responseTypeId,
                incidentPrioritiesId: req.body.incidentPrioritiesId,
                objectivesId: req.body.objectivesId,
                organizationId: null,
                parentId: null,
                name: req.body.name || null,
                selectAnswerType: req.body.selectAnswerType || null,
                selectSliderType: req.body.selectSliderType || null,
                // selectNumberOfSliders:  req.body.selectNumberOfSliders,  //
                publish: req.body.publish || false,
                isDeleted: false,
                isPriorityType: req.body.priorityType || false,
                isUpdated: false
            });
            // console.log("thinkingPlanning", thinkingPlanning);
            if (req.body.selectAnswerType === 'list') {
                if (!req.body.sliderTypes) {
                    throw new Error("You must select SliderTypes")
                }
                var addSliderTypesArray = [];
                var sliderTypes = req.body.sliderTypes;
                for (let index = 0; index < sliderTypes.length; index++) {
                    const element = sliderTypes[index];
                    var addSliderTypeCreate = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.create({
                        thinkingPlanningId: thinkingPlanning.id,
                        name: element.name,
                        position: element.position,
                        actualPriority: element.actualPriority,
                        isDeleted: false
                    })
                    addSliderTypesArray.push(addSliderTypeCreate);
                }

            }
            else if (req.body.selectAnswerType === 'ratingScale') {
                if (!req.body.selectSliderType) {
                    throw new Error("Please enter a selectSliderType")
                }
                if (req.body.selectSliderType === 'numeric') {
                    if (!req.body.selectNumberOfSliders) {
                        throw new Error("please enter a selectNumberOfSliders")
                    }
                    if (req.body.selectNumberOfSliders === 'singleSlider') {
                        if (!req.body.minimumValue) {
                            throw new Error("Please enter a minimum value")
                        } else if (!req.body.maximumValue) {
                            throw new Error("Please enter a maximum value")
                        }
                        var thinkingPlanning = await THINKING_PLANNING.findByIdAndUpdate(thinkingPlanning.id, {
                            minimumValue: req.body.minimumValue,
                            maximumValue: req.body.maximumValue,
                            selectNumberOfSliders: req.body.selectNumberOfSliders
                        });
                    } else if (req.body.selectNumberOfSliders === 'twoSlider') {
                        if (!req.body.minimumValue) {
                            throw new Error("Please enter a minimum value")
                        } else if (!req.body.maximumValue) {
                            throw new Error("Please enter a maximum value")
                        } else if (!req.body.minimumValue1) {
                            throw new Error("Please enter a minimum value")
                        } else if (!req.body.maximumValue1) {
                            throw new Error("Please enter a maximum value")
                        }
                        var thinkingPlanning = await THINKING_PLANNING.findByIdAndUpdate(thinkingPlanning.id, {
                            minimumValue: req.body.minimumValue,
                            maximumValue: req.body.maximumValue,
                            minimumValue1: req.body.minimumValue1,
                            maximumValue1: req.body.maximumValue1,
                            selectNumberOfSliders: req.body.selectNumberOfSliders
                        });
                    }
                } else if (req.body.selectSliderType === 'text') {

                    var texts = req.body.texts;
                    var textsArray = [];
                    if (req.body.selectNumberOfSliders === 'singleSlider') {
                        // console.log('req.body.texts :>> ', req.body.texts);
                        if (!req.body.texts) {
                            throw new Error("Please enter the texts")
                        }
                        var thinkingPlanning = await THINKING_PLANNING.findByIdAndUpdate(thinkingPlanning.id, {
                            // selectNumberOfSliders:  null,
                            selectNumberOfSliders: req.body.selectNumberOfSliders,
                        });
                        for (let index = 0; index < texts.length; index++) {
                            const element = texts[index];
                            var textCreate = await THINKING_PLANNING_TEXT.create({
                                thinkingPlanningId: thinkingPlanning.id,
                                slider: element.slider || null,
                                position: element.position || null,
                                text: element.text,
                                isDeleted: false
                            })
                            textsArray.push(textCreate);
                        }
                    } else if (req.body.selectNumberOfSliders === 'twoSlider') {
                        var thinkingPlanning = await THINKING_PLANNING.findByIdAndUpdate(thinkingPlanning.id, {
                            // selectNumberOfSliders:  null,
                            selectNumberOfSliders: req.body.selectNumberOfSliders,
                        });
                        var textsArray1 = [];
                        var texts1 = req.body.texts1;
                        if (!texts1) {
                            throw new Error("please enter the texts1")
                        }
                        for (let index = 0; index < texts1.length; index++) {
                            const element = texts1[index];
                            var textCreate = await THINKING_PLANNING_TEXT.create({
                                thinkingPlanningId: thinkingPlanning.id,
                                slider: element.slider,
                                position: element.position,
                                text: element.text,
                                isDeleted: false
                            })
                            textsArray.push(textCreate);
                        }
                        for (let index = 0; index < texts.length; index++) {
                            const element = texts[index];
                            var textCreate = await THINKING_PLANNING_TEXT.create({
                                thinkingPlanningId: thinkingPlanning.id,
                                slider: element.slider,
                                position: element.position,
                                text: element.text,
                                isDeleted: false
                            })
                            textsArray1.push(textCreate);
                        }
                    }
                }
            }

            var ARRAYS = { textsArray, textsArray1 }

            var FIND = await THINKING_PLANNING.findById(thinkingPlanning.id)

            var response =
            {
                thinkingPlanningId: FIND.id,
                responseTypeId: FIND.responseTypeId,
                incidentPrioritiesId: FIND.incidentPrioritiesId,
                objectivesId: FIND.objectivesId,
                organizationId: FIND.organizationId,
                parentId: FIND.parentId,
                name: FIND.name,
                selectAnswerType: FIND.selectAnswerType,
                selectSliderType: FIND.selectSliderType,
                selectNumberOfSliders: FIND.selectNumberOfSliders,
                minimumValue: FIND.minimumValue,
                maximumValue: FIND.maximumValue,
                minimumValue1: FIND.minimumValue1,
                maximumValue1: FIND.maximumValue1,
                addSliderTypes: addSliderTypesArray,
                texts: ARRAYS,
                publish: FIND.publish,
                priorityType: FIND.isPriorityType,
                isDeleted: FIND.isDeleted,
                createdAt: FIND.createdAt,
                updatedAt: FIND.updatedAt,
            }

        } else if (req.role === 'organization') {


            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            var responseType = await RESPONSE_TYPE.findOne({ _id: responseTypeId, organizationId: organizationFind._id })
            if (!responseType) {
                throw new Error("responseType not created by your organization.");
            } else if (responseType.isDeleted === true) {
                throw new Error("responseType is already deleted.");
            }
            var incidentPriorities = await INCIDENT_PRIORITIES.findOne({ _id: incidentPrioritiesId, organizationId: organizationFind._id })
            if (!incidentPriorities) {
                throw new Error("incidentPriorities not created by your organization.");
            } else if (incidentPriorities.isDeleted === true) {
                throw new Error("incidentPriorities is already deleted.");
            }

            var objectives = await OBJECTIVES.findOne({ _id: objectivesId, organizationId: organizationFind._id })
            if (!objectives) {
                throw new Error("objectives not created by your organization.")
            } else if (objectives.isDeleted === true) {
                throw new Error("Objectives is already deleted.")
            }


            var thinkingPlanning = await THINKING_PLANNING.create({
                responseTypeId: req.body.responseTypeId,
                incidentPrioritiesId: req.body.incidentPrioritiesId,
                objectivesId: req.body.objectivesId,
                organizationId: organizationFind.id,
                parentId: null,
                name: req.body.name || null,
                selectAnswerType: req.body.selectAnswerType || null,
                selectSliderType: req.body.selectSliderType || null,
                // selectNumberOfSliders: req.body.selectNumberOfSliders, //
                publish: req.body.publish || false,
                isDeleted: false,
                isPriorityType: req.body.priorityType || false,
                isUpdated: false
            });

            if (req.body.selectAnswerType === 'list') {

                // var addSliderTypes = req.body.addSliderTypes || [];
                if (!req.body.sliderTypes) {
                    throw new Error("You must select SliderTypes")
                }
                var addSliderTypesArray = [];

                // for (const addSliderType of addSliderTypes) {
                //     var addSliderTypeCreate = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.create({
                //         thinkingPlanningId : thinkingPlanning.id,
                //         addSliderType : addSliderType,
                //         isDeleted : false
                //     })
                //     addSliderTypesArray.push(addSliderTypeCreate);
                //     }

                var sliderTypes = req.body.sliderTypes;
                for (let index = 0; index < sliderTypes.length; index++) {
                    const element = sliderTypes[index];
                    var addSliderTypeCreate = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.create({
                        thinkingPlanningId: thinkingPlanning._id,
                        name: element.name,
                        position: element.position,
                        actualPriority: element.actualPriority,
                        isDeleted: false
                    })
                    addSliderTypesArray.push(addSliderTypeCreate);
                }

            }
            else if (req.body.selectAnswerType === 'ratingScale') {
                if (!req.body.selectSliderType) {
                    throw new Error("Please enter a selectSliderType")
                }
                if (req.body.selectSliderType === 'numeric') {
                    if (!req.body.selectNumberOfSliders) {
                        throw new Error("Please enter a selectNumberOfSliders")
                    }
                    if (req.body.selectNumberOfSliders === 'singleSlider') {
                        if (!req.body.minimumValue) {
                            throw new Error("Please enter a minimum value")
                        } else if (!req.body.maximumValue) {
                            throw new Error("Please enter a maximum value")
                        }
                        var thinkingPlanning = await THINKING_PLANNING.findByIdAndUpdate(thinkingPlanning._id, {
                            minimumValue: req.body.minimumValue,
                            maximumValue: req.body.maximumValue,
                            selectNumberOfSliders: req.body.selectNumberOfSliders,  //
                        });
                    } else if (req.body.selectNumberOfSliders === 'twoSlider') {
                        if (!req.body.minimumValue) {
                            throw new Error("Please enter a minimum value")
                        } else if (!req.body.maximumValue) {
                            throw new Error("Please enter a maximum value")
                        } else if (!req.body.minimumValue1) {
                            throw new Error("Please enter a minimum value")
                        } else if (!req.body.maximumValue1) {
                            throw new Error("Please enter a maximum value")
                        }
                        var thinkingPlanning = await THINKING_PLANNING.findByIdAndUpdate(thinkingPlanning.id, {
                            minimumValue: req.body.minimumValue,
                            maximumValue: req.body.maximumValue,
                            minimumValue1: req.body.minimumValue1,
                            maximumValue1: req.body.maximumValue1,
                            selectNumberOfSliders: req.body.selectNumberOfSliders,  //
                        });
                    }
                } else if (req.body.selectSliderType === 'text') {
                    var texts = req.body.texts;
                    var textsArray = [];
                    if (req.body.selectNumberOfSliders === 'singleSlider') {
                        if (!req.body.texts) {
                            throw new Error("Please enter a texts")
                        }
                        for (let index = 0; index < texts.length; index++) {
                            const element = texts[index];
                            var textCreate = await THINKING_PLANNING_TEXT.create({
                                thinkingPlanningId: thinkingPlanning.id,
                                slider: element.slider,
                                position: element.position,
                                text: element.text,
                                isDeleted: false
                            })
                            textsArray.push(textCreate);
                        }
                    } else if (req.body.selectNumberOfSliders === 'twoSlider') {
                        var textsArray1 = [];
                        var texts1 = req.body.texts1;
                        if (!req.body.texts1) {
                            throw new Error("Please enter a texts")
                        }
                        for (let index = 0; index < texts1.length; index++) {
                            const element = texts1[index];
                            var textCreate = await THINKING_PLANNING_TEXT.create({
                                thinkingPlanningId: thinkingPlanning.id,
                                slider: element.slider,
                                position: element.position,
                                text: element.text,
                                isDeleted: false
                            })
                            textsArray.push(textCreate);
                        }
                        for (let index = 0; index < texts.length; index++) {
                            const element = texts[index];
                            var textCreate = await THINKING_PLANNING_TEXT.create({
                                thinkingPlanningId: thinkingPlanning.id,
                                slider: element.slider,
                                position: element.position,
                                text: element.text,
                                isDeleted: false
                            })
                            textsArray1.push(textCreate);
                        }
                    }
                }
            }

            var ARRAYS = { textsArray, textsArray1 }

            var FIND = await THINKING_PLANNING.findById(thinkingPlanning.id)

            var response =
            {
                thinkingPlanningId: FIND.id,
                responseTypeId: FIND.responseTypeId,
                incidentPrioritiesId: FIND.incidentPrioritiesId,
                objectivesId: FIND.objectivesId,
                organizationId: FIND.organizationId,
                parentId: FIND.parentId,
                name: FIND.name,
                selectAnswerType: FIND.selectAnswerType,
                selectSliderType: FIND.selectSliderType,
                selectNumberOfSliders: FIND.selectNumberOfSliders,
                minimumValue: FIND.minimumValue,
                maximumValue: FIND.maximumValue,
                minimumValue1: FIND.minimumValue1,
                maximumValue1: FIND.maximumValue1,
                addSliderTypes: addSliderTypesArray,
                texts: ARRAYS,
                publish: FIND.publish,
                priorityType: FIND.isPriorityType,
                isDeleted: FIND.isDeleted,
                createdAt: FIND.createdAt,
                updatedAt: FIND.updatedAt,
            }
        } else {
            throw new Error("you can not access")
        }
        res.status(200).json({
            status: 'success',
            message: 'Thinking Planning created successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};

exports.getThinkingPlanning = async function (req, res) {
    try {
        var id = req.params.id
        console.log("ROLE : -", req.role);
        if (req.role === 'superAdmin') {
            console.log(id, "objectiveId")
            var thinkingPlanning = await THINKING_PLANNING.find({ objectivesId: id, isDeleted: false })
            // console.log("thinkingPlanning : -", thinkingPlanning);
            if (!thinkingPlanning) {
                throw new Error('Could not find thinkingPlanning')
            }

            var response = await Promise.all(
                thinkingPlanning.map(async (record) => {
                    var addSliderType = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.find({ thinkingPlanningId: record.id, isDeleted: false });
                    // console.log("addSliderType : -", addSliderType);

                    var texts = await THINKING_PLANNING_TEXT.find({ thinkingPlanningId: record.id, isDeleted: false })
                    // console.log("texts : -", texts);
                    var obj = {
                        thinkingPlanningId: record.id,
                        responseTypeId: record.responseTypeId,
                        incidentPrioritiesId: record.incidentPrioritiesId,
                        objectivesId: record.objectivesId,
                        organizationId: record.organizationId,
                        parentId: record.parentId,
                        name: record.name || null,
                        publish: record.publish,
                        addSliderType: addSliderType || null,
                        selectAnswerType: record.selectAnswerType || null,
                        selectSliderType: record.selectSliderType || null,
                        selectNumberOfSliders: record.selectNumberOfSliders || null,
                        minimumValue: record.minimumValue || null,
                        maximumValue: record.maximumValue || null,
                        minimumValue1: record.minimumValue1 || null,
                        maximumValue1: record.maximumValue1 || null,
                        texts: texts || null,
                        priorityType: record.isPriorityType || false,
                        isDeleted: record.isDeleted || null,
                        createdAt: record.createdAt || null,
                        updatedAt: record.updatedAt || null
                    }
                    return obj;
                })
            )
        } else if (req.role === 'organization') {

            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            var objectives = await OBJECTIVES.findOne({ _id: id, organizationId: organizationFind._id })
            if (!objectives) {
                throw new Error("objectives not created by your organization.");
            } else if (objectives.isDeleted === true) {
                throw new Error("objectives is already deleted.");
            }

            var thinkingPlanning = await THINKING_PLANNING.find({ objectivesId: id, isDeleted: false })
            // console.log("thinkingPlanning : -", thinkingPlanning);

            var response = await Promise.all(
                thinkingPlanning.map(async (record) => {

                    var addSliderType = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.find({ thinkingPlanningId: record._id, isDeleted: false });
                    // console.log("addSliderType : -", addSliderType);

                    let texts = await THINKING_PLANNING_TEXT.find({ thinkingPlanningId: record._id, isDeleted: false })
                    // console.log("texts : -", texts);
                    // console.log("start",record,":::::");

                    var obj = {
                        thinkingPlanningId: record._id,
                        responseTypeId: record.responseTypeId,
                        incidentPrioritiesId: record.incidentPrioritiesId,
                        objectivesId: record.objectivesId,
                        organizationId: record.organizationId,
                        parentId: record.parentId,
                        name: record.name || null,
                        publish: record.publish,
                        addSliderType: addSliderType || null,
                        selectAnswerType: record.selectAnswerType || null,
                        selectSliderType: record.selectSliderType || null,
                        selectNumberOfSliders: record.selectNumberOfSliders || null,
                        minimumValue: record.minimumValue || null,
                        maximumValue: record.maximumValue || null,
                        minimumValue1: record.minimumValue1 || null,
                        maximumValue1: record.maximumValue1 || null,
                        texts: texts || null,
                        priorityType: record.isPriorityType || false,
                        isDeleted: record.isDeleted || null,
                        createdAt: record.createdAt || null,
                        updatedAt: record.updatedAt || null,
                        originalDataId: record?.originalDataId || null,
                        isMatch: isBoolean(record?.isMatch) ? record.isMatch : null
                    }

                    if (record.originalDataId) {

                        let originalThinkingPlanning = await THINKING_PLANNING.findOne({ _id: record.originalDataId, isDeleted: false })

                        if (originalThinkingPlanning) {

                            let addSliderType = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.find({ thinkingPlanningId: originalThinkingPlanning._id, isDeleted: false });
                            let texts = await THINKING_PLANNING_TEXT.find({ thinkingPlanningId: originalThinkingPlanning._id, isDeleted: false })

                            let originalDataResponse = {
                                thinkingPlanningId: originalThinkingPlanning._id,
                                responseTypeId: originalThinkingPlanning.responseTypeId,
                                incidentPrioritiesId: originalThinkingPlanning.incidentPrioritiesId,
                                objectivesId: originalThinkingPlanning.objectivesId,
                                organizationId: originalThinkingPlanning.organizationId,
                                parentId: originalThinkingPlanning.parentId,
                                name: originalThinkingPlanning.name || null,
                                publish: originalThinkingPlanning.publish,
                                addSliderType: addSliderType || null,
                                selectAnswerType: originalThinkingPlanning.selectAnswerType || null,
                                selectSliderType: originalThinkingPlanning.selectSliderType || null,
                                selectNumberOfSliders: originalThinkingPlanning.selectNumberOfSliders || null,
                                minimumValue: originalThinkingPlanning.minimumValue || null,
                                maximumValue: originalThinkingPlanning.maximumValue || null,
                                minimumValue1: originalThinkingPlanning.minimumValue1 || null,
                                maximumValue1: originalThinkingPlanning.maximumValue1 || null,
                                texts: texts || null,
                                priorityType: originalThinkingPlanning.isPriorityType || false,
                                isDeleted: originalThinkingPlanning.isDeleted || null,
                                createdAt: originalThinkingPlanning.createdAt || null,
                                updatedAt: originalThinkingPlanning.updatedAt || null,
                                originalDataId: originalThinkingPlanning?.originalDataId || null,
                            }

                            const keysToIgnore = ["_id", "thinkingPlanningId", "incidentPrioritiesId", "objectivesId", "organizationId", "originalDataId", "originalDataId", "createdAt", "updatedAt", "isUpdated", "isMatch", "position"];

                            const areEqual = await compareObjects(originalDataResponse, obj, keysToIgnore);
                            let isMatch = areEqual ? true : false;
                            console.log(areEqual, "isUpdated")

                            if (isBoolean(isMatch) && record.isUpdated === true) {
                                record.isMatch = isMatch
                            } else {
                                record.isMatch = true
                            }
                        }
                    }
                    console.log(record.isMatch, "isMatch")
                    obj.isMatch = record.isMatch
                    return obj;
                })
            )
        } else if (req.role === 'fireFighter') {
            
            let findProfile = await PROFILE.findOne({ userId : req.userId })
            var thinkingPlanning = await THINKING_PLANNING.find({ objectivesId: id, isDeleted: false, publish: true , organizationId : findProfile.organizationId})
            // console.log("thinkingPlanning : -", thinkingPlanning);
            if (!thinkingPlanning) {
                throw new Error('Could not find thinkingPlanning')
            }

            var response = await Promise.all(
                thinkingPlanning.map(async (record) => {
                    var addSliderType = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.find({ thinkingPlanningId: record.id, isDeleted: false });
                    // console.log("addSliderType : -", addSliderType);

                    var texts = await THINKING_PLANNING_TEXT.find({ thinkingPlanningId: record.id, isDeleted: false })
                    // console.log("texts : -", texts);

                    var obj = {
                        thinkingPlanningId: record.id,
                        responseTypeId: record.responseTypeId,
                        incidentPrioritiesId: record.incidentPrioritiesId,
                        objectivesId: record.objectivesId,
                        organizationId: record.organizationId,
                        parentId: record.parentId,
                        name: record.name || null,
                        publish: record.publish,
                        addSliderType: addSliderType || null,
                        selectAnswerType: record.selectAnswerType || null,
                        selectSliderType: record.selectSliderType || null,
                        selectNumberOfSliders: record.selectNumberOfSliders || null,
                        minimumValue: record.minimumValue || null,
                        maximumValue: record.maximumValue || null,
                        minimumValue1: record.minimumValue1 || null,
                        maximumValue1: record.maximumValue1 || null,
                        texts: texts || null,
                        priorityType: record.isPriorityType || false,
                        isDeleted: record.isDeleted || null,
                        createdAt: record.createdAt || null,
                        updatedAt: record.updatedAt || null,
                    }
                    return obj;
                })
            )
        } else {
            throw new Error("you can not access")
        }

        res.status(200).json({
            status: 'success',
            message: 'Thinking and Planning get successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};

exports.updateThinkingPlanning = async function (req, res) {
    try {
        // console.log(req.body, "{{{{{");
        var id = req.params.id
        if (req.role === 'superAdmin') {

            const find = await THINKING_PLANNING.findOne({ _id: id })
            if (!find) {
                throw new Error('thinking planning not found.')
            } else if (find.isDeleted === true) {
                throw new Error('thinking planning already deleted.')
            }
            var thinkingPlanning = await THINKING_PLANNING.findByIdAndUpdate(id, {
                name: req.body.name,
                publish: req.body.publish,
                isDeleted: false,
                isPriorityType: req.body.priorityType || false,
                selectNumberOfSliders: req.body.selectNumberOfSliders,
                selectSliderType: req.body.selectSliderType,
                selectAnswerType: req.body.selectAnswerType,
            }, { new: true });

            if (req.body.selectAnswerType === 'list') {

                var thinkingPlanning = await THINKING_PLANNING.findByIdAndUpdate(thinkingPlanning.id, {
                    minimumValue: null,
                    maximumValue: null,
                    minimumValue1: null,
                    maximumValue1: null,
                    isPriorityType: req.body.priorityType || false,
                }, { new: true });
                // console.log("thinkingPlanning", thinkingPlanning);
                var textDelete = await THINKING_PLANNING_TEXT.deleteMany({ thinkingPlanningId: thinkingPlanning.id })
                var addSliderTypesArray = [];

                var deleteSliderTypes = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.deleteMany({ thinkingPlanningId: thinkingPlanning.id })
                // console.log("deleteSliderTypes", deleteSliderTypes);
                var sliderTypes = req.body.sliderTypes;
                for (let index = 0; index < sliderTypes.length; index++) {
                    const element = sliderTypes[index];
                    var addSliderTypeCreate = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.create({
                        thinkingPlanningId: thinkingPlanning._id,
                        name: element.name,
                        position: element.position,
                        actualPriority: element.actualPriority,
                        isDeleted: false
                    })
                    addSliderTypesArray.push(addSliderTypeCreate);
                }

            }
            else if (req.body.selectAnswerType === 'ratingScale') {
                var deleteSliderTypes = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.deleteMany({ thinkingPlanningId: thinkingPlanning._id })
                if (req.body.selectSliderType === 'numeric') {
                    if (req.body.selectNumberOfSliders === 'singleSlider') {
                        var thinkingPlanning = await THINKING_PLANNING.findByIdAndUpdate(thinkingPlanning.id, {
                            minimumValue: req.body.minimumValue,
                            maximumValue: req.body.maximumValue,
                            selectAnswerType: req.body.selectAnswerType,
                            selectNumberOfSliders: req.body.selectNumberOfSliders,
                            selectSliderType: req.body.selectSliderType
                        }, { new: true });
                        // console.log("thinkingPlanning", thinkingPlanning);
                        await THINKING_PLANNING_TEXT.deleteMany({ thinkingPlanningId: thinkingPlanning._id })
                    } else if (req.body.selectNumberOfSliders === 'twoSlider') {


                        var thinkingPlanning = await THINKING_PLANNING.findByIdAndUpdate(thinkingPlanning.id, {
                            minimumValue: req.body.minimumValue,
                            maximumValue: req.body.maximumValue,
                            minimumValue1: req.body.minimumValue1,
                            maximumValue1: req.body.maximumValue1,
                            selectAnswerType: req.body.selectAnswerType,
                            selectNumberOfSliders: req.body.selectNumberOfSliders,
                            selectSliderType: req.body.selectSliderType
                        }, { new: true });
                        // console.log("thinkingPlanning", thinkingPlanning);

                    }
                } else if (req.body.selectSliderType === "text") {

                    await THINKING_PLANNING.findByIdAndUpdate(thinkingPlanning.id, {
                        minimumValue: null,
                        maximumValue: null,
                        minimumValue1: null,
                        maximumValue1: null,
                        selectAnswerType: req.body.selectAnswerType,
                        selectNumberOfSliders: req.body.selectNumberOfSliders,
                        selectSliderType: req.body.selectSliderType
                    }, { new: true });

                    var texts = req.body.texts;
                    var textsArray = [];

                    if (req.body.selectNumberOfSliders === "singleSlider") {
                        var deleteSliderTypes = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.deleteMany({ thinkingPlanningId: thinkingPlanning._id })

                        var textDelete = await THINKING_PLANNING_TEXT.deleteMany({ thinkingPlanningId: thinkingPlanning._id })
                        // console.log("textDelete", textDelete);

                        for (let index = 0; index < texts.length; index++) {
                            const element = texts[index];
                            var textCreate = await THINKING_PLANNING_TEXT.create({
                                thinkingPlanningId: thinkingPlanning._id,
                                position: element.position,
                                slider: element.slider,
                                text: element.text,
                                isDeleted: false
                            })
                            // console.log("textCreate", textCreate);
                            textsArray.push(textCreate);
                        }
                    } else if (req.body.selectNumberOfSliders === "twoSlider") {
                        var thinkingPlanning = await THINKING_PLANNING.findByIdAndUpdate(thinkingPlanning._id, {
                            minimumValue: null,
                            maximumValue: null,
                            minimumValue1: null,
                            maximumValue1: null,
                            selectNumberOfSliders: req.body.selectNumberOfSliders,
                            selectSliderType: req.body.selectSliderType
                        }, { new: true });
                        var deleteSliderTypes = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.deleteMany({ thinkingPlanningId: thinkingPlanning._id })

                        var textDelete = await THINKING_PLANNING_TEXT.deleteMany({ thinkingPlanningId: thinkingPlanning._id })

                        var textsArray1 = [];
                        var texts1 = req.body.texts1;
                        for (let index = 0; index < texts1.length; index++) {
                            const element = texts1[index];
                            var textCreate = await THINKING_PLANNING_TEXT.create({
                                thinkingPlanningId: thinkingPlanning._id,
                                slider: element.slider,
                                position: element.position,
                                text: element.text,
                                isDeleted: false
                            })
                            textsArray.push(textCreate);
                        }
                        for (let index = 0; index < texts.length; index++) {
                            const element = texts[index];
                            var textCreate = await THINKING_PLANNING_TEXT.create({
                                thinkingPlanningId: thinkingPlanning._id,
                                slider: element.slider,
                                position: element.position,
                                text: element.text,
                                isDeleted: false
                            })
                            textsArray1.push(textCreate);
                        }
                    }
                }
            }


            // console.log("textsArray", textsArray);
            var FIND = await THINKING_PLANNING.findById(thinkingPlanning._id)
            var findAddSliderType = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.find({ thinkingPlanningId: thinkingPlanning._id });
            var findText = await THINKING_PLANNING_TEXT.find({ thinkingPlanningId: thinkingPlanning._id })



            var response =
            {
                thinkingPlanningId: FIND._id,
                responseTypeId: FIND.responseTypeId,
                incidentPrioritiesId: FIND.incidentPrioritiesId,
                objectivesId: FIND.objectivesId,
                organizationId: FIND.organizationId,
                parentId: FIND.parentId,
                name: FIND.name,
                selectAnswerType: FIND.selectAnswerType,
                selectSliderType: FIND.selectSliderType,
                selectNumberOfSliders: FIND.selectNumberOfSliders,
                minimumValue: FIND.minimumValue,
                maximumValue: FIND.maximumValue,
                minimumValue1: FIND.minimumValue1,
                maximumValue1: FIND.maximumValue1,
                addSliderTypes: findAddSliderType,
                texts: findText,
                publish: FIND.publish,
                priorityType: FIND.isPriorityType,
                isDeleted: FIND.isDeleted,
                createdAt: FIND.createdAt,
                updatedAt: FIND.updatedAt,
            }

            await THINKING_PLANNING.updateMany(
                { originalDataId: id },
                { $set: { isUpdated: true } }
            );

        } else if (req.role === 'organization') {

            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            var thinkingPlanning = await THINKING_PLANNING.findOne({ _id: id, organizationId: organizationFind._id })
            if (!thinkingPlanning) {
                throw new Error("thinkingPlanning not created by your organization.");
            } else if (thinkingPlanning.isDeleted === true) {
                throw new Error("thinkingPlanning is already deleted.");
            }


            var thinkingPlanning = await THINKING_PLANNING.findByIdAndUpdate(id, {
                name: req.body.name,
                publish: req.body.publish,
                isDeleted: false,
                isPriorityType: req.body.priorityType || false,
                selectNumberOfSliders: req.body.selectNumberOfSliders,
                selectSliderType: req.body.selectSliderType,
                selectAnswerType: req.body.selectAnswerType,
            }, { new: true });

            if (req.body.selectAnswerType === 'list') {
                var thinkingPlanning = await THINKING_PLANNING.findByIdAndUpdate(thinkingPlanning._id, {
                    minimumValue: null,
                    maximumValue: null,
                    minimumValue1: null,
                    maximumValue1: null,
                    selectAnswerType: req.body.selectAnswerType,
                    // selectNumberOfSliders: req.body.selectNumberOfSliders,
                    // selectSliderType: req.body.selectSliderType,
                    isPriorityType: req.body.priorityType || false,
                }, { new: true });
                // console.log("thinkingPlanning", thinkingPlanning);
                var textDelete = await THINKING_PLANNING_TEXT.deleteMany({ thinkingPlanningId: thinkingPlanning._id })
                var addSliderTypesArray = [];

                var deleteSliderTypes = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.deleteMany({ thinkingPlanningId: thinkingPlanning._id })
                // console.log("deleteSliderTypes", deleteSliderTypes);
                var sliderTypes = req.body.sliderTypes;
                for (let index = 0; index < sliderTypes.length; index++) {
                    const element = sliderTypes[index];
                    var addSliderTypeCreate = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.create({
                        thinkingPlanningId: thinkingPlanning._id,
                        name: element.name,
                        position: element.position,
                        actualPriority: element.actualPriority,
                        isDeleted: false
                    })
                    addSliderTypesArray.push(addSliderTypeCreate);
                }
            }

            else if (req.body.selectAnswerType === 'ratingScale') {
                var deleteSliderTypes = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.deleteMany({ thinkingPlanningId: thinkingPlanning._id })
                // console.log(req.body.answerType);
                if (req.body.selectSliderType === 'numeric') {
                    if (req.body.selectNumberOfSliders === 'singleSlider') {
                        var thinkingPlanning = await THINKING_PLANNING.findByIdAndUpdate(thinkingPlanning.id, {
                            minimumValue: req.body.minimumValue,
                            maximumValue: req.body.maximumValue,
                            selectNumberOfSliders: req.body.selectNumberOfSliders,
                            selectSliderType: req.body.selectSliderType,
                        }, { new: true });

                        await THINKING_PLANNING_TEXT.deleteMany({ thinkingPlanningId: thinkingPlanning._id })
                        // console.log("thinkingPlanning", thinkingPlanning);
                    } else if (req.body.selectNumberOfSliders === 'twoSlider') {
                        var deleteSliderTypes = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.deleteMany({ thinkingPlanningId: thinkingPlanning._id })

                        var thinkingPlanning = await THINKING_PLANNING.findByIdAndUpdate(thinkingPlanning.id, {
                            minimumValue: req.body.minimumValue,
                            maximumValue: req.body.maximumValue,
                            minimumValue1: req.body.minimumValue1,
                            maximumValue1: req.body.maximumValue1,
                            selectNumberOfSliders: req.body.selectNumberOfSliders,
                            selectSliderType: req.body.selectSliderType,

                        }, { new: true });
                        // console.log("thinkingPlanning", thinkingPlanning);

                    }
                } else if (req.body.selectSliderType === "text") {

                    await THINKING_PLANNING.findByIdAndUpdate(thinkingPlanning.id, {
                        minimumValue: null,
                        maximumValue: null,
                        minimumValue1: null,
                        maximumValue1: null,
                        selectAnswerType: req.body.selectAnswerType,
                        selectNumberOfSliders: req.body.selectNumberOfSliders,
                        selectSliderType: req.body.selectSliderType
                    }, { new: true });

                    var texts = req.body.texts;
                    var textsArray = [];
                    // console.log(req.body, "?????:")
                    if (req.body.selectNumberOfSliders === "singleSlider") {
                        var textDelete = await THINKING_PLANNING_TEXT.deleteMany({ thinkingPlanningId: thinkingPlanning._id })
                        // console.log("\x1b[31m", "typeof publish", typeof req.body.publish, req.body.publish);
                        for (let index = 0; index < texts.length; index++) {
                            const element = texts[index];
                            var textCreate = await THINKING_PLANNING_TEXT.create({
                                thinkingPlanningId: thinkingPlanning._id,
                                position: element.position,
                                slider: element.slider,
                                text: element.text,
                                isDeleted: false
                            })
                            textsArray.push(textCreate);
                        }
                    } else if (req.body.selectNumberOfSliders === "twoSlider") {
                        var thinkingPlanning = await THINKING_PLANNING.findByIdAndUpdate(thinkingPlanning._id, {
                            minimumValue: null,
                            maximumValue: null,
                            minimumValue1: null,
                            maximumValue1: null,
                            selectNumberOfSliders: req.body.selectNumberOfSliders,
                            selectSliderType: req.body.selectSliderType
                        }, { new: true });

                        var deleteSliderTypes = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.deleteMany({ thinkingPlanningId: thinkingPlanning._id })
                        var textDelete = await THINKING_PLANNING_TEXT.deleteMany({ thinkingPlanningId: thinkingPlanning._id })

                        var textsArray1 = [];
                        var texts1 = req.body.texts1;
                        for (let index = 0; index < texts1.length; index++) {
                            const element = texts1[index];
                            var textCreate = await THINKING_PLANNING_TEXT.create({
                                thinkingPlanningId: thinkingPlanning._id,
                                slider: element.slider,
                                position: element.position,
                                text: element.text,
                                isDeleted: false
                            })
                            textsArray.push(textCreate);
                        }
                        for (let index = 0; index < texts.length; index++) {
                            const element = texts[index];
                            var textCreate = await THINKING_PLANNING_TEXT.create({
                                thinkingPlanningId: thinkingPlanning._id,
                                slider: element.slider,
                                position: element.position,
                                text: element.text,
                                isDeleted: false
                            })
                            textsArray1.push(textCreate);
                        }
                    }
                }
            }

            var FIND = await THINKING_PLANNING.findById(thinkingPlanning._id)
            var findAddSliderType = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.find({ thinkingPlanningId: thinkingPlanning._id });
            var findText = await THINKING_PLANNING_TEXT.find({ thinkingPlanningId: thinkingPlanning._id })

            var response =
            {
                thinkingPlanningId: FIND._id,
                responseTypeId: FIND.responseTypeId,
                incidentPrioritiesId: FIND.incidentPrioritiesId,
                objectivesId: FIND.objectivesId,
                organizationId: FIND.organizationId,
                parentId: FIND.parentId,
                name: FIND.name,
                selectAnswerType: FIND.selectAnswerType,
                selectSliderType: FIND.selectSliderType,
                selectNumberOfSliders: FIND.selectNumberOfSliders,
                minimumValue: FIND.minimumValue,
                maximumValue: FIND.maximumValue,
                minimumValue1: FIND.minimumValue1,
                maximumValue1: FIND.maximumValue1,
                addSliderTypes: findAddSliderType,
                texts: findText,
                publish: FIND.publish,
                priorityType: FIND.isPriorityType,
                isDeleted: FIND.isDeleted,
                createdAt: FIND.createdAt,
                updatedAt: FIND.updatedAt
            }
        } else {
            throw new error('you can not access');
        }
        res.status(200).json({
            status: 'success',
            message: 'Thinking and Planning update successfully.',
            data: response
        });
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        });
    }
};

exports.deleteThinkingPlanning = async function (req, res, next) {
    try {
        var id = req.params.id
        if (req.role === 'superAdmin') {
            const find = await THINKING_PLANNING.findOne({ _id: id })
            if (!find) {
                throw new Error('thinking planning not found.')
            } else if (find.isDeleted === true) {
                throw new Error('thinking planning already deleted.')
            }

            var thinkingPlanning = await THINKING_PLANNING.findByIdAndUpdate(id, {
                isDeleted: true,
            }, { new: true });
            if (!thinkingPlanning) {
                throw new Error('thinkingPlanning not found')
            }
            var deleteSliderTypes = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.deleteMany({ thinkingPlanningId: thinkingPlanning.id })
            if (!deleteSliderTypes) {
                throw new Error('addSlider Not found')
            }
            var textDelete = await THINKING_PLANNING_TEXT.deleteMany({ thinkingPlanningId: thinkingPlanning.id })
            // console.log("textDelete", textDelete);
            if (!textDelete) {
                throw new Error('textDelete not found')
            }

        } else if (req.role === 'organization') {

            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            var thinkingPlanning = await THINKING_PLANNING.findOne({ _id: id, organizationId: organizationFind._id })
            if (!thinkingPlanning) {
                throw new Error("thinkingPlanning not created by your organization.");
            } else if (thinkingPlanning.isDeleted === true) {
                throw new Error("thinkingPlanning is already deleted.");
            }

            var thinkingPlanning = await THINKING_PLANNING.findByIdAndUpdate(id, {
                isDeleted: true,
            }, { new: true });
            if (!thinkingPlanning) {
                throw new Error('thinkingPlanning not found')
            }
            var deleteSliderTypes = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.deleteMany({ thinkingPlanningId: thinkingPlanning.id })
            if (!deleteSliderTypes) {
                throw new Error('addSlider Not found')
            }
            var textDelete = await THINKING_PLANNING_TEXT.deleteMany({ thinkingPlanningId: thinkingPlanning.id })
            // console.log("textDelete", textDelete);
            if (!textDelete) {
                throw new Error('textDelete not found')
            }

        } else {
            throw new Error('you can not access');
        }
        res.status(200).json({
            status: 'success',
            message: 'Thinking and Planning deleted successfully.'
        });
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        });
    }
};



exports.updateThinkingPlanningPublish = async function (req, res, next) {
    try {
        if (!req.params.id) {
            throw new Error("id is required.")
        }
        var find = await THINKING_PLANNING.findById(req.params.id)
        var thinkingPlanning = await THINKING_PLANNING.findByIdAndUpdate(req.params.id, {
            publish: req.body.publish
        }, { new: true });

        let message;
        if (thinkingPlanning.publish === true) {
            message = 'thinking planning published successfully'
        } else if (thinkingPlanning.publish === false) {
            message = 'thinking planning unpublished successfully'
        }


        res.status(200).json({
            status: 'success',
            message: message,
            data: thinkingPlanning
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
}