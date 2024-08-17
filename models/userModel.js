const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user = new Schema({
    userName :String,
    email :{
        type : String,
    // required :[true, 'user email required'],
    //    // unique : true,
    //     validate :{
    //         validator : async function(email){
    //             const user = await mongoose.models.user.findOne({email : email});
    //             if (user) {
    //                 if (this.id === user.id) {
    //                     return true;
    //                 }
    //                 return false;
    //             }
    //             return true;
    //         },
    //         message : props => 'The specified email address is already in use. '
    //     }
    },
    password : String,
    isEmailVerified : String,
    deletedAt : String,
    isActive : Boolean,
    role : String,
    isDeleted : Boolean, 
},
{
    timestamps : true , versionKey : false 
}
);

const USER = mongoose.model('user',user);
module.exports = USER;