const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tacticalFunction = new Schema ({
    tacticalDecisionGameId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'tacticalDecisionGame',
        require : true
    },
    idType : {
        type : String,
        validate : {
            validator: function(value){
                const validStatus = ["incidentPriorities", "actionKeys", "actionList"]
                return validStatus.includes(value);
            }
        }
    },
    incidentPrioritiesId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "incidentPriorities",
    },
    actionKeysId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "actionKey",
    },
},
{ timestamps: true, versionKey: false }
)

const TACTICAL_FUNCTION = mongoose.model("tacticalFunction",tacticalFunction)

module.exports =  TACTICAL_FUNCTION