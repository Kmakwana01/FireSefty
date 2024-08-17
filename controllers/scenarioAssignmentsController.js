const SCENARIO_ASSIGNMENT = require ('../models/scenarioAssignmentsModel')
const SCENARIO_ASSIGNMENT_IMAGES = require ('../models/scenarioAssignmentImagesModel')
const SCENARIO_ASSIGNMENT_BEST_PRACTICES = require ('../models/scenarioAssignmentBestPracticesModel');
const RESPONSE_TYPE = require ('../models/responseTypeModel');
const INCIDENT_TYPE = require ('../models/incidentTypeModel');
const ASSIGNMENT = require ('../models/assignmentModel');
const SCENARIO = require ('../models/scenarioModel');
const APPARATUS = require ('../models/apparatusModel');
const ORGANIZATION = require ('../models/organizationModel');
const TDG = require ('../models/tdgLibraryModel');
const TDG_LIBRARY = require('../models/tdgLibraryModel');
const { default: mongoose } = require('mongoose');

exports.createScenarioAssignment = async function (req, res, next) {
    try {
        // const audioFiles = req.files["audio"][0];
        // const audioUrl = req.protocol + "://" + req.get("host") + "/images/" + audioFiles.filename;
        // const videoFiles = req.files["video"][0];
        // const videoUrl = req.protocol + "://" + req.get("host") + "/images/" + videoFiles.filename;
        if (!req.body.responseTypeId) {
            throw new Error("responseTypeId is required.");
        } else if (!req.body.incidentTypeId) {
            throw new Error("incidentTypeId is required.");
        } else if (!req.body.assignmentId) {
            throw new Error("assignmentId is required.");
        } else if (!req.body.apparatusId) {
            throw new Error("apparatusId is required.");
        } else if (!req.body.gameFromTDG){
            throw new Error('gameFromTDG is required');
        } else if (!req.body.targetAudience){
            throw new Error('targetAudience is required');
        }
        console.log(videoUrl);
        var audioUrl = '';
        var videoUrl = '';

        if (req.files["audio"] && req.files["audio"].length > 0) {
            var audioFiles = req.files["audio"][0];
            audioUrl = audioFiles.filename;
            //audioUrl = req.protocol + "://" + req.get("host") + "/images/" + audioFiles.filename;
        }

        if (req.files["video"] && req.files["video"].length > 0) {
            var videoFiles = req.files["video"][0];
            videoUrl = videoFiles.filename;
            //videoUrl = req.protocol + "://" + req.get("host") + "/images/" + videoFiles.filename;
        }
        if (req.role === 'superAdmin'){
            const responseType = await RESPONSE_TYPE.findOne({_id : req.body.responseTypeId});
            if (!responseType) {
                throw new Error("responseType not found.");
            }else if (responseType.isDeleted === true){
                throw new Error("responseType is already deleted.");
            }
            const incidentType = await INCIDENT_TYPE.findOne({_id : req.body.incidentTypeId});
            if (!incidentType) {
                throw new Error("incidentType not found.");
            }else if (incidentType.isDeleted === true){
                throw new Error("incidentType is already deleted.");
            }
            const assignment = await ASSIGNMENT.findOne({_id : req.body.assignmentId});
            if (!assignment) {
                throw new Error("assignment not found.");
            }else if (assignment.isDeleted === true){
                throw new Error("assignment is already deleted.");
            }
            // const scenario = await SCENARIO.findOne({_id : req.body.scenarioId});
            // if (!scenario) {
            //     throw new Error("scenario not found.");
            // }else if (scenario.isDeleted === true){
            //     throw new Error("scenario is already deleted.");
            // }
            const apparatus = await APPARATUS.findOne({_id : req.body.apparatusId});
            if (!apparatus) {
                throw new Error("apparatus not found.");
            }else if (apparatus.isDeleted === true){
                throw new Error("apparatus is already deleted.");
            }
            const tdg = await TDG.findOne({_id : req.body.gameFromTDG});
            if (!tdg) {
                throw new Error("tdg not found.");
            }else if (apparatus.isDeleted === true){
                throw new Error("tdg is already deleted.");
            }
            var scenario;
            if(req.body.scenarioId) {
                if(req.body.scenario === null || req.body.scenario === '') {
                    scenario = '';
                } else {
                    scenario = new mongoose.Types.ObjectId(req.body.scenario)
                }
            } else {
                scenario = ''
            }

            let targetAudience ;
            if(typeof req.body.targetAudience === 'string') {
                targetAudience = JSON.parse(req.body.targetAudience)
            }else{
                targetAudience = req.body.targetAudience;
            }
            var scenarioAssignment = await SCENARIO_ASSIGNMENT.create({
                responseTypeId: req.body.responseTypeId,
                incidentTypeId: req.body.incidentTypeId,
                assignmentId: req.body.assignmentId,
                scenarioId : scenario,
                apparatusId: req.body.apparatusId,
                organizationId : '',
                parentId : '',
                audio: audioUrl,
                video: videoUrl,
                gameFromTDG: req.body.gameFromTDG,
                gameInfo: req.body.gameInfo,
                goalObjective: req.body.goalObjective,
                missionBriefing: req.body.missionBriefing,
                targetAudience: targetAudience,
                isDeleted: false,
            })

            const imageFiles = req.files["image"] || [];
            const imageUrls = [];
            for (const imageFile of imageFiles) {
                //const imageUrl = req.protocol + "://" + req.get("host") + "/images/" + imageFile.filename;
                const imageUrl =  imageFile.filename;
                imageUrls.push(imageUrl);
                
                  // Create a new image document for each uploaded image
                await SCENARIO_ASSIGNMENT_IMAGES.create({
                    scenarioAssignmentId: scenarioAssignment.id,
                    image: imageUrl,
                    isDeleted: false,
                });
            }
            const bestNames = req.body.bestNames || [];
            const bestPracticesArray = [];

            for (const bestName of bestNames) {
                const bestPracticesTdg = await SCENARIO_ASSIGNMENT_BEST_PRACTICES.create({
                    scenarioAssignmentId: scenarioAssignment.id,
                    name: bestName,
                    isDeleted: false,
                });
                bestPracticesArray.push(bestPracticesTdg);
            }

            var image = imageUrls.map((imageUrl) => {
                return {
                    imageUrl: req.protocol + "://" + req.get("host") + "/images/" + imageUrl
                }
            })

            var response = {
                scenarioAssignmentId : scenarioAssignment.id,
                responseTypeId : scenarioAssignment.responseTypeId,
                incidentTypeId : scenarioAssignment.incidentTypeId,
                assignmentId : scenarioAssignment.assignmentId,
                scenarioId : scenarioAssignment.scenarioId,
                apparatusId : scenarioAssignment.apparatusId,
                organizationId : scenarioAssignment.organizationId,
                parentId: scenarioAssignment.parentId,
                audio : scenarioAssignment.audio,
                video : scenarioAssignment.video,
                gameFromTDG : scenarioAssignment.gameFromTDG,
                gameInfo : scenarioAssignment.gameInfo,
                goalObjective : scenarioAssignment.goalObjective,
                missionBriefing : scenarioAssignment.missionBriefing,
                targetAudience : scenarioAssignment.targetAudience,
                images : image,
                bestPractices : bestPracticesArray,
                createdAt : scenarioAssignment.createdAt,
                updatedAt : scenarioAssignment.updatedAt
            }

        }else if(req.role === 'organization'){
            var organizationFind = await ORGANIZATION.findOne({userId : req.userId})
            const responseType = await RESPONSE_TYPE.findOne({_id : req.body.responseTypeId, organizationId : organizationFind._id});
            if (!responseType) {
                throw new Error("responseType not created by your organization.");
            }else if (responseType.isDeleted === true){
                throw new Error("responseType is already deleted.");
            }
            const incidentType = await INCIDENT_TYPE.findOne({_id : req.body.incidentTypeId, organizationId : organizationFind._id});
            if (!incidentType) {
                throw new Error("incidentType not created by your organization.");
            }else if (incidentType.isDeleted === true){
                throw new Error("incidentType is already deleted.");
            }
            const assignment = await ASSIGNMENT.findOne({_id : req.body.assignmentId, organizationId : organizationFind._id});
            if (!assignment) {
                throw new Error("assignment not created by your organization.");
            }else if (assignment.isDeleted === true){
                throw new Error("assignment is already deleted.");
            }
            // const scenario = await SCENARIO.findOne({_id : req.body.scenarioId, organizationId : organizationFind.id});
            // if (!scenario) {
            //     throw new Error("scenario not created by your organization.");
            // }else if (scenario.isDeleted === true){
            //     throw new Error("scenario is already deleted.");
            // }
            const apparatus = await APPARATUS.findOne({_id : req.body.apparatusId, organizationId : organizationFind._id});
            if (!apparatus) {
                throw new Error("apparatus not created by your organization.");
            }else if (apparatus.isDeleted === true){
                throw new Error("apparatus is already deleted.");
            }
            const tdg = await TDG.findOne({_id : req.body.gameFromTDG, organizationId : organizationFind._id});
            if (!tdg) {
                throw new Error("tdg not created by your organization.");
            }else if (apparatus.isDeleted === true){
                throw new Error("tdg is already deleted.");
            }

            var scenario;
            if(req.body.scenarioId) {
                if(req.body.scenario === null || req.body.scenario === '') {
                    scenario = '';
                } else {
                    scenario = new mongoose.Types.ObjectId(req.body.scenario)
                }
            } else {
                scenario = ''
            }

            var organization = new mongoose.Types.ObjectId(organizationFind._id);
            var scenarioAssignment = await SCENARIO_ASSIGNMENT.create({
                responseTypeId: req.body.responseTypeId,
                incidentTypeId: req.body.incidentTypeId,
                assignmentId: req.body.assignmentId,
                scenarioId : scenario,
                apparatusId: req.body.apparatusId,
                organizationId : organization,
                parentId : '',
                audio: audioUrl,
                video: videoUrl,
                gameFromTDG: req.body.gameFromTDG,
                gameInfo: req.body.gameInfo,
                goalObjective: req.body.goalObjective,
                missionBriefing: req.body.missionBriefing,
                targetAudience: JSON.parse(req.body.targetAudience),
                isDeleted: false,
            })
            const imageFiles = req.files["image"] || [];
            const imageUrls = [];
        for (const imageFile of imageFiles) {
            //const imageUrl = req.protocol + "://" + req.get("host") + "/images/" + imageFile.filename;
            const imageUrl = imageFile.filename;
            imageUrls.push(imageUrl);

              // Create a new image document for each uploaded image
            await SCENARIO_ASSIGNMENT_IMAGES.create({
                scenarioAssignmentId: scenarioAssignment.id,
                image: imageUrl,
                isDeleted: false,
            });
        }
        const bestNames = req.body.bestNames || [];
        const bestPracticesArray = [];

        for (const bestName of bestNames) {
            const bestPracticesTdg = await SCENARIO_ASSIGNMENT_BEST_PRACTICES.create({
                scenarioAssignmentId: scenarioAssignment.id,
                name: bestName,
                isDeleted: false,
            });
            bestPracticesArray.push(bestPracticesTdg);
        }

        var image = imageUrls.map((imageUrl) => {
            return {
                imageUrl: req.protocol + "://" + req.get("host") + "/images/" + imageUrl
            }
        })
        var response = {
            scenarioAssignmentId : scenarioAssignment.id,
            responseTypeId : scenarioAssignment.responseTypeId,
            incidentTypeId : scenarioAssignment.incidentTypeId,
            assignmentId : scenarioAssignment.assignmentId,
            scenarioId : scenarioAssignment.scenarioId,
            apparatusId : scenarioAssignment.apparatusId,
            organizationId : scenarioAssignment.organizationId,
            parentId : scenarioAssignment.parentId,
            audio : scenarioAssignment.audio,
            video : scenarioAssignment.video,
            gameFromTDG : scenarioAssignment.gameFromTDG,
            gameInfo : scenarioAssignment.gameInfo,
            goalObjective : scenarioAssignment.goalObjective,
            missionBriefing : scenarioAssignment.missionBriefing,
            targetAudience : scenarioAssignment.targetAudience || [],
            images : image,
            bestPractices : bestPracticesArray,
            createdAt : scenarioAssignment.createdAt,
            updatedAt : scenarioAssignment.updatedAt
        }

        }else {
            throw new Error ('you can not access.')
        }
        res.status(200).json({
            status : 'success',
            message : 'Scenario assignment created successfully.',
            data : response
        })
    } catch (error) {
        res.status(400).json({
            status : 'failed',
            message : error.message
        })
    }
}

exports.getScenarioAssignment = async function (req, res, next) {
    try {
        console.log("ROLE ========>",req.role);
        if (req.role === 'superAdmin'){
            var scenarioAssignment = await SCENARIO_ASSIGNMENT.find({isDeleted : false})
                console.log("scenarioAssignment",scenarioAssignment);
            var response =await Promise.all(scenarioAssignment.map(async(record)=>{
                var Images = await SCENARIO_ASSIGNMENT_IMAGES.find({scenarioAssignmentId : record.id})
                console.log(Images);
                var imagesUrl = await Promise.all(Images.map((url) => {
                    var image;
                    if(url.image === null || url.image === '') {
                        image = '';
                    } else {
                        image = req.protocol + "://" + req.get("host") + "/images/" + url.image;
                    }
                    return {
                        _id : url.id,
                        scenarioAssignmentId : url.scenarioAssignmentId,
                        image: image,
                        isDeleted : url.isDeleted,
                        createdAt : url.createdAt,
                        updatedAt : url.updatedAt
                    }
                }))
                var bestPractices = await SCENARIO_ASSIGNMENT_BEST_PRACTICES.find({scenarioAssignmentId : record.id})
                var tdgLibrary = await TDG_LIBRARY.findOne({_id : record.gameFromTDG})
                var apparatus = await APPARATUS.findOne({_id : record.apparatusId})
                var obj={
                    scenarioAssignmentId : record.id,
                    responseTypeId: record.responseTypeId,
                    incidentTypeId: record.incidentTypeId,
                    assignmentId: record.assignmentId,
                    scenarioId : record.scenarioId,
                    apparatusId: record.apparatusId,
                    apparatusName : apparatus.apparatusName,
                    organizationId : record.organizationId,
                    parentId : record.parentId,
                    audio: record.audio,
                    video: record.video,
                    gameFromTDG:  record.gameFromTDG,
                    tdgName : tdgLibrary.name,
                    gameInfo: record.gameInfo,
                    goalObjective: record.goalObjective,
                    missionBriefing: record.missionBriefing,
                    targetAudience: record.targetAudience,
                    images : imagesUrl,
                    bestPractice : bestPractices,
                    isDeleted: record.isDeleted,
                    createdAt : record.createdAt,
                    updatedAt : record.updatedAt
                }
                return obj;
            }))
        }else if(req.role === 'organization'){
            var organizationFind = await ORGANIZATION.findOne({userId : req.userId})


            var scenarioAssignment = await SCENARIO_ASSIGNMENT.find({isDeleted : false, organizationId : organizationFind._id})
                console.log("scenarioAssignment",scenarioAssignment);
            var response =await Promise.all(scenarioAssignment.map(async(record)=>{
                var Images = await SCENARIO_ASSIGNMENT_IMAGES.find({scenarioAssignmentId : record._id})
                var imagesUrl = await Promise.all(Images.map((url) => {
                    var image;
                    if(url.image === null || url.image === '') {
                        image = '';
                    } else {
                        image = req.protocol + "://" + req.get("host") + "/images/" + url.image;
                    }
                    return {
                        _id : url.id,
                        scenarioAssignmentId : url.scenarioAssignmentId,
                        image: image,
                        isDeleted : url.isDeleted,
                        createdAt : url.createdAt,
                        updatedAt : url.updatedAt
                    }
                }))
                var bestPractices = await SCENARIO_ASSIGNMENT_BEST_PRACTICES.find({scenarioAssignmentId : record._id})
                var tdgLibrary = await TDG_LIBRARY.findOne({_id : record.gameFromTDG})
                var apparatus = await APPARATUS.findOne({_id : record.apparatusId})

                console.log(bestPractices);
                var obj={
                    scenarioAssignmentId : record.id,
                    responseTypeId: record.responseTypeId,
                    incidentTypeId: record.incidentTypeId,
                    assignmentId: record.assignmentId,
                    scenarioId : record.scenarioId,
                    apparatusId: record.apparatusId,
                    apparatusName : apparatus.apparatusName,
                    organizationId : record.organizationId,
                    parentId : record.parentId,
                    audio: record.audio,
                    video: record.video,
                    gameFromTDG: record.gameFromTDG,
                    tdgName : tdgLibrary.name,
                    gameInfo: record.gameInfo,
                    goalObjective: record.goalObjective,
                    missionBriefing: record.missionBriefing,
                    targetAudience: record.targetAudience,
                    images : imagesUrl,
                    bestPractice : bestPractices,
                    isDeleted: record.isDeleted,
                    createdAt : record.createdAt,
                    updatedAt : record.updatedAt
                }
                return obj;
            }))
        }else {
            throw new Error ('you can not access');
        }
        res.status(200).json({
            status : 'success',
            message : 'scenario Assignment get successfully.',
            data : response
        })
    } catch (error) {
        res.status(400).json({
            status : 'failed',
            message : error.message
        })
    }
}

exports.updateScenarioAssignment = async function (req, res, next) {
    try {   
        var id = req.params.id
        console.log("RoLE======> ", req.role);
        if (!req.body.responseTypeId) {
            throw new Error("responseTypeId is required.");
        } else if (!req.body.incidentTypeId) {
            throw new Error("incidentTypeId is required.");
        } else if (!req.body.assignmentId) {
            throw new Error("assignmentId is required.");
        }
        // else if (!req.body.scenarioId) {
        //     throw new Error("scenarioId is required.");
        // } 
        // else if (!req.body.apparatusId) {
        //     throw new Error("apparatusId is required.");
        // }
        else if (!req.body.gameFromTDG){
            throw new Error('gameFromTDG is required');
        } else if (!req.body.targetAudience){
            throw new Error('targetAudience is required');
        }
        if (req.role === 'superAdmin' || req.role === 'organization'){
            var FIND = await SCENARIO_ASSIGNMENT.findById(id)
            if(!FIND){
                throw new Error ('scenario assignment not found.');
            }
            console.log("Find ", FIND);
            var audioUrl = FIND.audio || '';
            var videoUrl = FIND.video || '';

            if (req.files["audio"] && req.files["audio"].length > 0) {
                var audioFiles = req.files["audio"][0];
                //audioUrl = req.protocol + "://" + req.get("host") + "/images/" + audioFiles.filename;
                audioUrl = audioFiles.filename;
            }

            if (req.files["video"] && req.files["video"].length > 0) {
                var videoFiles = req.files["video"][0];
                //videoUrl = req.protocol + "://" + req.get("host") + "/images/" + videoFiles.filename;
                videoUrl = videoFiles.filename;
            }
            var scenario;
            if(req.body.scenarioId === null || req.body.scenarioId === '') {
                scenario = '';
            } else {
                scenario = new mongoose.Types.ObjectId(req.body.scenarioId);
            }
            let targetAudience ;
            if(typeof req.body.targetAudience === 'string') {
                targetAudience = JSON.parse(req.body.targetAudience)
            }else{
                targetAudience = req.body.targetAudience;
            }
            var scenarioAssignment = await SCENARIO_ASSIGNMENT.findByIdAndUpdate(id,{
                responseTypeId: req.body.responseTypeId,
                incidentTypeId: req.body.incidentTypeId,
                assignmentId: req.body.assignmentId,
                scenarioId : scenario,
                apparatusId: req.body.apparatusId,
                audio: audioUrl,
                video: videoUrl,
                gameFromTDG: req.body.gameFromTDG,
                gameInfo: req.body.gameInfo,
                goalObjective: req.body.goalObjective,
                missionBriefing: req.body.missionBriefing,
                targetAudience: targetAudience,
            },{new : true})
            
            const deleteImages = await SCENARIO_ASSIGNMENT_IMAGES.deleteMany({scenarioAssignmentId : id})

            const imageFiles = req.files["image"] || [];
            const imageUrls = [];
            for (const imageFile of imageFiles) {
            //const imageUrl = req.protocol + "://" + req.get("host") + "/images/" + imageFile.filename;
            const imageUrl = imageFile.filename;
            imageUrls.push(imageUrl);

              // Create a new image document for each uploaded image
            await SCENARIO_ASSIGNMENT_IMAGES.create({
                scenarioAssignmentId: scenarioAssignment.id,
                image: imageUrl,
                isDeleted: false,
            });
            }

            const deleteBestPractices = await SCENARIO_ASSIGNMENT_BEST_PRACTICES.deleteMany({scenarioAssignmentId : id})

            const bestNames = req.body.bestNames || [];
            const bestPracticesArray = [];
    
        for (const bestName of bestNames) {
            const bestPracticesTdg = await SCENARIO_ASSIGNMENT_BEST_PRACTICES.create({
                scenarioAssignmentId: scenarioAssignment.id,
                name: bestName,
                isDeleted: false,
            });
            bestPracticesArray.push(bestPracticesTdg);
        }

        var image = imageUrls.map((imageUrl) => {
            return {
                imageUrl: req.protocol + "://" + req.get("host") + "/images/" + imageUrl
            }
        })

        var response = {
            scenarioAssignmentId : scenarioAssignment.id,
            responseTypeId : scenarioAssignment.responseTypeId,
            incidentTypeId : scenarioAssignment.incidentTypeId,
            assignmentId : scenarioAssignment.assignmentId,
            apparatusId : scenarioAssignment.apparatusId,
            audio : scenarioAssignment.audio,
            video : scenarioAssignment.video,
            gameFromTDG : scenarioAssignment.gameFromTDG,
            gameInfo : scenarioAssignment.gameInfo,
            goalObjective : scenarioAssignment.goalObjective,
            missionBriefing : scenarioAssignment.missionBriefing,
            targetAudience : scenarioAssignment.targetAudience,
            images : image,
            bestPractices : bestPracticesArray
        }

        }else {
            throw new Error ('you can not access');
        }
        res.status(200).json({
            status : 'success',
            message : 'scenario assignment update successfully.',
            data : response
        })
    } catch (error) {
        res.status(400).json({
            status : 'failed',
            message : error.message
        })
    }
}

exports.deleteScenarioAssignment = async function (req, res, next) {
try {
    var id = req.params.id
    console.log("RoLE======> ", req.role);
    if (req.role === 'superAdmin' || req.role === 'organization') {
        var FIND = await SCENARIO_ASSIGNMENT.findById(id)
        if(!FIND){
            throw new Error ('scenario assignment not found.');
        }

        var scenarioAssignment = await SCENARIO_ASSIGNMENT.findByIdAndUpdate(id,{
            isDeleted : true
        },{new : true})
        
    //     console.log(scenarioAssignment.audio);
    //     const url = scenarioAssignment.audio;
    //     const filePath = url.substring(url.lastIndexOf("/") + 1);
    //     const directoryPath = path.join("public", "images");
    //     const completeFilePath = path.join(directoryPath, filePath);
    //     fs.unlink(completeFilePath, (err) => {
    //     if (err) {
    //     console.error("Error deleting file:", err);
    //     } else {
    //     console.log("File deleted successfully:", completeFilePath);
    //     }
    // });
    //     const scenarioImage = await SCENARIO_ASSIGNMENT_IMAGES.find({scenarioAssignmentId : id})

        const deleteImages = await SCENARIO_ASSIGNMENT_IMAGES.deleteMany({scenarioAssignmentId : id})
        const deleteBestPractices = await SCENARIO_ASSIGNMENT_BEST_PRACTICES.deleteMany({scenarioAssignmentId : id})

    }else {
        throw new Error ('you can not access');
    }
    res.status(200).json({
        status  : 'success',
        message : 'scenario assignment delete successfully.'
    })
} catch (error) {
    res.status(400).json({
        status  : 'failed',
        message : error.message
    })
}
}