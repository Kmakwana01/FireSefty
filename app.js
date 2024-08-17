var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose')
require('dotenv').config();
let cors = require('cors')
//var net = require('net');
var cron = require('node-cron');

var cronJob = require('./cronJob');
cronJob.statusChangeForGroupPlay();

console.log(process.env.MONGO_URL);
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected!'))
  .catch((err) => console.log(err.message));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var organizationRouter = require('./routes/organizationRoute')
var profileRouter = require('./routes/profileRoute');
var responseTypeRouter = require('./routes/responseTypeRoute')
var incidentTypeRouter = require('./routes/incidentTypeRoute')
var assignmentRouter = require('./routes/assignmentRoute')
var tdgLibraryRouter = require('./routes/tdgLibraryRoute');
var tacticalDecisionGameRouter = require('./routes/tacticalDecisionGameRoute')
var incidentPrioritiesRouter = require('./routes/incidentPrioritiesRoute')
var actionKeyRouter = require('./routes/actionKeyRoute')
var actionListRouter = require('./routes/actionListRoute')
var objectivesRouter = require('./routes/objectivesRoute')
var thinkingPlanningRouter = require ('./routes/thinkingPlanningRoute')
var apparatusRouter = require('./routes/apparatusRoute');
var scenariosRouter = require('./routes/scenarioRoute');
var scenarioAssignmentRouter = require('./routes/scenarioAssignmentRoute');
var singlePlayerRouter = require ('./routes/singlePlayerRoute')
var groupPlayRouter = require('./routes/groupPlayRoute')
var zipRouter = require('./routes/zipRoute')
var importDataRouter = require('./routes/importDataRoute')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(cors(), express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/organization', organizationRouter);
app.use('/profile', profileRouter);
app.use('/responseType', responseTypeRouter)
app.use('/incidentType', incidentTypeRouter)
app.use('/assignment', assignmentRouter)
app.use('/tdgLibrary', tdgLibraryRouter)
app.use('/tacticalDecisionGame', tacticalDecisionGameRouter)
app.use('/incidentPriorities', incidentPrioritiesRouter)
app.use('/actionKey',actionKeyRouter)
app.use('/actionList',actionListRouter)
app.use('/objectives',objectivesRouter)
app.use('/thinkingPlanning',thinkingPlanningRouter)
app.use('/apparatus',apparatusRouter)
app.use('/scenario',scenariosRouter)
app.use('/scenarioAssignments',scenarioAssignmentRouter)
app.use('/singlePlayer',singlePlayerRouter)
app.use('/groupPlay',groupPlayRouter)
app.use('/dataImporter',importDataRouter)
app.use('/zip',zipRouter)



const moment = require('moment-timezone');
//================================================================ zip restore =================================================
//const moment = require('moment');
const fs = require('fs-extra');
const zip = require ('./controllers/zipController');

cron.schedule('0 0 * * *', async () => {
  try {

    const past30DaysDate = moment().subtract(30, 'days');
    var date = past30DaysDate.format('DD-MM-YYYY');
    const folderPath = `./backup/${date}`;

    if (fs.existsSync(folderPath)) {
        try {
            fs.removeSync(folderPath);
            console.log(`Folder ${folderPath} removed successfully.`);
        } catch (error) {
            console.error(`Error removing folder ${folderPath}: ${error.message}`);
        }
    }

    const zipFilePath = await zip.createZip();

    console.log(`Cron job completed successfully. Zip file created: ${zipFilePath}`);
  } catch (error) {
    console.error('Error executing cron job:', error.message);
  }
});


const buildPath = path.normalize(path.join(__dirname, "./build"));  
app.use(express.static(buildPath));
const rootRouter = express.Router();
rootRouter.get('(/*)?', async (req, res, next) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});
app.use(rootRouter);
app.enable('trust proxy');
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
