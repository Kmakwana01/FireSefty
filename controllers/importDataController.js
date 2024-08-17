const RESPONSE_TYPE = require('../models/responseTypeModel');
const INCIDENT_TYPE = require('../models/incidentTypeModel');
const ASSIGNMENT = require('../models/assignmentModel');
const TDG_LIBRARY = require('../models/tdgLibraryModel');
const TACTICAL_DECISION_GAME = require('../models/tacticalDecisionGameModel');
const BEST_PRACTICES_TDG = require('../models/bestPracticesTdgModel')
const ORGANIZATION = require('../models/organizationModel');
const TACTICAL_DECISION_GAME_IMAGE = require('../models/tacticalDecisionGameImageModel')
const TACTICAL_DECISION_GAME_ADD_ANSWER = require('../models/tacticalDecisionGameAddAnswerModel')
const BEST_PRACTICES_DECISION_GAME = require('../models/bestPracticesDecisionGameModel')
const TACTICAL_FUNCTION = require('../models/tacticalFunctionModel');
const INCIDENT_PRIORITIES = require('../models/incidentPrioritiesModel');
const OBJECTIVES = require('../models/objectivesModel');
const ACTION_KEYS = require('../models/actionKeysModel');
const ACTION_LIST = require('../models/actionListModel');
const TACTICAL_DECISION_GAME_RATING_SCALE_TEXT = require('../models/tacticalDecisionGameRatingScaleTextModel')
const THINKING_PLANNING = require('../models/thinkingPlanningModel')
const THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST = require('../models/thinkingPlaningSelectAnswerTypeListModel')
const THINKING_PLANNING_TEXT = require('../models/thinkingPlanningTextModel')
const USER = require('../models/userModel');
const SCENARIO = require('../models/scenarioModel');
const SCENARIO_ASSIGNMENT = require('../models/scenarioAssignmentsModel');
const PROFILE = require('../models/profileModel');
const FUNCTION_KEYS = require('../models/functionKeysModel');

exports.getAllData = async (req, res) => {
    try {

        let { type } = req.body;

        let response = [];

        if (!type) {
            throw new Error('type is required.');
        }

        if (type === 'responseTypes') {

            let organizationFind = await ORGANIZATION.findOne({ userId: req.userId, isDeleted: false })
            let existingResponseTypes = await RESPONSE_TYPE.find({ isDeleted: false, organizationId: organizationFind._id })
            let responseTypes = await RESPONSE_TYPE.find({ isDeleted: false, organizationId: "" }).sort({ index: 1 })

            const updatedResponse = await Promise.all(responseTypes.map(async element => {

                const recordExists = existingResponseTypes.filter(iterator => iterator.originalDataId?.toString() === element._id?.toString());
                console.log(recordExists.length > 0 ? true : false)
                return {
                    ...element.toObject(),
                    recordExists: recordExists.length > 0
                };

            }));

            response = [...updatedResponse]

        } else if (type === 'incidentTypes') {

            let responseTypeId = req.body.responseTypeId

            if (!responseTypeId) {
                throw new Error('responseTypeId is required.')
            }

            let organizationFind = await ORGANIZATION.findOne({ userId: req.userId, isDeleted: false })
            // console.log(organizationFind,"found organization")

            let responseType = await RESPONSE_TYPE.findOne({ _id: responseTypeId, organizationId: organizationFind._id })
            console.log("responseType", responseType);
            if (!responseType) {
                throw new Error("responseType not created by your organization")
            } else if (responseType.isDeleted === true) {
                throw new Error("responseType is already deleted")
            } else if (!responseType.originalDataId) {
                throw new Error('you are not allowed for import.')
            }

            let existingIncidentTypes = await INCIDENT_TYPE.find({ isDeleted: false, organizationId: organizationFind._id, responseTypeId: responseTypeId })

            // console.log(existingIncidentTypes)
            // if (responseType && responseType.originalDataId) {
            //     query.originalDataId = responseType.originalDataId;
            // }

            // console.log({
            //     organizationId: "",
            //     isDeleted: false,
            //     responseTypeId: responseType.originalDataId
            // })

            let incidentTypes = await INCIDENT_TYPE.find({
                organizationId: "",
                isDeleted: false,
                responseTypeId: responseType.originalDataId
            }).sort({ index: 1 })

            const updatedResponse = await Promise.all(incidentTypes.map(async element => {

                const recordExists = existingIncidentTypes.filter(iterator => iterator.originalDataId?.toString() === element._id?.toString());
                return {
                    ...element.toObject(),
                    recordExists: recordExists.length > 0
                };

            }));
            response = [...updatedResponse]

        } else if (type === 'assignments') {

            let responseTypeId = req.body.responseTypeId

            if (!responseTypeId) {
                throw new Error('responseTypeId is required.')
            }

            let organizationFind = await ORGANIZATION.findOne({ userId: req.userId, isDeleted: false })
            let responseType = await RESPONSE_TYPE.findOne({ _id: responseTypeId, organizationId: organizationFind._id })
            // console.log("responseType", responseType);
            if (!responseType) {
                throw new Error("responseType not created by your organization")
            } else if (responseType.isDeleted === true) {
                throw new Error("responseType is already deleted")
            } else if (!responseType.originalDataId) {
                throw new Error('you are not allowed for import.')
            }

            let existingAssignments = await ASSIGNMENT.find({ isDeleted: false, organizationId: organizationFind._id, responseTypeId: responseTypeId })

            let assignments = await ASSIGNMENT.find({
                organizationId: "",
                isDeleted: false,
                responseTypeId: responseType.originalDataId
            }).sort({ index: 1 })

            const updatedResponse = await Promise.all(assignments.map(async element => {

                const recordExists = existingAssignments.filter(iterator => iterator.originalDataId?.toString() === element._id?.toString());
                return {
                    ...element.toObject(),
                    recordExists: recordExists.length > 0
                };

            }));

            response = [...updatedResponse]

        } else if (type === 'tdgLibraries') {


            let assignmentId = req.body.assignmentId

            if (!assignmentId) {
                throw new Error('assignmentId is required.')
            }

            let organizationFind = await ORGANIZATION.findOne({ userId: req.userId, isDeleted: false })
            let assignMent = await ASSIGNMENT.findOne({ _id: assignmentId, organizationId: organizationFind._id })

            if (!assignMent) {
                throw new Error("Assignment not created by your organization.")
            } else if (assignMent.isDeleted === true) {
                throw new Error("Assignment is already deleted")
            }
            console.log(req.body)


            let existingTdgLibrary = await TDG_LIBRARY.find({ assignmentId: assignmentId, organizationId: organizationFind._id, isDeleted: false });

            if (!assignMent) {
                throw new Error('Please provide valid assignment.')
            } else if (!assignMent.originalDataId) {
                throw new Error('you are not allowed for import.')
            }

            let superAdminAssignment = await ASSIGNMENT.findOne({ _id: assignMent.originalDataId, organizationId: { $in: [null, ""] }, isDeleted: false })

            if (!superAdminAssignment) {
                throw new Error('you are not allowed for import..')
            }
            // console.log(superAdminAssignment,"superAdminAssignment")
            //superAdmin all tdg
            // c    onsole.log({ assignmentId: superAdminAssignment._id.toString(), isDeleted: false })
            let superAdminTdgLibraries = await TDG_LIBRARY.find({ assignmentId: superAdminAssignment._id.toString(), isDeleted: false })
            // console.log(superAdminTdgLibraries,"superAdminTdgLibraries")

            let updatedResponse = await Promise.all(

                superAdminTdgLibraries.map(async (record) => {

                    const recordExists = existingTdgLibrary.filter(iterator => iterator.originalDataId?.toString() === record._id?.toString());

                    let bestPracticesTdg = await BEST_PRACTICES_TDG.find({ tdgLibraryId: record._id, isDeleted: false });

                    let audioUrl;
                    if (record?.audio === null || !record.audio) {
                        audioUrl = null
                    } else {
                        audioUrl = req.protocol + "://" + req.get("host") + "/" + "images/" + record.audio;
                    }

                    let imageUrl;
                    if (record?.image === null || !record.image) {
                        imageUrl = null;
                    } else {
                        imageUrl = req.protocol + "://" + req.get("host") + "/" + "images/" + record.image;
                    }

                    let obj = {
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
                        recordExists: recordExists.length > 0
                    };
                    return obj;
                })
            );

            response = [...updatedResponse]

        } else if (type === 'tacticalDecisionGames') {

            const { tdgLibraryId } = req.body;

            if (!tdgLibraryId) {
                throw new Error('tdgLibraryId is required.')
            }

            const tdgLibrary = await TDG_LIBRARY.findById(tdgLibraryId)

            if (!tdgLibrary) {
                throw new Error('please provide valid tdgLibraryId.')
            } else if (tdgLibrary.isDeleted === true) {
                throw new Error('tdgLibrary is already deleted.')
            } else if (!tdgLibrary.originalDataId) {
                throw new Error('you are not allowed for import.')
            }
            console.log({ tdgLibraryId: tdgLibraryId, isDeleted: false })
            console.log({ tdgLibraryId: tdgLibrary.originalDataId, isDeleted: false })

            const exitingTacticalDecisionGames = await TACTICAL_DECISION_GAME.find({ tdgLibraryId: tdgLibraryId, isDeleted: false }).populate('tdgLibraryId')
            const superAdminTacticalDecisionGames = await TACTICAL_DECISION_GAME.find({ tdgLibraryId: tdgLibrary.originalDataId.toString(), isDeleted: false }).populate('tdgLibraryId')

            console.log(exitingTacticalDecisionGames, "exitingTacticalDecisionGames")
            console.log(superAdminTacticalDecisionGames, "superAdminTacticalDecisionGames")

            let updatedResponse = await Promise.all(superAdminTacticalDecisionGames.map(async (record) => {

                const recordExists = exitingTacticalDecisionGames.filter(iterator => iterator.originalDataId?.toString() === record._id?.toString());

                let findImage = await TACTICAL_DECISION_GAME_IMAGE.find({ tacticalDecisionGameId: record._id })
                //console.log("findImage",findImage);
                let findAddAnswerType = await TACTICAL_DECISION_GAME_ADD_ANSWER.find({ tacticalDecisionGameId: record._id })
                //console.log("findAddAnswerType",findAddAnswerType);
                let findBestPractices = await BEST_PRACTICES_DECISION_GAME.find({ tacticalDecisionGameId: record._id })
                //console.log("findBestPractices",findBestPractices);
                let findRatingScaleText = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.find({ tacticalDecisionGameId: record._id })
                //console.log("findRatingScaleText",findRatingScaleText);
                let findTacticalFunctionIncident = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: record._id, idType: 'incidentPriorities' })
                console.log("findTacticalFunctionIncident", findTacticalFunctionIncident);
                let findTacticalFunctionAction = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: record._id, idType: 'actionKeys' })
                // console.log("findTacticalFunctionAction", findTacticalFunctionAction);

                let objectivesPromisesIncident = findTacticalFunctionIncident.map(async (o) => {
                    let incidentPriorities = await INCIDENT_PRIORITIES.findOne(({ _id: o.incidentPrioritiesId }))

                    if (incidentPriorities) {
                        if (incidentPriorities.icon || incidentPriorities.icon !== "" || incidentPriorities.icon !== null) {
                            incidentPriorities.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + incidentPriorities.icon;
                        }
                    }

                    var actionKeys = await ACTION_KEYS.findOne({ _id: o.actionKeysId })

                    if (actionKeys) {
                        if (actionKeys.icon || actionKeys.icon !== "" || actionKeys.icon !== null) {
                            actionKeys.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + actionKeys.icon;
                        }
                    }

                    let objectivesFind = await OBJECTIVES.find({ incidentPrioritiesId: o.incidentPrioritiesId });
                    let actionListFind = await ACTION_LIST.find({ actionKeysId: o.actionKeysId });
                    return {
                        actionLists: actionListFind || null,
                        incidentPrioritiesId: o.incidentPrioritiesId || null,
                        incidentPrioritiesName: incidentPriorities || null,
                        tacticalDecisionGameId: o.tacticalDecisionGameId || null,
                        idType: o.idType || null,
                        objectives: objectivesFind || null,
                    };
                });

                let objectivesPromisesAction = findTacticalFunctionAction.map(async (o) => {
                    let incidentPriorities = await INCIDENT_PRIORITIES.findOne(({ _id: o.incidentPrioritiesId }))
                    if (incidentPriorities) {
                        if (incidentPriorities.icon || incidentPriorities.icon !== "" || incidentPriorities.icon !== null) {
                            incidentPriorities.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + incidentPriorities.icon;
                        }
                    }

                    let actionKeys = await ACTION_KEYS.findOne({ _id: o.actionKeysId, isDeleted: false })
                    if (actionKeys) {
                        if (actionKeys.icon || actionKeys.icon !== "" || actionKeys.icon !== null) {
                            actionKeys.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + actionKeys.icon;
                        }
                    }

                    let objectivesFind = await OBJECTIVES.find({ incidentPrioritiesId: o.incidentPrioritiesId });
                    let actionListFind = await ACTION_LIST.find({ actionKeysId: o.actionKeysId });
                    return {
                        actionKeyId: o.actionKeysId || null,
                        actionKeyName: actionKeys || null,
                        actionLists: actionListFind || null,
                        tacticalDecisionGameId: o.tacticalDecisionGameId || null,
                        idType: o.idType || null,
                        objectives: objectivesFind || null,
                    };
                });

                let objectivesDataIncident = await Promise.all(objectivesPromisesIncident);
                let objectivesDataAction = await Promise.all(objectivesPromisesAction);

                let object = [];

                if (findImage.length > 0) {
                    for (let index = 0; index < findImage.length; index++) {
                        const element = findImage[index];
                        object.push({ 'image': element.image, 'audio': element.audio ? element.audio : null , 'answer' : element.answer ?? null  })
                    }
                }

                let texts = findRatingScaleText.filter(text => text.slider === 'left')
                let texts1 = findRatingScaleText.filter(text => text.slider === 'right')

                let obj = {
                    tdgLibraryId: record.tdgLibraryId.id || null,
                    tdgGameName: record.tdgLibraryId.name,
                    goalObjective: record.tdgLibraryId.goalObjective || null,
                    missionBriefing: record.tdgLibraryId.missionBriefing || null,
                    tacticalDecisionGameId: record.id || null,
                    text: record.text || null,
                    image: object || null,
                    addAnswerTypes: findAddAnswerType || null,
                    bestNames: findBestPractices || null,
                    // texts: findRatingScaleText || null,
                    texts: texts ? texts : [],
                    texts1: texts1 ? texts1 : [],
                    selectTargetAudience: record.selectTargetAudience || null,
                    timeLimit: record.timeLimit || null,
                    selectAnswerType: record.selectAnswerType || null,
                    selectNumberOfSliders: record.selectNumberOfSliders || null,
                    numeric: record.numeric,
                    texting: record.texting,
                    publish: record.publish,
                    minimumValue: record.minimumValue || null,
                    maximumValue: record.maximumValue || null,
                    minimumValue1: record.minimumValue1 || null,
                    maximumValue1: record.maximumValue1 || null,
                    correctAnswer: record.correctAnswer || null,
                    isVoiceToText: record.isVoiceToText || null,
                    selectLine: record.selectLine || null,
                    selectPosition: record.selectPosition || null,
                    selectGoals: record.selectGoals || null,
                    selectCategory: record.selectCategory || null,
                    selectDecisivePointName: record.selectDecisivePointName || null,
                    priorityType: record.isPriorityType,
                    tacticalFunctionWithObjectivesIncident: objectivesDataIncident,
                    tacticalFunctionWithObjectivesAction: objectivesDataAction,
                    isDeleted: record.isDeleted || null,
                    createdAt: record.createdAt || null,
                    updatedAt: record.updatedAt || null,
                    recordExists: recordExists.length > 0
                }
                return obj;
            }))
            response = [...updatedResponse]

        } else if (type === 'incidentPriorities') {

            let responseTypeId = req.body.responseTypeId

            if (!responseTypeId) {
                throw new Error('responseTypeId is required.')
            }

            let organizationFind = await ORGANIZATION.findOne({ userId: req.userId, isDeleted: false })

            let responseType = await RESPONSE_TYPE.findOne({ _id: responseTypeId, organizationId: organizationFind._id })
            // console.log("responseType", responseType);
            if (!responseType) {
                throw new Error("responseType not created by your organization")
            } else if (responseType.isDeleted === true) {
                throw new Error("responseType is already deleted")
            } else if (!responseType.originalDataId) {
                throw new Error('you are not allowed for import.')
            }

            let existingIncidentPriority = await INCIDENT_PRIORITIES.find({ isDeleted: false, organizationId: organizationFind._id, responseTypeId: responseTypeId })

            let incidentPriorities = await INCIDENT_PRIORITIES.find({
                organizationId: "",
                isDeleted: false,
                responseTypeId: responseType.originalDataId
            }).sort({ index: 1 })

            const updatedResponse = await Promise.all(incidentPriorities.map(async element => {

                const recordExists = existingIncidentPriority.filter(iterator => iterator.originalDataId?.toString() === element._id?.toString());

                return {
                    ...element.toObject(),
                    recordExists: recordExists.length > 0
                };

            }));

            response = [...updatedResponse]

        } else if (type === 'objectives') {

            let { incidentPrioritiesId } = req.body

            if (!incidentPrioritiesId) {
                throw new Error('incidentPriorityId is required.')
            }

            let organizationFind = await ORGANIZATION.findOne({ userId: req.userId, isDeleted: false })
            let incident = await INCIDENT_PRIORITIES.findOne({ _id: incidentPrioritiesId, isDeleted: false })

            if (!incident.responseTypeId) {
                throw new Error('you are not allowed for import.')
            }

            let responseType = await RESPONSE_TYPE.findOne({ _id: incident.responseTypeId, isDeleted: false })

            if (!responseType) {
                throw new Error('you are not allowed for import..')
            }

            let existingObjectives = await OBJECTIVES.find({ isDeleted: false, organizationId: organizationFind._id, responseTypeId: incident.responseTypeId })

            let objectives = await OBJECTIVES.find({
                organizationId: "",
                isDeleted: false,
                incidentPrioritiesId: incident.originalDataId
            }).sort({ index: 1 })

            const updatedResponse = await Promise.all(objectives.map(async element => {

                const recordExists = existingObjectives.filter(iterator => iterator.originalDataId?.toString() === element._id?.toString());
                return {
                    ...element.toObject(),
                    recordExists: recordExists.length > 0
                };

            }));

            response = [...updatedResponse]

        } else if (type === 'thinkingPlaning') {

            let { objectivesId } = req.body;

            console.log(objectivesId, "objectivesId")

            if (!objectivesId) {
                throw new Error('objectivesId is required.')
            }

            let organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            let existingObjective = await OBJECTIVES.findOne({ isDeleted: false, _id: objectivesId, organizationId: organizationFind._id })

            if (!existingObjective) {
                throw new Error("objectives not created by your organization.");
            } else if (existingObjective.isDeleted === true) {
                throw new Error("objectives is already deleted.");
            }

            let exitingThinkingPlannings = await THINKING_PLANNING.find({ organizationId: organizationFind._id, objectivesId: objectivesId, isDeleted: false }).sort({ createdAt: 1 });
            let superAdminThinkingPlanning = await THINKING_PLANNING.find({
                organizationId: null,
                isDeleted: false,
                objectivesId: existingObjective.originalDataId
            })


            for (const record of superAdminThinkingPlanning) {

                let addSliderType = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.find({ thinkingPlanningId: record.id, isDeleted: false });
                let thinkingPlaningTexts = await THINKING_PLANNING_TEXT.find({ thinkingPlanningId: record.id, isDeleted: false })

                const recordExists = exitingThinkingPlannings.filter(iterator => iterator.originalDataId?.toString() === record._id?.toString());


                let texts = thinkingPlaningTexts.filter(text => text.slider === 'left')
                let texts1 = thinkingPlaningTexts.filter(text => text.slider === 'right')

                let obj = {
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
                    texts: texts ? texts : null,
                    texts1: texts1 ? texts1 : null,
                    priorityType: record.isPriorityType || false,
                    isDeleted: record.isDeleted || null,
                    createdAt: record.createdAt || null,
                    updatedAt: record.updatedAt || null,
                    recordExists: recordExists.length > 0
                }

                response.push(obj)
            }


        } else if (type === 'actionKeys') {

            const { responseTypeId } = req.body;

            if (!responseTypeId) {
                throw new Error('responseTypeId is required.')
            }

            let organizationFind = await ORGANIZATION.findOne({ userId: req.userId, isDeleted: false })

            let responseType = await RESPONSE_TYPE.findOne({ _id: responseTypeId, organizationId: organizationFind._id })

            if (!responseType) {
                throw new Error("responseType not created by your organization")
            } else if (responseType.isDeleted === true) {
                throw new Error("responseType is already deleted")
            } else if (!responseType.organizationId) {
                throw new Error('you are not allowed for import.')
            }

            console.log({ isDeleted: false, organizationId: organizationFind._id, responseTypeId: responseTypeId }, 'responsedata')

            let existingActionKeys = await ACTION_KEYS.find({ isDeleted: false, organizationId: organizationFind._id, responseTypeId: responseTypeId })
            console.log(existingActionKeys)
            let actionKeys = await ACTION_KEYS.find({ isDeleted: false, organizationId: "", responseTypeId: responseType.originalDataId }).sort({ index: 1 })

            const updatedResponse = await Promise.all(actionKeys.map(async element => {
                console.log(element._id.toString())
                const recordExists = existingActionKeys.filter(iterator => iterator.originalDataId?.toString() == element._id?.toString());

                return {
                    ...element.toObject(),
                    recordExists: recordExists.length > 0
                };

            }));

            response = [...updatedResponse]

        } else if (type === 'actionList') {

            const { actionKeyId } = req.body;

            if (!actionKeyId) {
                throw new Error('actionKeyId is required.')
            }

            let organizationFind = await ORGANIZATION.findOne({ userId: req.userId, isDeleted: false })

            let actionKey = await ACTION_KEYS.findOne({ _id: actionKeyId, organizationId: organizationFind._id })

            if (!actionKey) {
                throw new Error("actionKey not created by your organization")
            } else if (actionKey.isDeleted === true) {
                throw new Error("actionKey is already deleted")
            } else if (!actionKey.organizationId) {
                throw new Error('you are not allowed for import.')
            }

            console.log({
                organizationId: "",
                isDeleted: false,
                actionKeyId: actionKey.originalDataId
            })

            let actionLists = await ACTION_LIST.find({
                organizationId: "",
                isDeleted: false,
                actionKeysId: actionKey.originalDataId
            }).sort({ index: 1 })

            console.log(actionLists, "actionLists")

            let existingActionLists = await ACTION_LIST.find({ isDeleted: false, organizationId: organizationFind._id, actionKeysId: actionKeyId })

            const updatedResponse = await Promise.all(actionLists.map(async element => {

                const recordExists = existingActionLists.filter(iterator => iterator.originalDataId?.toString() === element._id?.toString());
                return {
                    ...element.toObject(),
                    recordExists: recordExists.length > 0
                };

            }));
            response = [...updatedResponse]

        } else {
            throw new Error('please provide valid type.')
        }

        res.status(200).json({
            status: "success",
            message: "Data get successfully.",
            data: response,
        });
    } catch (error) {
        res.status(400).json({
            status: "failed",
            message: error.message,
        });
    }
}

exports.importData = async (req, res) => {
    try {
        console.log(req.role, req.body)

        if (req.role === 'organization') {

            console.log(req.body, "req.body")

            let { type, arrayOfIds } = req.body;

            if (!type) {
                throw new Error('type is required.');
            }

            // change this condition
            let isArrayOfIds = arrayOfIds?.length
            if (!isArrayOfIds) {
                throw new Error('please select items.')
            }

            var response = [];

            if (type === 'responseTypes') {

                let organizationFind = await ORGANIZATION.findOne({ userId: req.userId, isDeleted: false })
                // let existingResponseTypes = await RESPONSE_TYPE.find({ isDeleted: false, organizationId: organizationFind._id });

                for (let id of arrayOfIds) {

                    // let existingResponseType = existingResponseTypes.find(iterator =>
                    //     iterator.originalDataId?.toString() === id.toString() &&
                    //     iterator.organizationId?.toString() === organizationFind._id.toString() &&
                    //     iterator.isDeleted === false
                    // );
                    // // console.log(existingResponseType, "existingResponseType")
                    // if (existingResponseType) {
                    //     console.error(`Response type with ID ${id} already exists for user ${req.userId}.`);
                    //     continue; // Skip creating a new response type
                    // }
                    // Find the last response type to determine the new index
                    let getLastResponseType = await RESPONSE_TYPE.findOne({ isDeleted: false, organizationId: organizationFind._id }).sort({ index: -1 });
                    let maxIndex = 1;
                    if (getLastResponseType) {
                        maxIndex = getLastResponseType.index + 1;
                    }

                    let existingResponseTypeGlobal = await RESPONSE_TYPE.findOne({ isDeleted: false, _id: id, organizationId: "" });
                    // console.log(existingResponseTypeGlobal)
                    let newResponseType = await RESPONSE_TYPE.create({
                        parentId: existingResponseTypeGlobal?.parentId || '',
                        name: existingResponseTypeGlobal.name || null,
                        organizationId: organizationFind._id,
                        originalDataId: id,
                        index: maxIndex,
                        isDeleted: false,
                        isUpdated: false
                    });
                    response.push(newResponseType);
                }

            } else if (type === 'incidentTypes') {

                let responseTypeId = req.body.responseTypeId

                let organizationFind = await ORGANIZATION.findOne({ userId: req.userId })

                let responseType = await RESPONSE_TYPE.findOne({ _id: responseTypeId, organizationId: organizationFind._id })
                // console.log("responseType", responseType);
                if (!responseType) {
                    throw new Error("responseType not created by your organization")
                } else if (responseType.isDeleted === true) {
                    throw new Error("responseType is already deleted")
                }

                // let existingIncidentTypes = await INCIDENT_TYPE.find({ isDeleted: false, organizationId: organizationFind._id });

                for (const id of arrayOfIds) {

                    let getLastIncidentType = await INCIDENT_TYPE.findOne({ isDeleted: false, organizationId: organizationFind._id }).sort({ index: -1 });
                    console.log(getLastIncidentType)
                    let maxIndex = 1;
                    console.log(getLastIncidentType, ';;;;;')
                    if (getLastIncidentType) {
                        maxIndex = getLastIncidentType.index + 1;
                    }

                    let existingIncidentTypeGlobal = await INCIDENT_TYPE.findOne({ isDeleted: false, _id: id, organizationId: "" });

                    let newIncidentType = await INCIDENT_TYPE.create({
                        parentId: existingIncidentTypeGlobal.parentId || '',
                        name: existingIncidentTypeGlobal.name || null,
                        organizationId: organizationFind._id,
                        responseTypeId: responseTypeId,
                        originalDataId: id,
                        index: maxIndex,
                        isDeleted: false
                    });
                    response.push(newIncidentType);
                }

            } else if (type === 'assignments') {

                let { responseTypeId, incidentTypeId } = req.body

                if (!responseTypeId) {
                    throw new Error('responseTypeId is required.')
                } else if (!incidentTypeId) {
                    throw new Error('incidentTypeId is required')
                }

                let organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
                // let existingAssignments = await ASSIGNMENT.find({ isDeleted: false, organizationId: organizationFind._id });

                for (const id of arrayOfIds) {

                    // let existingAssignment = existingAssignments.find(iterator =>
                    //     iterator.originalDataId?.toString() === id.toString() &&
                    //     iterator.organizationId?.toString() === organizationFind._id.toString() &&
                    //     iterator.isDeleted === false
                    // );
                    // // console.log(existingAssignment, 'existingAssignment')
                    // if (existingAssignment) {
                    //     console.error(`Response type with ID ${id} already exists for user ${req.userId}.`);
                    //     continue; // Skip creating a new response type
                    // }

                    let getLastAssignment = await ASSIGNMENT.findOne({ isDeleted: false, organizationId: organizationFind._id, responseTypeId: responseTypeId }).sort({ index: -1 });
                    let maxIndex = 1;
                    // console.log(getLastIncidentType,';;;;;')
                    if (getLastAssignment) {
                        maxIndex = getLastAssignment.index + 1;
                    }

                    let existingAssignmentGlobal = await ASSIGNMENT.findOne({ isDeleted: false, _id: id, organizationId: "" });
                    console.log('first')

                    let newAssignment = await ASSIGNMENT.create({
                        parentId: existingAssignmentGlobal.parentId || '',
                        name: existingAssignmentGlobal.name || null,
                        organizationId: organizationFind._id,
                        responseTypeId: responseTypeId,
                        originalDataId: id,
                        index: maxIndex,
                        isDeleted: false,
                        incidentTypeId: incidentTypeId
                    });
                    response.push(newAssignment);
                }
            } else if (type === 'tdgLibraries') {

                let { assignmentId } = req.body
                console.log(req.body)

                if (!assignmentId) {
                    throw new Error('assignmentId is required.')
                }

                let organizationFind = await ORGANIZATION.findOne({ userId: req.userId, isDeleted: false })
                let assignment = await ASSIGNMENT.findOne({ _id: assignmentId, organizationId: organizationFind._id })
                console.log('&&&&&&', assignment)

                if (!assignment) {
                    throw new Error('please provide valid assignmentId')
                }
                let responseTypeId = assignment?.responseTypeId
                let incidentTypeId = assignment?.incidentTypeId
                let responseType = await RESPONSE_TYPE.findOne({ _id: responseTypeId, organizationId: organizationFind._id })
                let incidentType = await INCIDENT_TYPE.findOne({ _id: incidentTypeId, organizationId: organizationFind._id })

                if (!assignment) {
                    throw new Error("assignment not created by your organization")
                } else if (assignment.isDeleted === true) {
                    throw new Error("assignment is already deleted")
                } else if (!responseType) {
                    throw new Error("responseType not created by your organization.")
                } else if (responseType.isDeleted === true) {
                    throw new Error("responseType is already deleted")
                } else if (!incidentType) {
                    throw new Error("incidentType not created by your organization.")
                } else if (incidentType.isDeleted === true) {
                    throw new Error("incidentType is already deleted")
                }

                // let existingTdgLibraries = await TDG_LIBRARY.find({ assignmentId: assignmentId, isDeleted: false })
                // console.log('running', existingTdgLibraries)

                for (const id of arrayOfIds) {

                    // let existingTdgLibrary = existingTdgLibraries.find(iterator =>
                    //     iterator.originalDataId?.toString() === id.toString() &&
                    //     iterator.organizationId?.toString() === organizationFind._id.toString() &&
                    //     iterator.isDeleted === false
                    // );

                    // if (existingTdgLibrary) {
                    //     console.error(`Response type with ID ${id} already exists for user ${req.userId}.`);
                    //     continue; // Skip creating a new response type
                    // }

                    let existingTdgLibraryGlobal = await TDG_LIBRARY.findOne({ isDeleted: false, _id: id });

                    if (!existingTdgLibraryGlobal) {
                        continue;
                    }

                    let newTdgLibrary = await TDG_LIBRARY.create({
                        responseTypeId: responseTypeId,
                        incidentTypeId: incidentTypeId,
                        assignmentId: assignmentId,
                        organizationId: organizationFind._id,
                        parentId: null,
                        name: existingTdgLibraryGlobal.name || null,
                        goalObjective: existingTdgLibraryGlobal.goalObjective || null,
                        missionBriefing: existingTdgLibraryGlobal.missionBriefing || null,
                        text: existingTdgLibraryGlobal.text || null,
                        audio: existingTdgLibraryGlobal.audio ? existingTdgLibraryGlobal.audio : null,
                        image: existingTdgLibraryGlobal.image ? existingTdgLibraryGlobal.image : null,
                        publish: existingTdgLibraryGlobal.publish || false,
                        targetAudience: existingTdgLibraryGlobal.targetAudience || null,
                        originalDataId: id,
                        isDeleted: false,
                    });

                    let bestPracticesGlobal = await BEST_PRACTICES_TDG.find({ tdgLibraryId: id, isDeleted: false })

                    const bestPracticesArray = [];

                    for (const bestName of bestPracticesGlobal) {
                        const bestPracticesTdg = await BEST_PRACTICES_TDG.create({
                            tdgLibraryId: newTdgLibrary._id,
                            name: bestName.name,
                            isDeleted: false,
                        });
                        bestPracticesArray.push(bestPracticesTdg);
                    }
                    // bestPractices: bestPracticesArray,

                    let newTdgResponse = {
                        tdgLibraryId: newTdgLibrary._id,
                        responseTypeId: newTdgLibrary.responseTypeId,
                        incidentTypeId: newTdgLibrary.incidentTypeId,
                        assignmentId: newTdgLibrary.assignmentId,
                        organizationId: newTdgLibrary.organizationId,
                        parentId: newTdgLibrary.parentId,
                        name: newTdgLibrary.name || null,
                        goalObjective: newTdgLibrary.goalObjective || null,
                        missionBriefing: newTdgLibrary.missionBriefing || null,
                        text: newTdgLibrary.text || null,
                        audio: newTdgLibrary.audio || null,
                        image: newTdgLibrary.image || null,
                        publish: newTdgLibrary.publish,
                        targetAudience: newTdgLibrary.targetAudience || null,
                        isDeleted: newTdgLibrary.isDeleted,
                        bestPractices: bestPracticesArray,
                        createdAt: newTdgLibrary.createdAt || null,
                        updatedAt: newTdgLibrary.updatedAt || null
                    };
                    response.push(newTdgResponse)
                }

            } else if (type === 'tacticalDecisionGames') {

                let { tdgLibraryId, isForce } = req.body

                if (!tdgLibraryId) {
                    throw new Error('tdgLibraryId is required.')
                }

                let tdgLibrary = await TDG_LIBRARY.findOne({ _id: tdgLibraryId })
                let organizationFind = await ORGANIZATION.findOne({ userId: req.userId, isDeleted: false })

                if (!tdgLibrary) {
                    throw new Error('tdg library is not found')
                } else if (tdgLibrary.isDeleted === true) {
                    throw new Error('tdg library is already deleted')
                } else if (!tdgLibrary.originalDataId) {
                    throw new Error('you are not allowed for import.')
                }

                // const exitingTacticalDecisionGames = await TACTICAL_DECISION_GAME.find({ tdgLibraryId: tdgLibraryId, isDeleted: false, organizationId: organizationFind._id })
                // const superAdminTacticalDecisionGames = await TACTICAL_DECISION_GAME.find({ tdgLibraryId: tdgLibrary.originalDataId.toString(), isDeleted: false })
                const newTacticalGamesIds = [];
                let isRunning = false;

                if (!isForce) {
                    console.log("ENTER FALSE")
                    for (const id of arrayOfIds) {

                        let existingTacticalGameGlobal = await TACTICAL_DECISION_GAME.findOne({ isDeleted: false, _id: id });
                        if (!existingTacticalGameGlobal) {
                            continue;
                        }

                        if (existingTacticalGameGlobal.selectAnswerType === "functionKeys") {
                            let tacticalDecisionGameFunction = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: existingTacticalGameGlobal._id, idType: 'incidentPriorities' })

                            for (const iterator of tacticalDecisionGameFunction) {

                                let superAdminIncidentFunction = await INCIDENT_PRIORITIES.findOne({ _id: iterator.incidentPrioritiesId, isDeleted: false })
                                let isValidIncidentPriorityFunction = await INCIDENT_PRIORITIES.find({ originalDataId: iterator.incidentPrioritiesId, organizationId: organizationFind._id, isDeleted: false })
                                if (!isValidIncidentPriorityFunction.length) {
                                    let message = `Incident Priority ${superAdminIncidentFunction?.name ? `"${superAdminIncidentFunction.name}"` : ''} is not found in your organization's Incident Priorities. Please import it first.`;
                                    return res.status(200).json({
                                        status: 202,
                                        message: message,
                                        data: [],
                                    });
                                }
                            }

                            let tacticalDecisionGameFunction2 = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: existingTacticalGameGlobal._id, idType: 'actionKeys' })
                            for (const iterator of tacticalDecisionGameFunction2) {
                                let superAdminActionKeyFunction = await ACTION_KEYS.findOne({ _id: iterator.actionKeysId, isDeleted: false })
                                let isValidActionKeyPriorityFunction = await ACTION_KEYS.find({ originalDataId: iterator.actionKeysId, organizationId: organizationFind._id, isDeleted: false })
                                if (!isValidActionKeyPriorityFunction.length) {
                                    let message = `Action Key  ${superAdminActionKeyFunction?.name ? `"${superAdminActionKeyFunction.name}"` : ''} is not found in your organization's Action Keys. Please import it first.`;
                                    return res.status(200).json({
                                        status: 202,
                                        message: message,
                                        data: [],
                                    });
                                }

                            }
                        }

                    }
                    isRunning = true;
                }

                if (isForce == true || isRunning == true) {

                    for (const id of arrayOfIds) {

                        let existingTacticalGameGlobal = await TACTICAL_DECISION_GAME.findOne({ isDeleted: false, _id: id });
                        if (!existingTacticalGameGlobal) {
                            continue;
                        }

                        console.log('ente1r')
                        if (existingTacticalGameGlobal.selectAnswerType === "functionKeys") {
                            let tacticalDecisionGameFunction = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: existingTacticalGameGlobal._id, idType: 'incidentPriorities' })

                            for (const iterator of tacticalDecisionGameFunction) {

                                let superAdminIncidentFunction = await INCIDENT_PRIORITIES.findOne({ _id: iterator.incidentPrioritiesId, isDeleted: false })
                                let isValidIncidentPriorityFunction = await INCIDENT_PRIORITIES.find({ originalDataId: iterator.incidentPrioritiesId, organizationId: organizationFind._id, isDeleted: false })
                                if (!isValidIncidentPriorityFunction.length) {
                                    let getLastPriority = await INCIDENT_PRIORITIES.findOne({ isDeleted: false, organizationId: organizationFind._id }).sort({ index: -1 });
                                    let maxIndex = 1;
                                    if (getLastPriority) {
                                        maxIndex = getLastPriority.index + 1;
                                    }
                                    await INCIDENT_PRIORITIES.create({
                                        responseTypeId: tdgLibrary.responseTypeId,
                                        organizationId: organizationFind._id,
                                        parentId: superAdminIncidentFunction.parentId || '',
                                        name: superAdminIncidentFunction.name || null,
                                        icon: superAdminIncidentFunction.icon || null,
                                        color: superAdminIncidentFunction.color || null,
                                        originalDataId: superAdminIncidentFunction._id,
                                        index: maxIndex,
                                        isDeleted: false
                                    });
                                }
                            }

                            let tacticalDecisionGameFunction2 = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: existingTacticalGameGlobal._id, idType: 'actionKeys' })
                            for (const iterator of tacticalDecisionGameFunction2) {
                                let superAdminActionKeyFunction = await ACTION_KEYS.findOne({ _id: iterator.actionKeysId, isDeleted: false })
                                let isValidActionKeyPriorityFunction = await ACTION_KEYS.find({ originalDataId: iterator.actionKeysId, organizationId: organizationFind._id, isDeleted: false })
                                if (!isValidActionKeyPriorityFunction.length) {
                                    // let message = `Action Key  ${superAdminActionKeyFunction?.name ? `"${superAdminActionKeyFunction.name}"` : ''} is not found in your organization's Action Keys. Please import it first.`;
                                    let getLastActionKey = await ACTION_KEYS.findOne({ isDeleted: false, organizationId: organizationFind._id, responseTypeId: tdgLibrary.responseTypeId }).sort({ index: -1 });
                                    let maxIndex = 1;

                                    if (getLastActionKey) {
                                        maxIndex = getLastActionKey.index + 1;
                                    }

                                    await ACTION_KEYS.create({
                                        responseTypeId: tdgLibrary.responseTypeId,
                                        organizationId: organizationFind._id,
                                        parentId: '',
                                        name: superAdminActionKeyFunction.name,
                                        icon: superAdminActionKeyFunction.icon,
                                        color: superAdminActionKeyFunction.color,
                                        isDeleted: false,
                                        index: maxIndex,
                                        originalDataId: superAdminActionKeyFunction._id
                                    })
                                }

                            }
                        }

                    }


                    for (const id of arrayOfIds) {

                        let existingTacticalGameGlobal = await TACTICAL_DECISION_GAME.findOne({ isDeleted: false, _id: id });
                        if (!existingTacticalGameGlobal) {
                            continue;
                        }

                        // let existingGame = exitingTacticalDecisionGames.filter(iterator =>
                        //     iterator.originalDataId?.toString() === id.toString() &&
                        //     iterator.organizationId?.toString() === organizationFind._id.toString() &&
                        //     iterator.isDeleted === false
                        // );

                        // if (existingGame.length > 0) {
                        //     console.error(`Response type with ID ${id} already exists for user ${req.userId}.`);
                        //     continue; // Skip creating a new response type
                        // }

                        let newTacticalDecisionGame = await TACTICAL_DECISION_GAME.create({
                            tdgLibraryId: tdgLibraryId,
                            organizationId: organizationFind._id,
                            parentId: existingTacticalGameGlobal?.parentId || null,
                            text: existingTacticalGameGlobal?.text || null,
                            selectTargetAudience: existingTacticalGameGlobal?.selectTargetAudience || [],
                            timeLimit: existingTacticalGameGlobal?.timeLimit || null,
                            selectAnswerType: existingTacticalGameGlobal?.selectAnswerType || null,
                            publish: existingTacticalGameGlobal?.publish || false,
                            correctAnswer: existingTacticalGameGlobal?.correctAnswer || null,
                            selectLine: null,
                            selectPosition: null,
                            selectGoals: null,
                            selectCategory: null,
                            selectDecisivePointName: null,
                            numeric: existingTacticalGameGlobal.numeric,
                            texting: existingTacticalGameGlobal.texting,
                            isPriorityType: existingTacticalGameGlobal.isPriorityType,
                            originalDataId: id,
                            isDeleted: false
                        });

                        console.log(newTacticalDecisionGame, "newTacticalDecisionGame")

                        let tacticalDecisionGameImage = await TACTICAL_DECISION_GAME_IMAGE.find({ tacticalDecisionGameId: existingTacticalGameGlobal._id })
                        for (const iterator of tacticalDecisionGameImage) {
                            await TACTICAL_DECISION_GAME_IMAGE.create({
                                tacticalDecisionGameId: newTacticalDecisionGame._id,
                                image: iterator.image ? iterator.image : null,
                                audio: iterator.audio ? iterator.audio : null,
                                answer: iterator.answer ? iterator.answer : null,
                                isDeleted: false
                            });
                        }

                        const bestPracticesArray = [];

                        let tacticalDecisionGameBestNames = await BEST_PRACTICES_DECISION_GAME.find({ tacticalDecisionGameId: existingTacticalGameGlobal._id })
                        for (const iterator of tacticalDecisionGameBestNames) {
                            let bestPracticesDecisionGame = await BEST_PRACTICES_DECISION_GAME.create({
                                tacticalDecisionGameId: newTacticalDecisionGame._id,
                                name: iterator.name ? iterator.name : null,
                                isDeleted: false
                            });
                            bestPracticesArray.push(bestPracticesDecisionGame);
                        }



                        if (newTacticalDecisionGame.selectAnswerType === "list") {
                            let addAnswerTypesArray = [];
                            let allAddAnswer = await TACTICAL_DECISION_GAME_ADD_ANSWER.find({ tacticalDecisionGameId: existingTacticalGameGlobal._id })
                            for (const iterator of allAddAnswer) {
                                await TACTICAL_DECISION_GAME_ADD_ANSWER.create({
                                    tacticalDecisionGameId: newTacticalDecisionGame._id,
                                    answer: iterator.answer,
                                    position: iterator.position || 0,
                                    isDeleted: false,
                                });
                            }
                        } else if (newTacticalDecisionGame.selectAnswerType === "ratingScale") {

                            if (existingTacticalGameGlobal.numeric == 'true') {
                                if (existingTacticalGameGlobal.selectNumberOfSliders === 'singleSlider') {
                                    console.log('enter')
                                    let data = await TACTICAL_DECISION_GAME.findByIdAndUpdate(newTacticalDecisionGame._id, {
                                        minimumValue: existingTacticalGameGlobal.minimumValue || null,
                                        maximumValue: existingTacticalGameGlobal.maximumValue || null,
                                        correctAnswer: existingTacticalGameGlobal.correctAnswer || null,
                                        selectNumberOfSliders: existingTacticalGameGlobal.selectNumberOfSliders || null
                                    }, { new: true })
                                    console.log(data, 'new')

                                } else if (existingTacticalGameGlobal.selectNumberOfSliders === 'twoSlider') {

                                    await TACTICAL_DECISION_GAME.findByIdAndUpdate(newTacticalDecisionGame._id, {
                                        minimumValue: existingTacticalGameGlobal.minimumValue || null,
                                        maximumValue: existingTacticalGameGlobal.maximumValue || null,
                                        minimumValue1: existingTacticalGameGlobal.minimumValue1 || null,
                                        maximumValue1: existingTacticalGameGlobal.maximumValue1 || null,
                                        correctAnswer: existingTacticalGameGlobal.correctAnswer || null,
                                        selectNumberOfSliders: existingTacticalGameGlobal.selectNumberOfSliders || null
                                    }, { new: true })

                                }
                            } else if (existingTacticalGameGlobal.texting == 'true') {
                                if (existingTacticalGameGlobal.selectNumberOfSliders === 'singleSlider' || existingTacticalGameGlobal.selectNumberOfSliders === 'twoSlider') {


                                    // console.log('***********', existingTacticalGameGlobal.selectNumberOfSliders)
                                    await TACTICAL_DECISION_GAME.findByIdAndUpdate(newTacticalDecisionGame.id, {
                                        selectNumberOfSliders: existingTacticalGameGlobal.selectNumberOfSliders || null
                                    }, { new: true })


                                    var ratingTexts = [];
                                    let tacticalDecisionGameRatingScale = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.find({ tacticalDecisionGameId: existingTacticalGameGlobal._id })
                                    console.log(tacticalDecisionGameRatingScale, "tacticalDecisionGameRatingScale")
                                    for (const iterator of tacticalDecisionGameRatingScale) {
                                        var ratingText = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.create({
                                            tacticalDecisionGameId: newTacticalDecisionGame._id,
                                            slider: iterator.slider,
                                            position: iterator.position,
                                            actualPriority: iterator.actualPriority,
                                            ratingScaleText: iterator?.ratingScaleText || null,
                                            isDeleted: false,
                                        });
                                        ratingTexts.push(ratingText);
                                    }
                                    // console.log(ratingText, "ratingText")
                                }
                            }
                        } else if (newTacticalDecisionGame.selectAnswerType === "voiceToText") {

                            var tacticalDecisionGame = await TACTICAL_DECISION_GAME.findByIdAndUpdate(newTacticalDecisionGame._id, {
                                isVoiceToText: existingTacticalGameGlobal.isVoiceToText,
                            }, { new: true })

                        } else if (newTacticalDecisionGame.selectAnswerType === "functionKeys") {

                            let tacticalDecisionGameFunction = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: existingTacticalGameGlobal._id, idType: 'incidentPriorities' })

                            for (const iterator of tacticalDecisionGameFunction) {
                                let isValidPriority = await INCIDENT_PRIORITIES.findOne({ originalDataId: iterator.incidentPrioritiesId, organizationId: organizationFind._id, isDeleted: false })
                                // console.log(isValidPriority,"isValidPriority",iterator.idType)
                                await TACTICAL_FUNCTION.create({
                                    tacticalDecisionGameId: newTacticalDecisionGame._id,
                                    idType: iterator.idType,
                                    incidentPrioritiesId: isValidPriority._id || null,
                                });
                                // console.log("Created Tactical Function with Incident Priorities: ", tacticalFunctionIncident);
                            }

                            let tacticalDecisionGameFunction2 = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: existingTacticalGameGlobal._id, idType: 'actionKeys' })
                            for (const iterator of tacticalDecisionGameFunction2) {
                                let isValidActionKey = await ACTION_KEYS.findOne({ originalDataId: iterator.actionKeysId, organizationId: organizationFind._id, isDeleted: false })
                                // console.log(isValidActionKey,"isValidActionKey",iterator.idType)
                                const tacticalFunctionIncident = await TACTICAL_FUNCTION.create({
                                    tacticalDecisionGameId: newTacticalDecisionGame._id,
                                    idType: iterator.idType,
                                    actionKeysId: isValidActionKey._id || null,
                                });
                                // console.log("Created Tactical Function with actionKeys ", tacticalFunctionIncident);
                            }
                        }

                        let newTacticalGame = await TACTICAL_DECISION_GAME.findOne({ _id: newTacticalDecisionGame._id })
                        newTacticalGamesIds.push(newTacticalGame._id.toString())
                        // response.push(newTacticalGame)
                    }

                    for (const id of newTacticalGamesIds) {

                        let tacticalDecisionGame = await TACTICAL_DECISION_GAME.findOne({ _id: id });
                        let findImage = await TACTICAL_DECISION_GAME_IMAGE.find({ tacticalDecisionGameId: tacticalDecisionGame._id });
                        let findAddAnswerType = await TACTICAL_DECISION_GAME_ADD_ANSWER.find({ tacticalDecisionGameId: tacticalDecisionGame._id });
                        // console.log("findAddAnswerType", findAddAnswerType);
                        let findBestPractices = await BEST_PRACTICES_DECISION_GAME.find({ tacticalDecisionGameId: tacticalDecisionGame._id });
                        // console.log("findBestPractices", findBestPractices);
                        let findRatingScaleText = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.find({ tacticalDecisionGameId: tacticalDecisionGame.id });
                        // console.log("findRatingScaleText", findRatingScaleText);
                        // var findTacticalFunction = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: tacticalDecisionGame.id })
                        let findTacticalFunctionIncident = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: tacticalDecisionGame.id, idType: 'incidentPriorities' })
                        // console.log("findTacticalFunctionIncident", findTacticalFunctionIncident);
                        let findTacticalFunctionAction = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: tacticalDecisionGame.id, idType: 'actionKeys' })
                        // console.log("findTacticalFunctionAction", findTacticalFunctionAction);

                        let objectivesPromisesIncident = findTacticalFunctionIncident.map(async (o) => {
                            var incidentPriorities = await INCIDENT_PRIORITIES.findOne(({ _id: o.incidentPrioritiesId }))

                            if (incidentPriorities) {
                                if (incidentPriorities.icon || incidentPriorities.icon !== "" || incidentPriorities.icon !== null) {
                                    incidentPriorities.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + incidentPriorities.icon;
                                }
                            }

                            var actionKeys = await ACTION_KEYS.findOne({ _id: o.actionKeysId })

                            if (actionKeys) {
                                if (actionKeys.icon || actionKeys.icon !== "" || actionKeys.icon !== null) {
                                    actionKeys.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + actionKeys.icon;
                                }
                            }

                            var objectivesFind = await OBJECTIVES.find({ incidentPrioritiesId: o.incidentPrioritiesId });
                            var actionListFind = await ACTION_LIST.find({ actionKeysId: o.actionKeysId });
                            return {
                                actionLists: actionListFind || null,
                                incidentPrioritiesId: o.incidentPrioritiesId || null,
                                incidentPrioritiesName: incidentPriorities || null,
                                tacticalDecisionGameId: o.tacticalDecisionGameId || null,
                                idType: o.idType || null,
                                objectives: objectivesFind || null,
                            };
                        });

                        var objectivesPromisesAction = findTacticalFunctionAction.map(async (o) => {
                            var incidentPriorities = await INCIDENT_PRIORITIES.findOne(({ _id: o.incidentPrioritiesId }))
                            if (incidentPriorities) {
                                if (incidentPriorities.icon || incidentPriorities.icon !== "" || incidentPriorities.icon !== null) {
                                    incidentPriorities.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + incidentPriorities.icon;
                                }
                            }

                            var actionKeys = await ACTION_KEYS.findOne({ _id: o.actionKeysId, isDeleted: false })
                            if (actionKeys) {
                                if (actionKeys.icon || actionKeys.icon !== "" || actionKeys.icon !== null) {
                                    actionKeys.icon = req.protocol + "://" + req.get("host") + "/" + "images/" + actionKeys.icon;
                                }
                            }

                            var objectivesFind = await OBJECTIVES.find({ incidentPrioritiesId: o.incidentPrioritiesId });
                            var actionListFind = await ACTION_LIST.find({ actionKeysId: o.actionKeysId });
                            return {
                                actionKeyId: o.actionKeysId || null,
                                actionKeyName: actionKeys || null,
                                actionLists: actionListFind || null,
                                tacticalDecisionGameId: o.tacticalDecisionGameId || null,
                                idType: o.idType || null,
                                objectives: objectivesFind || null,
                            };
                        });
                        var objectivesDataIncident = await Promise.all(objectivesPromisesIncident);
                        var objectivesDataAction = await Promise.all(objectivesPromisesAction);

                        var object = [];
                        if (findImage.length > 0) {
                            for (let index = 0; index < findImage.length; index++) {
                                const element = findImage[index];
                                object.push({ 'image': element.image ? element.image : null, 'audio': element.audio ? element.audio : null });
                            }
                        }

                        let obj = {
                            tacticalDecisionGameId: tacticalDecisionGame.id,
                            tdgLibraryId: tacticalDecisionGame.tdgLibraryId,
                            organizationId: tacticalDecisionGame.organizationId,
                            parentId: tacticalDecisionGame.parentId,
                            text: tacticalDecisionGame.text,
                            image: object,
                            addAnswerTypes: findAddAnswerType,
                            selectNumberOfSliders: tacticalDecisionGame.selectNumberOfSliders,
                            bestNames: findBestPractices,
                            Texts: findRatingScaleText,
                            selectTargetAudience: tacticalDecisionGame.selectTargetAudience,
                            timeLimit: tacticalDecisionGame.timeLimit,
                            selectAnswerType: tacticalDecisionGame.selectAnswerType,
                            minimumValue: tacticalDecisionGame.minimumValue,
                            maximumValue: tacticalDecisionGame.maximumValue,
                            minimumValue1: tacticalDecisionGame.minimumValue1,
                            maximumValue1: tacticalDecisionGame.maximumValue1,
                            correctAnswer: tacticalDecisionGame.correctAnswer,
                            isVoiceToText: tacticalDecisionGame.isVoiceToText,
                            selectLine: tacticalDecisionGame.selectLine,
                            selectPosition: tacticalDecisionGame.selectPosition,
                            selectGoals: tacticalDecisionGame.selectGoals,
                            selectCategory: tacticalDecisionGame.selectCategory,
                            selectDecisivePointName: tacticalDecisionGame.selectDecisivePointName,
                            tacticalFunctionWithObjectivesIncident: objectivesDataIncident,
                            tacticalFunctionWithObjectivesAction: objectivesDataAction,
                            isDeleted: tacticalDecisionGame.isDeleted,
                            priorityType: tacticalDecisionGame.isPriorityType,
                            publish: tacticalDecisionGame.publish,
                            numeric: tacticalDecisionGame.numeric,
                            texting: tacticalDecisionGame.texting,
                            createdAt: tacticalDecisionGame.createdAt,
                            updatedAt: tacticalDecisionGame.updatedAt,
                        };
                        response.push(obj)
                    }
                }

            } else if (type === 'incidentPriorities') {

                let responseTypeId = req.body.responseTypeId

                if (!responseTypeId) {
                    throw new Error('responseTypeId is required.')
                }

                let organizationFind = await ORGANIZATION.findOne({ userId: req.userId })

                let responseType = await RESPONSE_TYPE.findOne({ _id: responseTypeId, organizationId: organizationFind._id })
                // console.log("responseType", responseType);
                if (!responseType) {
                    throw new Error("responseType not created by your organization")
                } else if (responseType.isDeleted === true) {
                    throw new Error("responseType is already deleted")
                }

                // let existingPriorities = await INCIDENT_PRIORITIES.find({ isDeleted: false, organizationId: organizationFind._id });

                for (const id of arrayOfIds) {

                    let getLastPriority = await INCIDENT_PRIORITIES.findOne({ isDeleted: false, organizationId: organizationFind._id }).sort({ index: -1 });
                    let maxIndex = 1;
                    if (getLastPriority) {
                        maxIndex = getLastPriority.index + 1;
                    }

                    let existingPriorityGlobal = await INCIDENT_PRIORITIES.findOne({ isDeleted: false, _id: id, organizationId: "" });

                    let newIncidentType = await INCIDENT_PRIORITIES.create({
                        responseTypeId: responseTypeId,
                        organizationId: organizationFind._id,
                        parentId: existingPriorityGlobal.parentId || '',
                        name: existingPriorityGlobal.name || null,
                        icon: existingPriorityGlobal.icon || null,
                        color: existingPriorityGlobal.color || null,
                        originalDataId: id,
                        index: maxIndex,
                        isDeleted: false
                    });
                    response.push(newIncidentType);
                }

            } else if (type === 'objectives') {

                let { incidentPrioritiesId } = req.body

                if (!incidentPrioritiesId) {
                    throw new Error('incidentPriorityId is required.')
                }

                const incidentPriority = await INCIDENT_PRIORITIES.findOne({ _id: incidentPrioritiesId, isDeleted: false })
                let organizationFind = await ORGANIZATION.findOne({ userId: req.userId, isDeleted: false })
                let responseType = await RESPONSE_TYPE.findOne({ _id: incidentPriority?.responseTypeId, organizationId: organizationFind._id })

                if (!responseType) {
                    throw new Error("responseType not created by your organization.")
                } else if (responseType.isDeleted === true) {
                    throw new Error("This response is already deleted.")
                } if (!incidentPriority) {
                    throw new Error('incidentPriorities not created by your organization')
                } else if (incidentPriority.isDeleted === true) {
                    throw new Error('incidentPriorities is already deleted')
                }

                for (const id of arrayOfIds) {

                    let getLastObjective = await OBJECTIVES.findOne({ isDeleted: false, incidentPrioritiesId: incidentPriority._id }).sort({ index: -1 });
                    let maxIndex = 1;
                    // console.log(getLastObjective, "lastObjective");
                    if (getLastObjective) {
                        maxIndex = getLastObjective.index + 1;
                    }

                    let existingObjectiveGlobal = await OBJECTIVES.findOne({ isDeleted: false, _id: id, organizationId: "" });

                    if (!existingObjectiveGlobal) {
                        continue;
                    }

                    let newObjective = await OBJECTIVES.create({
                        incidentPrioritiesId: incidentPriority._id,
                        responseTypeId: responseType._id,
                        organizationId: organizationFind._id,
                        parentId: '',
                        name: existingObjectiveGlobal.name,
                        isDeleted: false,
                        index: maxIndex,
                        originalDataId: id
                    })
                    response.push(newObjective);
                }

            } else if (type === 'thinkingPlaning') {

                let { objectivesId } = req.body;

                if (!objectivesId) {
                    throw new Error('objectivesId is required.')
                }

                let organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
                let existingObjective = await OBJECTIVES.findOne({ isDeleted: false, _id: objectivesId, organizationId: organizationFind._id })
                console.log(existingObjective)
                if (!existingObjective) {
                    throw new Error("objectives not created by your organization.");
                } else if (existingObjective.isDeleted === true) {
                    throw new Error("objectives is already deleted.");
                }

                for (const id of arrayOfIds) {

                    let exitingThinkingPlanning = await THINKING_PLANNING.findOne({ _id: id, objectivesId: existingObjective.originalDataId, isDeleted: false })
                    console.log(exitingThinkingPlanning, "exitingThinkingPlanning")
                    if (!exitingThinkingPlanning) {
                        continue;
                    }



                    let newThinkingPlanning = await THINKING_PLANNING.create({
                        responseTypeId: existingObjective.responseTypeId,
                        incidentPrioritiesId: existingObjective.incidentPrioritiesId,
                        objectivesId: existingObjective._id,
                        organizationId: organizationFind.id,
                        parentId: null,
                        name: exitingThinkingPlanning.name || null,
                        selectAnswerType: exitingThinkingPlanning.selectAnswerType || null,
                        selectSliderType: exitingThinkingPlanning.selectSliderType || null,
                        publish: exitingThinkingPlanning.publish || false,
                        isDeleted: false,
                        isPriorityType: exitingThinkingPlanning.isPriorityType || false,
                        originalDataId: id
                    });

                    let addSliderTypesArray = [];
                    let textsArray = []

                    if (exitingThinkingPlanning.selectAnswerType === 'list') {

                        let sliderTypes = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.find({ thinkingPlanningId: exitingThinkingPlanning._id, isDeleted: false })

                        for (const iterator of sliderTypes) {
                            let addSliderTypeCreate = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.create({
                                thinkingPlanningId: newThinkingPlanning._id,
                                name: iterator.name,
                                position: iterator.position,
                                actualPriority: iterator.actualPriority,
                                isDeleted: false
                            })
                            addSliderTypesArray.push(addSliderTypeCreate);
                        }
                    } else if (exitingThinkingPlanning.selectAnswerType === "ratingScale") {
                        if (exitingThinkingPlanning.selectSliderType === 'numeric') {
                            if (exitingThinkingPlanning.selectNumberOfSliders === "singleSlider") {
                                await THINKING_PLANNING.findByIdAndUpdate(newThinkingPlanning._id, {
                                    minimumValue: exitingThinkingPlanning.minimumValue,
                                    maximumValue: exitingThinkingPlanning.maximumValue,
                                    selectNumberOfSliders: exitingThinkingPlanning.selectNumberOfSliders,  //
                                });
                            } if (exitingThinkingPlanning.selectNumberOfSliders === "twoSlider") {
                                await THINKING_PLANNING.findByIdAndUpdate(newThinkingPlanning._id, {
                                    minimumValue: exitingThinkingPlanning.minimumValue,
                                    maximumValue: exitingThinkingPlanning.maximumValue,
                                    minimumValue1: exitingThinkingPlanning.minimumValue1,
                                    maximumValue1: exitingThinkingPlanning.maximumValue1,
                                    selectNumberOfSliders: exitingThinkingPlanning.selectNumberOfSliders,  //
                                });
                            }
                        } if (exitingThinkingPlanning.selectSliderType === 'text') {

                            if (exitingThinkingPlanning.selectNumberOfSliders === 'singleSlider' || exitingThinkingPlanning.selectNumberOfSliders === 'twoSlider') {

                                await THINKING_PLANNING.findByIdAndUpdate(newThinkingPlanning._id, {
                                    selectNumberOfSliders: exitingThinkingPlanning.selectNumberOfSliders,  //
                                });

                                let thinkingPlaningText = await THINKING_PLANNING_TEXT.find({ thinkingPlanningId: exitingThinkingPlanning._id, isDeleted: false })
                                console.log(thinkingPlaningText, "thinkingPlaningText")

                                for (const iterator of thinkingPlaningText) {
                                    let textCreate = await THINKING_PLANNING_TEXT.create({
                                        thinkingPlanningId: newThinkingPlanning._id,
                                        slider: iterator.slider,
                                        position: iterator.position,
                                        text: iterator.text,
                                        isDeleted: false
                                    })
                                    textsArray.push(textCreate);
                                }
                                console.log(textsArray, "textsArray");
                            }
                        }
                    }

                    let ARRAYS = { textsArray }

                    let FIND = await THINKING_PLANNING.findById(newThinkingPlanning._id)

                    let newResponse = {
                        thinkingPlanningId: FIND.id,
                        responseTypeId: FIND.responseTypeId,
                        incidentPrioritiesId: FIND.incidentPrioritiesId,
                        objectivesId: FIND.objectivesId,
                        organizationId: FIND.organizationId,
                        parentId: FIND.parentId,
                        name: FIND.name,
                        selectAnswerType: FIND.selectAnswerType,
                        selectSliderType: FIND.selectSliderType,
                        selectNumberOfSliders: FIND?.selectNumberOfSliders || null,
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
                    response.push(newResponse)
                }

            } else if (type === 'actionKeys') {

                const { responseTypeId } = req.body;

                if (!responseTypeId) {
                    throw new Error('responseTypeId is required.')
                }

                let organizationFind = await ORGANIZATION.findOne({ userId: req.userId, isDeleted: false })

                let responseType = await RESPONSE_TYPE.findOne({ _id: responseTypeId, organizationId: organizationFind._id })
                if (!responseType) {
                    throw new Error("responseType not created by your organization")
                } else if (responseType.isDeleted === true) {
                    throw new Error("responseType is already deleted")
                } else if (!responseType.organizationId) {
                    throw new Error('you are not allowed for import.')
                }

                // let actionKeys = await ACTION_KEYS.find({ isDeleted: false, organizationId: "", responseTypeId: responseType.originalDataId })

                for (const id of arrayOfIds) {

                    console.log({ _id: id, isDeleted: false, organizationId: "" })

                    let exitingActionKeyGlobal = await ACTION_KEYS.findOne({ _id: id, isDeleted: false, organizationId: "" })
                    console.log(exitingActionKeyGlobal, "exitingActionKeyGlobal")
                    if (!exitingActionKeyGlobal) {
                        continue;
                    }

                    let getLastActionKey = await ACTION_KEYS.findOne({ isDeleted: false, organizationId: organizationFind._id, responseTypeId: responseTypeId }).sort({ index: -1 });
                    let maxIndex = 1;

                    if (getLastActionKey) {
                        maxIndex = getLastActionKey.index + 1;
                    }

                    let newActionKey = await ACTION_KEYS.create({
                        responseTypeId: responseTypeId,
                        organizationId: organizationFind._id,
                        parentId: '',
                        name: exitingActionKeyGlobal.name,
                        icon: exitingActionKeyGlobal.icon,
                        color: exitingActionKeyGlobal.color,
                        isDeleted: false,
                        index: maxIndex,
                        originalDataId: id
                    })
                    response.push(newActionKey)
                }


            } else if (type === 'actionList') {

                const { actionKeyId } = req.body;

                if (!actionKeyId) {
                    throw new Error('actionKeyId is required.')
                }

                let organizationFind = await ORGANIZATION.findOne({ userId: req.userId, isDeleted: false })

                let actionKey = await ACTION_KEYS.findOne({ _id: actionKeyId, organizationId: organizationFind._id })

                if (!actionKey) {
                    throw new Error("actionKey not created by your organization")
                } else if (actionKey.isDeleted === true) {
                    throw new Error("actionKey is already deleted")
                } else if (!actionKey.organizationId) {
                    throw new Error('you are not allowed for import.')
                }

                for (const id of arrayOfIds) {

                    let getLastActionList = await ACTION_LIST.findOne({ isDeleted: false, organizationId: organizationFind._id, actionKeysId: actionKeyId }).sort({ index: -1 });
                    let maxIndex = 1;
                    console.log(getLastActionList, ';;;;;')
                    if (getLastActionList) {
                        maxIndex = getLastActionList.index + 1;
                    }

                    let existingActionListGlobal = await ACTION_LIST.findOne({ isDeleted: false, _id: id, organizationId: "" });
                    let newActionList = await ACTION_LIST.create({
                        actionKeysId: actionKeyId,
                        organizationId: organizationFind._id,
                        parentId: '',
                        name: existingActionListGlobal?.name,
                        isDeleted: false,
                        index: maxIndex,
                        originalDataId: id
                    })
                    response.push(newActionList);
                }

            } else {
                throw new Error('please provide valid type.')
            }
        }

        res.status(200).json({
            status: "success",
            message: "Data import successfully.",
            data: response,
        });
    } catch (error) {
        res.status(400).json({
            status: "failed",
            message: error.message,
        });
    }
}

exports.syncData = async (req, res) => {
    try {

        let { type, currentDataId } = req.body

        if (!type) {
            throw new Error('type is required.')
        } else if (!currentDataId) {
            throw new Error('currentDataId is required.')
        }

        let response = [];

        if (req.role === 'organization') {

            if (type === 'responseTypes') {

                let currentData = await RESPONSE_TYPE.findOne({ _id: currentDataId })
                let originalData = await RESPONSE_TYPE.findOne({ _id: currentData?.originalDataId })

                if (!originalData || !currentData) {
                    throw new Error('please provide valid IDs')
                }

                currentData.name = originalData.name;
                currentData.isDeleted = originalData.isDeleted;
                currentData.isUpdated = false;
                currentData.save();
                response = currentData;

            } else if (type === 'incidentTypes') {

                let currentData = await INCIDENT_TYPE.findOne({ _id: currentDataId })
                let originalData = await INCIDENT_TYPE.findOne({ _id: currentData?.originalDataId })

                if (!originalData || !currentData) {
                    throw new Error('please provide valid IDs')
                }

                currentData.name = originalData.name;
                currentData.isDeleted = originalData.isDeleted;
                currentData.isUpdated = false;
                currentData.save();
                response = currentData;

            } else if (type === 'assignments') {

                let currentData = await ASSIGNMENT.findOne({ _id: currentDataId })
                let originalData = await ASSIGNMENT.findOne({ _id: currentData?.originalDataId })

                if (!originalData || !currentData) {
                    throw new Error('please provide valid IDs')
                }

                currentData.name = originalData.name;
                currentData.isDeleted = originalData.isDeleted;
                currentData.isUpdated = false;
                currentData.save();
                response = currentData;

            } else if (type === 'tdgLibraries') {

                let currentData = await TDG_LIBRARY.findOne({ _id: currentDataId })
                let originalData = await TDG_LIBRARY.findOne({ _id: currentData?.originalDataId })

                if (!originalData || !currentData) {
                    throw new Error('please provide valid IDs')
                }

                let originalDataBestPractices = await BEST_PRACTICES_TDG.find({ tdgLibraryId: originalData._id, isDeleted: false })

                const bestPracticesArray = [];
                await BEST_PRACTICES_TDG.deleteMany({ tdgLibraryId: currentData._id })
                for (const bestName of originalDataBestPractices) {
                    const bestPracticesTdg = await BEST_PRACTICES_TDG.create({
                        tdgLibraryId: currentData._id,
                        name: bestName.name,
                        isDeleted: false,
                    });
                    bestPracticesArray.push(bestPracticesTdg);
                }

                currentData.audio = originalData.audio;
                currentData.goalObjective = originalData.goalObjective;
                currentData.image = originalData.image;
                currentData.missionBriefing = originalData.missionBriefing;
                currentData.name = originalData.name;
                currentData.parentId = originalData.parentId;
                currentData.publish = originalData.publish;
                currentData.targetAudience = originalData.targetAudience;
                currentData.text = originalData.text;
                currentData.isDeleted = originalData.isDeleted;
                currentData.isUpdated = false;
                currentData.save();

                response = currentData;

            } else if (type === "tacticalDecisionGames") {

                let { isForce } = req.body

                let organizationFind = await ORGANIZATION.findOne({ userId: req.userId, isDeleted: false })

                let currentData = await TACTICAL_DECISION_GAME.findOne({ _id: currentDataId })
                let originalData = await TACTICAL_DECISION_GAME.findOne({ _id: currentData?.originalDataId })
                let tdgLibrary = await TDG_LIBRARY.findOne({ _id: currentData.tdgLibraryId })

                if (!originalData || !currentData) {
                    throw new Error('please provide valid IDs')
                }

                // if (originalData.selectAnswerType === "functionKeys") {
                //     let tacticalDecisionGameFunction = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: originalData._id, idType: 'incidentPriorities' })

                //     for (const iterator of tacticalDecisionGameFunction) {

                //         let superAdminIncidentFunction = await INCIDENT_PRIORITIES.findOne({ _id: iterator.incidentPrioritiesId, isDeleted: false })

                //         console.log('::::::::', { originalDataId: iterator.incidentPrioritiesId, organizationId: organizationFind._id })

                //         let isValidIncidentPriorityFunction = await INCIDENT_PRIORITIES.find({ originalDataId: iterator.incidentPrioritiesId, organizationId: organizationFind._id, isDeleted: false })

                //         if (!isValidIncidentPriorityFunction.length) {
                //             throw new Error(`Incident Priority ${superAdminIncidentFunction?.name ? `"${superAdminIncidentFunction?.name}"` : ''} is not found in your organization's Incident Priorities. Please import it first.`);
                //         }
                //     }
                //     let tacticalDecisionGameFunction2 = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: originalData._id, idType: 'actionKeys' })
                //     for (const iterator of tacticalDecisionGameFunction2) {
                //         let superAdminActionKeyFunction = await ACTION_KEYS.findOne({ _id: iterator.actionKeysId, isDeleted: false })
                //         let isValidActionKeyPriorityFunction = await ACTION_KEYS.find({ originalDataId: iterator.actionKeysId, organizationId: organizationFind._id, isDeleted: false })
                //         if (!isValidActionKeyPriorityFunction.length) {
                //             throw new Error(`Action Key  ${superAdminActionKeyFunction?.name ? `"${superAdminActionKeyFunction?.name}"` : ''} is not found in your organization's Action Keys. Please import it first.`);
                //         }

                //     }

                // }
                const newTacticalGamesIds = [];
                let isRunning = false;

                console.log(isForce, "isForce")

                if (!isForce) {
                    console.log("ENTER FALSE")
                    if (originalData.selectAnswerType === "functionKeys") {
                        let tacticalDecisionGameFunction = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: originalData._id, idType: 'incidentPriorities' })

                        for (const iterator of tacticalDecisionGameFunction) {

                            let superAdminIncidentFunction = await INCIDENT_PRIORITIES.findOne({ _id: iterator.incidentPrioritiesId, isDeleted: false })
                            let isValidIncidentPriorityFunction = await INCIDENT_PRIORITIES.find({ originalDataId: iterator.incidentPrioritiesId, organizationId: organizationFind._id, isDeleted: false })
                            if (!isValidIncidentPriorityFunction.length) {
                                let message = `Incident Priority ${superAdminIncidentFunction?.name ? `"${superAdminIncidentFunction.name}"` : ''} is not found in your organization's Incident Priorities. Please import it first.`;
                                return res.status(200).json({
                                    status: 202,
                                    message: message,
                                    data: [],
                                });
                            }
                        }

                        let tacticalDecisionGameFunction2 = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: originalData._id, idType: 'actionKeys' })
                        for (const iterator of tacticalDecisionGameFunction2) {
                            let superAdminActionKeyFunction = await ACTION_KEYS.findOne({ _id: iterator.actionKeysId, isDeleted: false })
                            let isValidActionKeyPriorityFunction = await ACTION_KEYS.find({ originalDataId: iterator.actionKeysId, organizationId: organizationFind._id, isDeleted: false })
                            if (!isValidActionKeyPriorityFunction.length) {
                                let message = `Action Key  ${superAdminActionKeyFunction?.name ? `"${superAdminActionKeyFunction.name}"` : ''} is not found in your organization's Action Keys. Please import it first.`;
                                return res.status(200).json({
                                    status: 202,
                                    message: message,
                                    data: [],
                                });
                            }

                        }
                    }
                    isRunning = true;
                } else if (isForce == true) {
                    if (originalData.selectAnswerType === "functionKeys") {
                        let tacticalDecisionGameFunction = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: originalData._id, idType: 'incidentPriorities' })

                        for (const iterator of tacticalDecisionGameFunction) {

                            let superAdminIncidentFunction = await INCIDENT_PRIORITIES.findOne({ _id: iterator.incidentPrioritiesId, isDeleted: false })
                            let isValidIncidentPriorityFunction = await INCIDENT_PRIORITIES.find({ originalDataId: iterator.incidentPrioritiesId, organizationId: organizationFind._id, isDeleted: false })
                            if (!isValidIncidentPriorityFunction.length) {
                                let getLastPriority = await INCIDENT_PRIORITIES.findOne({ isDeleted: false, organizationId: organizationFind._id }).sort({ index: -1 });
                                let maxIndex = 1;
                                if (getLastPriority) {
                                    maxIndex = getLastPriority.index + 1;
                                }
                                await INCIDENT_PRIORITIES.create({
                                    responseTypeId: tdgLibrary.responseTypeId,
                                    organizationId: organizationFind._id,
                                    parentId: superAdminIncidentFunction.parentId || '',
                                    name: superAdminIncidentFunction.name || null,
                                    icon: superAdminIncidentFunction.icon || null,
                                    color: superAdminIncidentFunction.color || null,
                                    originalDataId: superAdminIncidentFunction._id,
                                    index: maxIndex,
                                    isDeleted: false
                                });
                            }
                        }

                        let tacticalDecisionGameFunction2 = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: originalData._id, idType: 'actionKeys' })
                        for (const iterator of tacticalDecisionGameFunction2) {
                            let superAdminActionKeyFunction = await ACTION_KEYS.findOne({ _id: iterator.actionKeysId, isDeleted: false })
                            let isValidActionKeyPriorityFunction = await ACTION_KEYS.find({ originalDataId: iterator.actionKeysId, organizationId: organizationFind._id, isDeleted: false })
                            if (!isValidActionKeyPriorityFunction.length) {
                                // let message = `Action Key  ${superAdminActionKeyFunction?.name ? `"${superAdminActionKeyFunction.name}"` : ''} is not found in your organization's Action Keys. Please import it first.`;
                                let getLastActionKey = await ACTION_KEYS.findOne({ isDeleted: false, organizationId: organizationFind._id, responseTypeId: tdgLibrary.responseTypeId }).sort({ index: -1 });
                                let maxIndex = 1;

                                if (getLastActionKey) {
                                    maxIndex = getLastActionKey.index + 1;
                                }

                                await ACTION_KEYS.create({
                                    responseTypeId: tdgLibrary.responseTypeId,
                                    organizationId: organizationFind._id,
                                    parentId: '',
                                    name: superAdminActionKeyFunction.name,
                                    icon: superAdminActionKeyFunction.icon,
                                    color: superAdminActionKeyFunction.color,
                                    isDeleted: false,
                                    index: maxIndex,
                                    originalDataId: superAdminActionKeyFunction._id
                                })
                            }

                        }
                    }
                }

                currentData.text = originalData.text;
                currentData.parentId = originalData.parentId;
                currentData.selectTargetAudience = originalData.selectTargetAudience;
                currentData.timeLimit = originalData.timeLimit;
                currentData.selectAnswerType = originalData.selectAnswerType;
                currentData.numeric = originalData.numeric;
                currentData.texting = originalData.texting;
                currentData.minimumValue = originalData.minimumValue;
                currentData.maximumValue = originalData.maximumValue;
                currentData.minimumValue1 = originalData.minimumValue1;
                currentData.maximumValue1 = originalData.maximumValue1;
                currentData.correctAnswer = originalData.correctAnswer;
                currentData.isVoiceToText = originalData.isVoiceToText;
                currentData.selectLine = originalData.selectLine;
                currentData.selectPosition = originalData.selectPosition;
                currentData.selectGoals = originalData.selectGoals;
                currentData.selectCategory = originalData.selectCategory;
                currentData.selectDecisivePointName = originalData.selectDecisivePointName;
                // currentData.selectNumberOfSliders = originalData.selectNumberOfSliders;
                currentData.isPriorityType = originalData.isPriorityType;
                currentData.publish = originalData.publish;
                currentData.isDeleted = originalData.isDeleted;
                currentData.isUpdated = false;
                // currentData.image = originalData.image;
                currentData.save();

                await TACTICAL_DECISION_GAME_IMAGE.deleteMany({ tacticalDecisionGameId: currentData._id });
                let tacticalDecisionGameImage = await TACTICAL_DECISION_GAME_IMAGE.find({ tacticalDecisionGameId: originalData._id, isDeleted: false })
                console.log(tacticalDecisionGameImage)
                for (const tact_Game_Image of tacticalDecisionGameImage) {
                    await TACTICAL_DECISION_GAME_IMAGE.create({
                        tacticalDecisionGameId: currentData._id,
                        image: tact_Game_Image.image ? tact_Game_Image.image : null,
                        audio: tact_Game_Image.audio ? tact_Game_Image.audio : null,
                        answer: tact_Game_Image.answer ? tact_Game_Image.answer : null,
                        isDeleted: false
                    });
                }

                const bestPracticesArray = [];
                await BEST_PRACTICES_DECISION_GAME.deleteMany({ tacticalDecisionGameId: currentData._id })
                let tacticalDecisionGameBestNames = await BEST_PRACTICES_DECISION_GAME.find({ tacticalDecisionGameId: originalData._id })
                for (const iterator of tacticalDecisionGameBestNames) {
                    let bestPracticesDecisionGame = await BEST_PRACTICES_DECISION_GAME.create({
                        tacticalDecisionGameId: currentData._id,
                        name: iterator?.name ? iterator?.name : null,
                        isDeleted: false
                    });
                    bestPracticesArray.push(bestPracticesDecisionGame);
                }

                if (originalData.selectAnswerType === 'list') {

                    await Promise.all([
                        TACTICAL_FUNCTION.deleteMany({ tacticalDecisionGameId: currentData._id }),
                        TACTICAL_DECISION_GAME_ADD_ANSWER.deleteMany({ tacticalDecisionGameId: currentData._id }),
                        TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.deleteMany({ tacticalDecisionGameId: currentData._id })
                    ]);

                    let tacticalDecisionGameAddAnswer = await TACTICAL_DECISION_GAME_ADD_ANSWER.find({ tacticalDecisionGameId: originalData._id, isDeleted: false })
                    for (const add_answer of tacticalDecisionGameAddAnswer) {
                        await TACTICAL_DECISION_GAME_ADD_ANSWER.create({
                            tacticalDecisionGameId: currentData._id,
                            answer: add_answer.answer ? add_answer.answer : null,
                            position: add_answer.position ? add_answer.position : null,
                            isDeleted: false
                        });
                    }

                } else if (originalData.selectAnswerType === "ratingScale") {

                    await Promise.all([
                        TACTICAL_FUNCTION.deleteMany({ tacticalDecisionGameId: currentData._id }),
                        TACTICAL_DECISION_GAME_ADD_ANSWER.deleteMany({ tacticalDecisionGameId: currentData._id }),
                        TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.deleteMany({ tacticalDecisionGameId: currentData._id })
                    ]);

                    await TACTICAL_DECISION_GAME.findByIdAndUpdate(currentData.id, {
                        selectNumberOfSliders: originalData.selectNumberOfSliders || null
                    }, { new: true })


                    let tacticalDecisionGameRatingScale = await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.find({ tacticalDecisionGameId: originalData._id, })
                    for (const ratingScale of tacticalDecisionGameRatingScale) {
                        await TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.create({
                            tacticalDecisionGameId: currentData._id,
                            slider: ratingScale.slider,
                            position: ratingScale.position,
                            actualPriority: ratingScale.actualPriority,
                            ratingScaleText: ratingScale.ratingScaleText,
                            isDeleted: false,
                        });
                    }

                } else if (originalData.selectAnswerType === "voiceToText") {

                    await Promise.all([
                        TACTICAL_FUNCTION.deleteMany({ tacticalDecisionGameId: currentData._id }),
                        TACTICAL_DECISION_GAME_ADD_ANSWER.deleteMany({ tacticalDecisionGameId: currentData._id }),
                        TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.deleteMany({ tacticalDecisionGameId: currentData._id })
                    ]);

                } else if (originalData.selectAnswerType === "functionKeys") {

                    await Promise.all([
                        TACTICAL_FUNCTION.deleteMany({ tacticalDecisionGameId: currentData._id }),
                        TACTICAL_DECISION_GAME_ADD_ANSWER.deleteMany({ tacticalDecisionGameId: currentData._id }),
                        TACTICAL_DECISION_GAME_RATING_SCALE_TEXT.deleteMany({ tacticalDecisionGameId: currentData._id })
                    ]);

                    let incidentPriorities = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: originalData._id, idType: 'incidentPriorities', })
                    for (const iterator of incidentPriorities) {
                        let isValidPriority = await INCIDENT_PRIORITIES.findOne({ originalDataId: iterator.incidentPrioritiesId, organizationId: organizationFind._id, isDeleted: false })
                        await TACTICAL_FUNCTION.create({
                            tacticalDecisionGameId: currentData._id,
                            idType: iterator.idType,
                            incidentPrioritiesId: isValidPriority._id || null,
                        });
                    }

                    let actionKeyIds = await TACTICAL_FUNCTION.find({ tacticalDecisionGameId: originalData._id, idType: 'actionKeys', })
                    for (const iterator of actionKeyIds) {
                        let isValidActionKey = await ACTION_KEYS.findOne({ originalDataId: iterator.actionKeysId, organizationId: organizationFind._id, isDeleted: false })
                        await TACTICAL_FUNCTION.create({
                            tacticalDecisionGameId: currentData._id,
                            idType: iterator.idType,
                            actionKeysId: isValidActionKey._id || null,
                        });
                    }
                }

            } else if (type === 'incidentPriorities') {

                let currentData = await INCIDENT_PRIORITIES.findOne({ _id: currentDataId })
                let originalData = await INCIDENT_PRIORITIES.findOne({ _id: currentData?.originalDataId })

                if (!originalData || !currentData) {
                    throw new Error('please provide valid IDs')
                }

                currentData.parentId = originalData.parentId;
                currentData.name = originalData.name;
                currentData.icon = originalData.icon;
                currentData.color = originalData.color;
                currentData.isDeleted = originalData.isDeleted;
                currentData.isUpdated = false;
                currentData.save();

                response = currentData;

            } else if (type === 'objectives') {

                let currentData = await OBJECTIVES.findOne({ _id: currentDataId })
                let originalData = await OBJECTIVES.findOne({ _id: currentData?.originalDataId })

                if (!originalData || !currentData) {
                    throw new Error('please provide valid IDs')
                }

                currentData.parentId = originalData.parentId;
                currentData.name = originalData.name;
                currentData.isDeleted = originalData.isDeleted;
                currentData.isUpdated = false;
                currentData.save();

                response = currentData;

            } else if (type === 'thinkingPlaning') {

                let currentData = await THINKING_PLANNING.findOne({ _id: currentDataId })
                let originalData = await THINKING_PLANNING.findOne({ _id: currentData?.originalDataId })

                if (!originalData || !currentData) {
                    throw new Error('please provide valid IDs')
                }

                currentData.parentId = originalData.parentId;
                currentData.name = originalData.name;
                currentData.selectAnswerType = originalData.selectAnswerType;
                currentData.selectSliderType = originalData.selectSliderType;
                currentData.publish = originalData.publish;
                currentData.isDeleted = originalData.isDeleted;
                currentData.isPriorityType = originalData.isPriorityType;
                // currentData.minimumValue = originalData.minimumValue;
                // currentData.maximumValue = originalData.maximumValue;
                // currentData.minimumValue1 = originalData.minimumValue1;
                // currentData.maximumValue1 = originalData.maximumValue1;
                currentData.isUpdated = false;
                currentData.save();


                let addSliderTypesArray = [];
                let textsArray = []

                if (originalData.selectAnswerType === 'list') {

                    await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.deleteMany({ thinkingPlanningId: currentData._id })

                    let sliderTypes = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.find({ thinkingPlanningId: originalData._id, isDeleted: false })

                    for (const iterator of sliderTypes) {
                        let addSliderTypeCreate = await THINKING_PLANNING_SELECT_ANSWER_TYPE_LIST.create({
                            thinkingPlanningId: currentData._id,
                            name: iterator.name,
                            position: iterator.position,
                            actualPriority: iterator.actualPriority,
                            isDeleted: false
                        })
                        addSliderTypesArray.push(addSliderTypeCreate);
                    }
                } else if (originalData.selectAnswerType === "ratingScale") {
                    if (originalData.selectSliderType === 'numeric') {
                        if (originalData.selectNumberOfSliders === "singleSlider") {
                            await THINKING_PLANNING.findByIdAndUpdate(currentData._id, {
                                minimumValue: originalData.minimumValue,
                                maximumValue: originalData.maximumValue,
                                selectNumberOfSliders: originalData.selectNumberOfSliders,  //
                            });
                        } if (originalData.selectNumberOfSliders === "twoSlider") {
                            await THINKING_PLANNING.findByIdAndUpdate(currentData._id, {
                                minimumValue: originalData.minimumValue,
                                maximumValue: originalData.maximumValue,
                                minimumValue1: originalData.minimumValue1,
                                maximumValue1: originalData.maximumValue1,
                                selectNumberOfSliders: originalData.selectNumberOfSliders,  //
                            });
                        }
                    } if (originalData.selectSliderType === 'text') {

                        if (originalData.selectNumberOfSliders === 'singleSlider' || originalData.selectNumberOfSliders === 'twoSlider') {

                            await THINKING_PLANNING.findByIdAndUpdate(currentData._id, {
                                selectNumberOfSliders: originalData.selectNumberOfSliders,  //
                            });

                            await THINKING_PLANNING_TEXT.deleteMany({ thinkingPlanningId: currentData._id })
                            let thinkingPlaningText = await THINKING_PLANNING_TEXT.find({ thinkingPlanningId: originalData._id, isDeleted: false })

                            for (const iterator of thinkingPlaningText) {
                                let textCreate = await THINKING_PLANNING_TEXT.create({
                                    thinkingPlanningId: currentData._id,
                                    slider: iterator.slider,
                                    position: iterator.position,
                                    text: iterator.text,
                                    isDeleted: false
                                })
                                textsArray.push(textCreate);
                            }
                        }
                    }
                }

                let ARRAYS = { textsArray }

                let FIND = await THINKING_PLANNING.findById(currentData._id)

                let newResponse = {
                    thinkingPlanningId: FIND.id,
                    responseTypeId: FIND.responseTypeId,
                    incidentPrioritiesId: FIND.incidentPrioritiesId,
                    objectivesId: FIND.objectivesId,
                    organizationId: FIND.organizationId,
                    parentId: FIND.parentId,
                    name: FIND.name,
                    selectAnswerType: FIND.selectAnswerType,
                    selectSliderType: FIND.selectSliderType,
                    selectNumberOfSliders: FIND?.selectNumberOfSliders || null,
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

                response.push(newResponse)

            } else if (type === 'actionKeys') {

                let currentData = await ACTION_KEYS.findOne({ _id: currentDataId })
                let originalData = await ACTION_KEYS.findOne({ _id: currentData?.originalDataId })

                if (!originalData || !currentData) {
                    throw new Error('please provide valid IDs')
                }

                currentData.parentId = originalData.parentId;
                currentData.name = originalData.name;
                currentData.icon = originalData.icon;
                currentData.color = originalData.color;
                currentData.isDeleted = originalData.isDeleted;
                currentData.isUpdated = false;
                currentData.save();
                response = currentData;

            } else if (type === 'actionList') {

                let currentData = await ACTION_LIST.findOne({ _id: currentDataId })
                let originalData = await ACTION_LIST.findOne({ _id: currentData?.originalDataId })

                if (!originalData || !currentData) {
                    throw new Error('please provide valid IDs')
                }

                currentData.parentId = originalData.parentId;
                currentData.name = originalData.name;
                currentData.isDeleted = originalData.isDeleted;
                currentData.isUpdated = false;
                currentData.save();
                response = currentData;
            }
        }

        res.status(200).json({
            status: "success",
            message: 'your data Sync Successfully',
            data: response
        });

    } catch (error) {
        res.status(400).json({
            status: "failed",
            message: error.message,
        });
    }
}