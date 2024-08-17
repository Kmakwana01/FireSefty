const SCENARIO = require('../models/scenarioModel')
const RESPONSE_TYPE = require('../models/responseTypeModel');
const INCIDENT_TYPE = require('../models/incidentTypeModel');
const ASSIGNMENT = require('../models/assignmentModel');
const ORGANIZATION = require('../models/organizationModel');
const APPARATUS = require ('../models/apparatusModel');
const { default: mongoose } = require('mongoose');

exports.createScenario = async function (req, res, next) {
    try {
        var responseTypeId = req.body.responseTypeId;
        var incidentTypeId = req.body.incidentTypeId;
        var assignmentId = req.body.assignmentId;
        if (!responseTypeId) {
            throw new Error("responseTypeId is required.");
        } else if (!incidentTypeId) {
            throw new Error("incidentTypeId is required.");
        } else if (!assignmentId) {
            throw new Error("assignmentId is required.");
        } else if (!req.body.selectApparatus) {
            throw new Error("selectApparatus is required.");
        } else if (!req.body.scenarioProjectLead) {
            throw new Error("scenarioProjectLead is required.");
        } else if (!req.body.incidentAddress) {
            throw new Error("incidentAddress is required.");
        } else if (!req.body.locationAndExtentOfTheFire) {
            throw new Error("locationAndExtentOfTheFire is required.");
        } else if (!req.body.weather) {
            throw new Error("weather is required.");
        }
        console.log("ROLE : -", req.role);

        if (req.role === 'superAdmin') {

            const responseType = await RESPONSE_TYPE.findOne({ _id: responseTypeId });
            if (!responseType) {
                throw new Error("responseType not found.");
            } else if (responseType.isDeleted === true) {
                throw new Error("responseType is already deleted.");
            }
            const incidentType = await INCIDENT_TYPE.findOne({ _id: incidentTypeId });
            if (!incidentType) {
                throw new Error("incidentType not found.");
            } else if (incidentType.isDeleted === true) {
                throw new Error("incidentType is already deleted.");
            }
            const assignment = await ASSIGNMENT.findOne({ _id: assignmentId });
            if (!assignment) {
                throw new Error("assignment not found.");
            } else if (assignment.isDeleted === true) {
                throw new Error("assignment is already deleted.");
            }
            var scenario = await SCENARIO.create({
                responseTypeId: req.body.responseTypeId,
                incidentTypeId: req.body.incidentTypeId,
                assignmentId: req.body.assignmentId,
                organizationId: '',
                parentId: '',
                scenarioProjectLead: (req.body.scenarioProjectLead === null || req.body.scenarioProjectLead === '') ? '' : req.body.scenarioProjectLead,
                goal: (req.body.goal === null || req.body.goal === '') ? '' : req.body.goal,
                incidentAddress: (req.body.incidentAddress === null || req.body.incidentAddress === '') ? '' : req.body.incidentAddress,
                occupantStatus: (req.body.occupantStatus === null || req.body.occupantStatus === '') ? '' : req.body.occupantStatus,
                locationAndExtentOfTheFire: (req.body.locationAndExtentOfTheFire === null || req.body.locationAndExtentOfTheFire === '') ? '' : req.body.locationAndExtentOfTheFire,
                burningRegimeAndExposures: (req.body.burningRegimeAndExposures === null || req.body.burningRegimeAndExposures === '') ? '' : req.body.burningRegimeAndExposures,
                building: (req.body.building === null || req.body.building === '') ? '' : req.body.building,
                weather: (req.body.weather === null || req.body.weather === '') ? '' : req.body.weather,
                narrative: (req.body.narrative === null || req.body.narrative === '') ? '' : req.body.narrative,
                communicationDispatch: (req.body.communicationDispatch === null || req.body.communicationDispatch === '') ? '' : req.body.communicationDispatch,
                resources: (req.body.resources === null || req.body.resources === '') ? '' : req.body.resources,
                selectApparatus: req.body.selectApparatus,
                missionBriefing: (req.body.missionBriefing === null || req.body.missionBriefing === '') ? '' : req.body.missionBriefing,
                publish: req.body.publish || false,
                isDeleted: false,
            })


        } else if (req.role === 'organization') {

            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })

            const responseType = await RESPONSE_TYPE.findOne({ _id: responseTypeId, organizationId: organizationFind._id });
            if (!responseType) {
                throw new Error("responseType not found.");
            } else if (responseType.isDeleted === true) {
                throw new Error("responseType is already deleted.");
            }
            const incidentType = await INCIDENT_TYPE.findOne({ _id: incidentTypeId, organizationId: organizationFind._id });
            if (!incidentType) {
                throw new Error("incidentType not found.");
            } else if (incidentType.isDeleted === true) {
                throw new Error("incidentType is already deleted.");
            }
            const assignment = await ASSIGNMENT.findOne({ _id: assignmentId, organizationId: organizationFind._id });
            if (!assignment) {
                throw new Error("assignment not found.");
            } else if (assignment.isDeleted === true) {
                throw new Error("assignment is already deleted.");
            }
            var organization = new mongoose.Types.ObjectId(organizationFind._id);
            var scenario = await SCENARIO.create({
                responseTypeId: req.body.responseTypeId,
                incidentTypeId: req.body.incidentTypeId,
                assignmentId: req.body.assignmentId,
                organizationId: organization,
                parentId: '',
                scenarioProjectLead: (req.body.scenarioProjectLead === null || req.body.scenarioProjectLead === '') ? '' : req.body.scenarioProjectLead,
                goal: (req.body.goal === null || req.body.goal === '') ? '' : req.body.goal,
                incidentAddress: (req.body.incidentAddress === null || req.body.incidentAddress === '') ? '' : req.body.incidentAddress,
                occupantStatus: (req.body.occupantStatus === null || req.body.occupantStatus === '') ? '' : req.body.occupantStatus,
                locationAndExtentOfTheFire: (req.body.locationAndExtentOfTheFire === null || req.body.locationAndExtentOfTheFire === '') ? '' : req.body.locationAndExtentOfTheFire,
                burningRegimeAndExposures: (req.body.burningRegimeAndExposures === null || req.body.burningRegimeAndExposures === '') ? '' : req.body.burningRegimeAndExposures,
                building: (req.body.building === null || req.body.building === '') ? '' : req.body.building,
                weather: (req.body.weather === null || req.body.weather === '') ? '' : req.body.weather,
                narrative: (req.body.narrative === null || req.body.narrative === '') ? '' : req.body.narrative,
                communicationDispatch: (req.body.communicationDispatch === null || req.body.communicationDispatch === '') ? '' : req.body.communicationDispatch,
                resources: (req.body.resources === null || req.body.resources === '') ? '' : req.body.resources,
                selectApparatus: req.body.selectApparatus,
                missionBriefing: (req.body.missionBriefing === null || req.body.missionBriefing === '') ? '' : req.body.missionBriefing,
                publish: req.body.publish || false,
                isDeleted: false,
            })
        } else {
            throw new Error('you can not access.')
        }
        var response = {
            scenarioId: scenario._id,
            responseTypeId: scenario.responseTypeId,
            incidentTypeId: scenario.incidentTypeId,
            assignmentId: scenario.assignmentId,
            organizationId: scenario.organizationId,
            parentId: scenario.parentId,
            scenarioProjectLead: scenario.scenarioProjectLead,
            goal: scenario.goal,
            incidentAddress: scenario.incidentAddress,
            occupantStatus: scenario.occupantStatus,
            locationAndExtentOfTheFire: scenario.locationAndExtentOfTheFire,
            burningRegimeAndExposures: scenario.burningRegimeAndExposures,
            building: scenario.building,
            weather: scenario.weather,
            narrative: scenario.narrative,
            communicationDispatch: scenario.communicationDispatch,
            resources: scenario.resources,
            selectApparatus: scenario.selectApparatus,
            missionBriefing: scenario.missionBriefing,
            publish: scenario.publish,
            isDeleted: scenario.isDeleted,
            createdAt: scenario.createdAt,
            updatedAt: scenario.updatedAt,
        }
        res.status(200).json({
            status: 'success',
            message: 'Scenario created successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};

exports.getScenario = async function (req, res, next) {
    try {

        console.log("ROLE : -", req.role);

        if (req.role === 'superAdmin') {

            const scenarioList = await SCENARIO.find({ isDeleted: false });

            const scenarioArray = [];

            for (const scenario of scenarioList) {
                const checkIncident = await INCIDENT_TYPE.findOne({
                    _id: scenario?.incidentTypeId,
                    isDeleted: false,
                });

                const checkResponseType = await RESPONSE_TYPE.findOne({
                    _id: scenario?.responseTypeId,
                    isDeleted: false,
                })

                const checkAssignment = await ASSIGNMENT.findOne({
                    _id: scenario?.assignmentId,
                    isDeleted: false,
                });

                if (checkIncident && checkResponseType && checkAssignment) {
                    scenarioArray.push(scenario);
                }
            }

            const scenario = await Promise.all(
                scenarioArray.map(async (record) => {
                    let scenario = await SCENARIO.findOne({ _id: record._id, isDeleted: false }).populate("responseTypeId").populate("incidentTypeId").populate("assignmentId");
                    if (mongoose.isValidObjectId(scenario.selectApparatus)) {
                        let selectApparatus = await APPARATUS.findOne({ _id: record.selectApparatus, isDeleted: false })
                        scenario.apparatusName = selectApparatus ? selectApparatus.apparatusName : '';
                        console.log(scenario)
                    } else {
                        scenario.apparatusName = '';
                    }
                    return scenario
                })
            );

            if (!scenario || !scenarioArray.length) {
                throw new Error('scenario not found.')
            }

            var response = scenario.map((record) => {

                if (record !== null) {
                    
                    var obj = {
                        scenarioId: (record.id === null || record.id === '') ? '' : record.id,
                        responseTypeId: (record.responseTypeId.id === null || record.responseTypeId.id === '') ? '' : record.responseTypeId.id,
                        responseTypeName: (record.responseTypeId.name === null || record.responseTypeId.name === '') ? '' : record.responseTypeId.name,
                        incidentTypeId: (record.incidentTypeId.id === null || record.incidentTypeId.id === '') ? '' : record.incidentTypeId._id,
                        incidentTypeName: (record.incidentTypeId.name === null || record.incidentTypeId.name === '') ? '' : record.incidentTypeId.name,
                        assignmentId: (record.assignmentId.id === null || record.assignmentId.id === '') ? '' : record.assignmentId.id,
                        assignmentName: (record.assignmentId.name === null || record.assignmentId.name === '') ? '' : record.assignmentId.name,
                        scenarioProjectLead: (record.scenarioProjectLead === null || record.scenarioProjectLead === '') ? '' : record.scenarioProjectLead,
                        goal: (record.goal === null || record.goal === '') ? '' : record.goal,
                        incidentAddress: (record.incidentAddress === null || record.incidentAddress === '') ? '' : record.incidentAddress,
                        occupantStatus: (record.occupantStatus === null || record.occupantStatus === '') ? '' : record.occupantStatus,
                        locationAndExtentOfTheFire: (record.locationAndExtentOfTheFire === null || record.locationAndExtentOfTheFire === '') ? '' : record.locationAndExtentOfTheFire,
                        burningRegimeAndExposures: (record.burningRegimeAndExposures === null || record.burningRegimeAndExposures === '') ? '' : record.burningRegimeAndExposures,
                        building: (record.building === null || record.building === '') ? '' : record.building,
                        weather: (record.weather === null || record.weather === '') ? '' : record.weather,
                        narrative: (record.narrative === null || record.narrative === '') ? '' : record.narrative,
                        communicationDispatch: (record.communicationDispatch === null || record.communicationDispatch === '') ? '' : record.communicationDispatch,
                        resources: (record.resources === null || record.resources === '') ? '' : record.resources,
                        selectApparatus: (record.selectApparatus === null || record.selectApparatus === '') ? '' : record.selectApparatus,
                        missionBriefing: (record.missionBriefing === null || record.missionBriefing === '') ? '' : record.missionBriefing,
                        publish: (record.publish === null || record.publish === '') ? '' : record.publish,
                        apparatusName : (record.apparatusName === null || record.apparatusName === '') ? '' : record.apparatusName,
                        isDeleted: record.isDeleted,
                        createdAt: record.createdAt,
                        updatedAt: record.updatedAt,
                    }
                    return obj;
                }
            })
        } else if (req.role === 'organization') {

            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })

            const scenarioList = await SCENARIO.find({ isDeleted: false, organizationId: organizationFind._id })

            const scenarioArray = [];

            for (const scenario of scenarioList) {
                const checkIncident = await INCIDENT_TYPE.findOne({
                    _id: scenario?.incidentTypeId,
                    isDeleted: false,
                });

                const checkResponseType = await RESPONSE_TYPE.findOne({
                    _id: scenario?.responseTypeId,
                    isDeleted: false,
                })

                const checkAssignment = await ASSIGNMENT.findOne({
                    _id: scenario?.assignmentId,
                    isDeleted: false,
                });

                if (checkIncident && checkResponseType && checkAssignment) {
                    scenarioArray.push(scenario);
                }
            }

            const scenario = await Promise.all(
                scenarioArray.map(async (record) => {
                    let scenario = await SCENARIO.findOne({ _id: record._id, isDeleted: false }).populate("responseTypeId").populate("incidentTypeId").populate("assignmentId");
                    if (mongoose.isValidObjectId(scenario.selectApparatus)) {
                        let selectApparatus = await APPARATUS.findOne({ _id: record.selectApparatus, isDeleted: false })
                        scenario.apparatusName = selectApparatus ? selectApparatus.apparatusName : '';
                        console.log(scenario)
                    } else {
                        scenario.apparatusName = '';
                    }
                    return scenario
                })
            );

            // var scenario = await SCENARIO.find({ isDeleted: false, organizationId: organizationFind.id }).populate("responseTypeId").populate("incidentTypeId").populate("assignmentId")

            if (!scenario || !scenarioArray.length) {
                throw new Error('scenario not found')
            }
            //console.log(record.responseTypeId);
            var response = scenario.map((record) => {
                var obj = {
                    scenarioId: (record.id === null || record.id === '') ? '' : record.id,
                    responseTypeId: (record.responseTypeId.id === null || record.responseTypeId.id === '') ? '' : record.responseTypeId.id,
                    responseTypeName: (record.responseTypeId.name === null || record.responseTypeId.name === '') ? '' : record.responseTypeId.name,
                    incidentTypeId: (record.incidentTypeId.id === null || record.incidentTypeId.id === '') ? '' : record.incidentTypeId._id,
                    incidentTypeName: (record.incidentTypeId.name === null || record.incidentTypeId.name === '') ? '' : record.incidentTypeId.name,
                    assignmentId: (record.assignmentId.id === null || record.assignmentId.id === '') ? '' : record.assignmentId.id,
                    assignmentName: (record.assignmentId.name === null || record.assignmentId.name === '') ? '' : record.assignmentId.name,
                    scenarioProjectLead: (record.scenarioProjectLead === null || record.scenarioProjectLead === '') ? '' : record.scenarioProjectLead,
                    goal: (record.goal === null || record.goal === '') ? '' : record.goal,
                    incidentAddress: (record.incidentAddress === null || record.incidentAddress === '') ? '' : record.incidentAddress,
                    occupantStatus: (record.occupantStatus === null || record.occupantStatus === '') ? '' : record.occupantStatus,
                    locationAndExtentOfTheFire: (record.locationAndExtentOfTheFire === null || record.locationAndExtentOfTheFire === '') ? '' : record.locationAndExtentOfTheFire,
                    burningRegimeAndExposures: (record.burningRegimeAndExposures === null || record.burningRegimeAndExposures === '') ? '' : record.burningRegimeAndExposures,
                    building: (record.building === null || record.building === '') ? '' : record.building,
                    weather: (record.weather === null || record.weather === '') ? '' : record.weather,
                    narrative: (record.narrative === null || record.narrative === '') ? '' : record.narrative,
                    communicationDispatch: (record.communicationDispatch === null || record.communicationDispatch === '') ? '' : record.communicationDispatch,
                    resources: (record.resources === null || record.resources === '') ? '' : record.resources,
                    selectApparatus: (record.selectApparatus === null || record.selectApparatus === '') ? '' : record.selectApparatus,
                    missionBriefing: (record.missionBriefing === null || record.missionBriefing === '') ? '' : record.missionBriefing,
                    publish: (record.publish === null || record.publish === '') ? '' : record.publish,
                    apparatusName : (record.apparatusName === null || record.apparatusName === '') ? '' : record.apparatusName,
                    isDeleted: record.isDeleted,
                    createdAt: record.createdAt,
                    updatedAt: record.updatedAt,
                }
                return obj;
            })
        } else if (req.role === 'fireFighter') {

            const scenarioList = await SCENARIO.find({ isDeleted: false, publish: true })

            const scenarioArray = [];

            for (const scenario of scenarioList) {
                const checkIncident = await INCIDENT_TYPE.findOne({
                    _id: scenario?.incidentTypeId,
                    isDeleted: false,
                });

                const checkResponseType = await RESPONSE_TYPE.findOne({
                    _id: scenario?.responseTypeId,
                    isDeleted: false,
                })

                const checkAssignment = await ASSIGNMENT.findOne({
                    _id: scenario?.assignmentId,
                    isDeleted: false,
                });

                if (checkIncident && checkResponseType && checkAssignment) {
                    scenarioArray.push(scenario);
                }
            }

            const scenario = await Promise.all(
                scenarioArray.map(async (record) => {
                    return await SCENARIO.findOne({ _id: record._id, isDeleted: false }).populate("responseTypeId").populate("incidentTypeId").populate("assignmentId");
                })
            );

            // var scenario = await SCENARIO.find({ isDeleted: false, publish: true }).populate("responseTypeId").populate("incidentTypeId").populate("assignmentId")

            if (!scenario || !scenarioArray.length) {
                throw new Error('scenario not found.')
            }

            var response = scenario.map((record) => {
                console.log("record: " + record.publish)
                var obj = {
                    scenarioId: (record.id === null || record.id === '') ? '' : record.id,
                    responseTypeId: (record.responseTypeId.id === null || record.responseTypeId.id === '') ? '' : record.responseTypeId.id,
                    responseTypeName: (record.responseTypeId.name === null || record.responseTypeId.name === '') ? '' : record.responseTypeId.name,
                    incidentTypeId: (record.incidentTypeId.id === null || record.incidentTypeId.id === '') ? '' : record.incidentTypeId._id,
                    incidentTypeName: (record.incidentTypeId.name === null || record.incidentTypeId.name === '') ? '' : record.incidentTypeId.name,
                    assignmentId: (record.assignmentId.id === null || record.assignmentId.id === '') ? '' : record.assignmentId.id,
                    assignmentName: (record.assignmentId.name === null || record.assignmentId.name === '') ? '' : record.assignmentId.name,
                    scenarioProjectLead: (record.scenarioProjectLead === null || record.scenarioProjectLead === '') ? '' : record.scenarioProjectLead,
                    goal: (record.goal === null || record.goal === '') ? '' : record.goal,
                    incidentAddress: (record.incidentAddress === null || record.incidentAddress === '') ? '' : record.incidentAddress,
                    occupantStatus: (record.occupantStatus === null || record.occupantStatus === '') ? '' : record.occupantStatus,
                    locationAndExtentOfTheFire: (record.locationAndExtentOfTheFire === null || record.locationAndExtentOfTheFire === '') ? '' : record.locationAndExtentOfTheFire,
                    burningRegimeAndExposures: (record.burningRegimeAndExposures === null || record.burningRegimeAndExposures === '') ? '' : record.burningRegimeAndExposures,
                    building: (record.building === null || record.building === '') ? '' : record.building,
                    weather: (record.weather === null || record.weather === '') ? '' : record.weather,
                    narrative: (record.narrative === null || record.narrative === '') ? '' : record.narrative,
                    communicationDispatch: (record.communicationDispatch === null || record.communicationDispatch === '') ? '' : record.communicationDispatch,
                    resources: (record.resources === null || record.resources === '') ? '' : record.resources,
                    selectApparatus: (record.selectApparatus === null || record.selectApparatus === '') ? '' : record.selectApparatus,
                    missionBriefing: (record.missionBriefing === null || record.missionBriefing === '') ? '' : record.missionBriefing,
                    publish: record.publish,
                    isDeleted: record.isDeleted,
                    createdAt: record.createdAt,
                    updatedAt: record.updatedAt,
                }
                return obj;
            })
        } else {
            throw new Error('you can not access.')
        }
        res.status(200).json({
            status: 'success',
            message: 'Scenario get successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};

exports.updateScenario = async function (req, res, next) {
    try {

        var id = req.params.id
        var responseTypeId = req.body.responseTypeId;
        var incidentTypeId = req.body.incidentTypeId;
        var assignmentId = req.body.assignmentId;
        if (!responseTypeId) {
            throw new Error("responseTypeId is required.");
        } else if (!incidentTypeId) {
            throw new Error("incidentTypeId is required.");
        } else if (!assignmentId) {
            throw new Error("assignmentId is required.");
        } else if (!req.body.selectApparatus) {
            throw new Error("selectApparatus is required.");
        } else if (!req.body.scenarioProjectLead) {
            throw new Error("scenarioProjectLead is required.");
        } else if (!req.body.incidentAddress) {
            throw new Error("incidentAddress is required.");
        } else if (!req.body.locationAndExtentOfTheFire) {
            throw new Error("locationAndExtentOfTheFire is required.");
        } else if (!req.body.weather) {
            throw new Error("weather is required.");
        }
        console.log("ROLE : -", req.role);



        if (req.role === 'superAdmin') {
            const responseType = await RESPONSE_TYPE.findOne({ _id: responseTypeId });
            if (!responseType) {
                throw new Error("responseType not found.");
            } else if (responseType.isDeleted === true) {
                throw new Error("responseType is already deleted");
            }
            const incidentType = await INCIDENT_TYPE.findOne({ _id: incidentTypeId });
            if (!incidentType) {
                throw new Error("incidentType not found.");
            } else if (incidentType.isDeleted === true) {
                throw new Error("incidentType is already deleted.");
            }
            const assignment = await ASSIGNMENT.findOne({ _id: assignmentId });
            if (!assignment) {
                throw new Error("assignment not found.");
            } else if (assignment.isDeleted === true) {
                throw new Error("assignment is already deleted.");
            }

            const scenarioFind = await SCENARIO.findOne({ _id: id })
            if (!scenarioFind) {
                throw new Error("scenario not found.");
            } else if (scenarioFind.isDeleted === true) {
                throw new Error("scenario is already deleted.");
            }
            console.log("PUBLISH", req.body.publish)
            var scenario = await SCENARIO.findByIdAndUpdate(id, {
                responseTypeId: req.body.responseTypeId,
                incidentTypeId: req.body.incidentTypeId,
                assignmentId: req.body.assignmentId,
                scenarioProjectLead: req.body.scenarioProjectLead,
                goal: req.body.goal,
                incidentAddress: req.body.incidentAddress,
                occupantStatus: req.body.occupantStatus,
                locationAndExtentOfTheFire: req.body.locationAndExtentOfTheFire,
                burningRegimeAndExposures: req.body.burningRegimeAndExposures,
                building: req.body.building,
                weather: req.body.weather,
                narrative: req.body.narrative,
                communicationDispatch: req.body.communicationDispatch,
                resources: req.body.resources,
                selectApparatus: req.body.selectApparatus,
                missionBriefing: req.body.missionBriefing,
                publish: req.body.publish,
                isDeleted: false,
            }, { new: true })


        } else if (req.role === 'organization') {

            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            const responseType = await RESPONSE_TYPE.findOne({ _id: responseTypeId, organizationId: organizationFind._id });
            if (!responseType) {
                throw new Error("responseType not created by your organization.");
            } else if (responseType.isDeleted === true) {
                throw new Error("responseType is already deleted");
            }
            const incidentType = await INCIDENT_TYPE.findOne({ _id: incidentTypeId, organizationId: organizationFind._id });
            if (!incidentType) {
                throw new Error("incidentType created by your organization.");
            } else if (incidentType.isDeleted === true) {
                throw new Error("incidentType is already deleted.");
            }
            const assignment = await ASSIGNMENT.findOne({ _id: assignmentId, organizationId: organizationFind._id });
            if (!assignment) {
                throw new Error("assignment created by your organization.");
            } else if (assignment.isDeleted === true) {
                throw new Error("assignment is already deleted.");
            }

            var scenarioFind = await SCENARIO.findOne({ _id: id, organizationId: organizationFind._id })
            if (!scenarioFind) {
                throw new Error('scenario not crated by your organization.')
            } else if (scenarioFind.isDeleted === true) {
                throw new Error('scenario is already deleted.')
            }

            var scenario = await SCENARIO.findByIdAndUpdate(id, {
                responseTypeId: req.body.responseTypeId,
                incidentTypeId: req.body.incidentTypeId,
                assignmentId: req.body.assignmentId,
                scenarioProjectLead: req.body.scenarioProjectLead,
                goal: req.body.goal,
                incidentAddress: req.body.incidentAddress,
                occupantStatus: req.body.occupantStatus,
                locationAndExtentOfTheFire: req.body.locationAndExtentOfTheFire,
                burningRegimeAndExposures: req.body.burningRegimeAndExposures,
                building: req.body.building,
                weather: req.body.weather,
                narrative: req.body.narrative,
                communicationDispatch: req.body.communicationDispatch,
                resources: req.body.resources,
                selectApparatus: req.body.selectApparatus,
                missionBriefing: req.body.missionBriefing,
                publish: req.body.publish || false,
                isDeleted: false,
            }, { new: true })
        } else {
            throw new Error('you can not access.')
        }
        var response = {
            scenarioId: scenario.id,
            responseTypeId: scenario.responseTypeId,
            incidentTypeId: scenario.incidentTypeId,
            assignmentId: scenario.assignmentId,
            organizationId: scenario.organizationId,
            parentId: scenario.parentId,
            scenarioProjectLead: scenario.scenarioProjectLead,
            goal: scenario.goal,
            incidentAddress: scenario.incidentAddress,
            occupantStatus: scenario.occupantStatus,
            locationAndExtentOfTheFire: scenario.locationAndExtentOfTheFire,
            burningRegimeAndExposures: scenario.burningRegimeAndExposures,
            building: scenario.building,
            weather: scenario.weather,
            narrative: scenario.narrative,
            communicationDispatch: scenario.communicationDispatch,
            resources: scenario.resources,
            selectApparatus: scenario.selectApparatus,
            missionBriefing: scenario.missionBriefing,
            publish: scenario.publish,
            isDeleted: scenario.isDeleted,
            createdAt: scenario.createdAt,
            updatedAt: scenario.updatedAt,
        }
        res.status(200).json({
            status: 'success',
            message: 'Scenario updated successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};

exports.deleteScenario = async function (req, res, next) {
    try {

        var id = req.params.id
        console.log("ROLE : -", req.role);

        if (req.role === 'superAdmin') {

            const scenarioFind = await SCENARIO.findOne({ _id: id })
            if (!scenarioFind) {
                throw new Error("scenario not found.");
            } else if (scenarioFind.isDeleted === true) {
                throw new Error("scenario is already deleted.");
            }
            var scenario = await SCENARIO.findByIdAndUpdate(id, {
                isDeleted: true,
            }, { new: true })

        } else if (req.role === 'organization') {
            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })

            var scenarioFind = await SCENARIO.findOne({ _id: id, organizationId: organizationFind._id })
            if (!scenarioFind) {
                throw new Error('scenario not crated by your organization.')
            } else if (scenarioFind.isDeleted === true) {
                throw new Error('scenario is already deleted.')
            }
            var scenario = await SCENARIO.findByIdAndUpdate(id, {
                isDeleted: true,
            }, { new: true })
        } else {
            throw new Error('you can not access.')
        }
        var response = {
            scenarioId: scenario.id,
            responseTypeId: scenario.responseTypeId,
            incidentTypeId: scenario.incidentTypeId,
            assignmentId: scenario.assignmentId,
            organizationId: scenario.organizationId,
            parentId: scenario.parentId,
            scenarioProjectLead: scenario.scenarioProjectLead,
            goal: scenario.goal,
            incidentAddress: scenario.incidentAddress,
            occupantStatus: scenario.occupantStatus,
            locationAndExtentOfTheFire: scenario.locationAndExtentOfTheFire,
            burningRegimeAndExposures: scenario.burningRegimeAndExposures,
            building: scenario.building,
            weather: scenario.weather,
            narrative: scenario.narrative,
            communicationDispatch: scenario.communicationDispatch,
            resources: scenario.resources,
            selectApparatus: scenario.selectApparatus,
            missionBriefing: scenario.missionBriefing,
            publish: scenario.publish,
            isDeleted: scenario.isDeleted,
            createdAt: scenario.createdAt,
            updatedAt: scenario.updatedAt,
        }
        res.status(200).json({
            status: 'success',
            message: 'Scenario deleted successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};

exports.updateScenarioPublish = async function (req, res, next) {
    try {
        if (!req.params.id) {
            throw new Error("id is required.")
        }
        var find = await SCENARIO.findById(req.params.id)
        var scenario = await SCENARIO.findByIdAndUpdate(req.params.id, {
            publish: req.body.publish
        }, { new: true })

        let message;
        if (scenario.publish === true) {
            message = 'scenario publish published successfully'
        } else if (scenario.publish === false) {
            message = 'scenario publish unpublished successfully'
        }
        
        res.status(200).json({
            status: 'success',
            message: message,
            data: scenario
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
}