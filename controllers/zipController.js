const archiver = require('archiver');
const mongoose = require('mongoose');
const fs = require('fs-extra');
const unzipper = require('unzipper');
const moment = require('moment');
require('dotenv').config()

const USER = require('../models/userModel');
const TOKEN = require('../models/tokenModel');
const THINKING_PLANNING_TEXT = require('../models/thinkingPlanningTextModel');
const THINKING_PLANNING = require('../models/thinkingPlanningModel');
const SELECT_ANSWER_TYPE_LIST = require('../models/thinkingPlaningSelectAnswerTypeListModel');
const TDG_LIBRARY = require('../models/tdgLibraryModel');
const TACTICAL_FUNCTION = require('../models/tacticalFunctionModel');
const TACTICAL_DECISION_GAME_RATING_SCALE_TEXT = require('../models/tacticalDecisionGameRatingScaleTextModel');
const TACTICAL_DECISION_GAME = require('../models/tacticalDecisionGameModel');
const TACTICAL_DECISION_GAME_IMAGE = require('../models/tacticalDecisionGameImageModel');
const TACTICAL_DECISION_GAME_ADD_ANSWER = require('../models/tacticalDecisionGameAddAnswerModel');
const SESSION = require('../models/sessionModel');
const SCENARIO = require('../models/scenarioModel');
const SCENARIO_ASSIGNMENT = require('../models/scenarioAssignmentsModel');
const SCENARIO_ASSIGNMENT_IMAGES = require('../models/scenarioAssignmentImagesModel');
const SCENARIO_ASSIGNMENT_BEST_PRACTICES = require('../models/scenarioAssignmentBestPracticesModel');
const RESPONSE_TYPE = require('../models/responseTypeModel');
const PROFILE = require('../models/profileModel');
const ORGANIZATION = require('../models/organizationModel');
const OBJECTIVES = require('../models/objectivesModel');
const INCIDENT_TYPE = require('../models/incidentTypeModel');
const INCIDENT_PRIORITIES = require('../models/incidentPrioritiesModel');
const FUNCTION_KEYS = require('../models/functionKeysModel');
const RESET = require('../models/forgetPasswordModel');
const DEMO = require('../models/demoModel');
const BEST_PRACTICES_TDG = require('../models/bestPracticesTdgModel');
const BEST_PRACTICES_DECISION_GAME = require('../models/bestPracticesDecisionGameModel');
const ASSIGNMENT = require('../models/assignmentModel');
const TACTICAL_DECISION_GAME_LIST_ANSWER = require('../models/appTacticalDecisionGameListAnswerModel');
const PLAYER_REQUEST = require('../models/appPlayerRequestModel');
const HOST_REQUEST = require('../models/appHostRequestModel');
const GROUP_PLAY = require('../models/appGroupPlayModel');
const GROUP_PLAY_LOBBY = require('../models/appGroupPlayLobbyModel');
const GROUP_PLAYER = require('../models/appGroupPlayerModel');
const GROUP = require('../models/appGroupModel');
const FUNCTION_KEY_ANSWER = require('../models/appFunctionKeyAnswerModel');
const APPARATUS = require('../models/apparatusModel');
const ACTION_LIST = require('../models/actionListModel');
const ACTION_KEYS = require('../models/actionKeysModel');



const models = [USER , TOKEN , THINKING_PLANNING_TEXT , THINKING_PLANNING  , SELECT_ANSWER_TYPE_LIST , TDG_LIBRARY , TACTICAL_FUNCTION , TACTICAL_DECISION_GAME_RATING_SCALE_TEXT , TACTICAL_DECISION_GAME , TACTICAL_DECISION_GAME_IMAGE , TACTICAL_DECISION_GAME_ADD_ANSWER , SESSION, SCENARIO, SCENARIO_ASSIGNMENT, SCENARIO_ASSIGNMENT_IMAGES, SCENARIO_ASSIGNMENT_BEST_PRACTICES, RESPONSE_TYPE, PROFILE, ORGANIZATION, OBJECTIVES, INCIDENT_TYPE, INCIDENT_PRIORITIES, FUNCTION_KEYS, RESET, DEMO , BEST_PRACTICES_TDG , BEST_PRACTICES_DECISION_GAME,ASSIGNMENT, TACTICAL_DECISION_GAME_LIST_ANSWER , PLAYER_REQUEST , HOST_REQUEST , GROUP_PLAY, GROUP_PLAY_LOBBY, GROUP_PLAYER , GROUP , FUNCTION_KEY_ANSWER , APPARATUS , ACTION_LIST , ACTION_KEYS];  // Add more models as needed


async function backupMongoData(req, res, next) {
    try {
        const collections = await Promise.all(models.map(async (model, index) => {
            if (!model) {
                console.error(`Error: Model at index ${index} is undefined`);
                return [];
            }

            try {
                const data = await model.find().lean();
                //console.log(`Data for ${model.modelName}:`, data);
                return data;
            } catch (error) {
                console.error(`Error fetching data from ${model.modelName}:`, error.message);
                throw error;
            }
        }));

        return collections;
    } catch (error) {
        console.error('Error backing up MongoDB data:', error.message);
        throw error;
    }
};

exports.createZip = async function (req, res, next) {
    const currentDate = moment().format('DD-MM-YYYY');
    const backupFolderPath = `./backup/${currentDate}`;
    const databaseOutputPath = `${backupFolderPath}/database.zip`;
    const publicOutputPath = `${backupFolderPath}/public.zip`;

    try {
        if (!fs.existsSync(backupFolderPath)) {
            fs.mkdirSync(backupFolderPath, { recursive: true });
        }

        // Database backup
        const databaseData = await backupMongoData();
        const databaseOutput = fs.createWriteStream(databaseOutputPath);
        const databaseArchive = archiver('zip', { zlib: { level: 9 } });

        databaseArchive.pipe(databaseOutput);

        // Add data from each collection to the database archive
        databaseData.forEach((collectionData, index) => {
            const modelName = models[index]?.modelName || 'unknown';
            databaseArchive.append(JSON.stringify(collectionData), { name: `${modelName}.json` });
        });

        // Finalize the database archive
        await new Promise((resolve, reject) => {
            databaseOutput.on('close', () => resolve(databaseOutputPath));
            databaseArchive.on('error', (err) => reject(err));
            databaseArchive.finalize();
        });

        // Public folder backup
        const publicOutput = fs.createWriteStream(publicOutputPath);
        const publicArchive = archiver('zip', { zlib: { level: 9 } });

        publicArchive.pipe(publicOutput);

        // Add the contents of the "./public" folder to the public archive
        publicArchive.directory('./public', false);

        // Finalize the public archive
        await new Promise((resolve, reject) => {
            publicOutput.on('close', () => resolve(publicOutputPath));
            publicArchive.on('error', (err) => reject(err));
            publicArchive.finalize();
        });

        // Return both zip file paths
        return [databaseOutputPath, publicOutputPath];
    } catch (error) {
        console.error('Error creating MongoDB backup and public zip:', error.message);
        throw error;
    }
};

// restore database in mongodb api
const extractDataFromZip = async (zipFilePath) => {
    const extractedData = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(zipFilePath)
            .pipe(unzipper.Parse())
            .on('entry', (entry) => {
                const modelName = entry.path.split('.')[0];
                let jsonData = '';

                entry
                    .pipe(require('stream').Transform({
                        transform: function (chunk, encoding, callback) {
                            jsonData += chunk.toString();
                            callback();
                        }
                    }))
                    .on('finish', () => {
                        extractedData.push({ modelName, data: JSON.parse(jsonData) });
                    });
            })
            .on('error', (err) => reject(err))
            .on('close', () => resolve(extractedData));
    });
};

let globalConnection;

const connectToMongoDB = async (mongodbUrl) => {
    if (!globalConnection) {
        globalConnection = await mongoose.createConnection(mongodbUrl);
    }
    return globalConnection;
};
    
exports.restoreZip = async function (req, res, next) {
    const zipFilePath = req.file.path;
    const mongodbUrl = process.env.MONGO_URL_RESTORE;

    try {
        const extractedData = await extractDataFromZip(zipFilePath);
        
        // Add MongoDB URL to the extracted data
        extractedData.forEach((item) => {
            item.data.mongodbUrl = mongodbUrl;
        });

        await restoreDataToMongoDB(extractedData);

        res.json({ message: 'Data restored successfully' });
    } catch (error) {
        console.error('Error restoring data:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const restoreDataToMongoDB = async (extractedData) => {
    try {
        const connection = await connectToMongoDB(extractedData[0].data.mongodbUrl);

        await Promise.all(
            extractedData.map(async ({ modelName, data }) => {
                const schema = new mongoose.Schema({}, { strict: false, versionKey: false });
                const Model = connection.model(modelName, schema);

                await Model.deleteMany({});

                // Remove the __v field during the insertMany operation
                const dataWithoutVersion = data.map((doc) => {
                    delete doc.__v;
                    return doc;
                });

                await Model.insertMany(dataWithoutVersion);
            })
        );
    } catch (error) {
        throw new Error(`MongoDB operation error: ${error.message}`);
    }
};