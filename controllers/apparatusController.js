const mongoose = require('mongoose')
const APPARATUS = require ('../models/apparatusModel')
const ORGANIZATION = require ('../models/organizationModel')


exports.createApparatus = async function (req, res, next){
    try {

        if (!req.body.station){
            throw new Error ('You must provide a station.')
        }else if (!req.body.totalApparatus){
            throw new Error ('You must provide a total apparatus.')
        }else if (!req.body.apparatusName){
            throw new Error ('You must provide a apparatusName.')
        }

        // var istTimeString = new Date().toLocaleString('en-US', {timeZone: 'Asia/Kolkata', hour12: true});
        const utcDate = new Date();
        console.log("utcDate",utcDate);

        const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000)); // 5.5 hours in milliseconds
        console.log("istDate",istDate);

        const istTimeString = istDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        console.log("istTimeString",istTimeString);

        console.log('IST Time:', istTimeString);

        if (req.role === 'superAdmin'){
            var apparatus = await APPARATUS.create({
                organizationId : '',
                parentId : '',
                station : req.body.station,
                totalApparatus : req.body.totalApparatus,
                apparatusName : req.body.apparatusName,
                isDeleted : false,
            })
        }else if (req.role === 'organization'){

            var organizationFind = await ORGANIZATION.findOne({userId : req.userId})
            var organization = new mongoose.Types.ObjectId(organizationFind._id);
            var apparatus = await APPARATUS.create({
                organizationId : organization,
                parentId : '',
                station : req.body.station,
                totalApparatus : req.body.totalApparatus,
                apparatusName : req.body.apparatusName,
                isDeleted : false,
            })
        }else {
            throw new Error ('you can not access.')
        }
        var FIND = await APPARATUS.findOne({_id : apparatus.id})
        console.log("%%%%%%%%%%%%%%% : ");
        console.log("Find : " + FIND);
        if (!FIND){
            throw new Error ('apparatus not found.')
        }
        var response = {
            apparatusId  : FIND.id,
            organizationId : FIND.organizationId,
            parentId : FIND.parentId,
            station : FIND.station,
            totalApparatus : FIND.totalApparatus,
            apparatusName : FIND.apparatusName,
            isDeleted : FIND.isDeleted,
            createdAt : FIND.createdAt,
            updatedAt : FIND.updatedAt120
        }
        res.status(200).json({
            status: 'success',
            message : 'Apparatus created successfully.',
            data : response
        })
    } catch (error) {
        res.status(400).json({
            status : 'failed',
            message : error.message
        });
    }
}

exports.getApparatus = async function (req, res, next) {
    try {
        var id = req.params.id
        if (req.role === 'superAdmin'){
            var FIND = await APPARATUS.find({isDeleted : false})
            if (!FIND){
                throw new Error ('apparatus not found.')
            }
            console.log(FIND);
            var response = FIND.map((record)=>{
                var updatedAtFind = (record.updatedAt + (5.5 * 60 * 60 * 1000))
            console.log("updatedAtFind: " ,updatedAtFind);                            
            var istTimeString = updatedAtFind.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
            console.log("istTimeString",istTimeString);
                var obj ={
                    apparatusId  : record.id,
                    organizationId : record.organizationId,
                    parentId : record.parentId,
                    station : record.station,
                    totalApparatus : record.totalApparatus,
                    apparatusName : record.apparatusName,
                    isDeleted : record.isDeleted,
                    createdAt : record.createdAt,
                    updatedAt : istTimeString
                }
                return obj;
            })
        }else if (req.role === 'organization') {
            
            var organizationFind = await ORGANIZATION.findOne({userId : req.userId})
            console.log(organizationFind);


            var FIND = await APPARATUS.find({isDeleted : false,organizationId : organizationFind._id})
            if (!FIND){
                throw new Error ('apparatus not found.')
            }
            var response = FIND.map((record)=>{
                var obj ={
                    apparatusId  : record.id,
                    organizationId : record.organizationId,
                    parentId : record.parentId,
                    station : record.station,
                    totalApparatus : record.totalApparatus,
                    apparatusName : record.apparatusName,
                    isDeleted : record.isDeleted,
                    createdAt : record.createdAt,
                    updatedAt : record.updatedAt    
                }
                return obj;
            })
        }else {
            throw new Error ('you can not access.')
        }
        res.status(200).json({
            status: 'success',
            message : 'Apparatus get successfully.',
            data : response
        })
    } catch (error) {
        res.status(400).json({
            status : 'failed',
            message : error.message
        });
    }
};

exports.updateApparatus = async function (req, res, next) {
    try {
        console.log(req.role);
        var id = req.params.id
        
        if (!req.body.station){
            throw new Error ('You must provide a station.')
        }else if (!req.body.totalApparatus){
            throw new Error ('You must provide a total apparatus.')
        }else if (!req.body.apparatusName){
            throw new Error ('You must provide a apparatusName.')
        }
        
        if (req.role === 'superAdmin'){
            var FINDapparatus = await APPARATUS.findOne({_id : id})
            if (!FINDapparatus){
                throw new Error ('apparatus not found.')
            }else if (FINDapparatus.isDeleted === true){
                throw new Error ('apparatus is already deleted')
            }
            var updatedAtFind = (FINDapparatus.updatedAt + (5.5 * 60 * 60 * 1000))
            console.log("updatedAtFind: " ,updatedAtFind);                            
            var istTimeString = updatedAtFind.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
            console.log("istTimeString",istTimeString);
            var apparatus = await APPARATUS.findByIdAndUpdate(id,{
                station : req.body.station,
                totalApparatus : req.body.totalApparatus,
                apparatusName : req.body.apparatusName,
            },{new : true}) 
            
        }else if (req.role == 'organization'){

            var organizationFind = await ORGANIZATION.findOne({userId : req.userId})

            var FINDapparatus = await APPARATUS.findOne({_id : id, organizationId : organizationFind._id})
            if (!FINDapparatus){
                throw new Error ('apparatus not created by your organization.')
            }else if (FINDapparatus.isDeleted === true){
                throw new Error ('apparatus is already deleted')
            }
            var apparatus = await APPARATUS.findByIdAndUpdate(id,{
                station : req.body.station,
                totalApparatus : req.body.totalApparatus,
                apparatusName : req.body.apparatusName,
            },{new : true})
        }else {
            throw new Error ('you can not access.')
        }
        var FIND = await APPARATUS.findOne({_id : apparatus.id})
            var response = {
                apparatusId  : FIND.id,
                organizationId : FIND.organizationId,
                parentId : FIND.parentId,
                station : FIND.station,
                totalApparatus : FIND.totalApparatus,
                apparatusName : FIND.apparatusName,
                isDeleted : FIND.isDeleted,
                createdAt : FIND.createdAt ? FIND.createdAt : 0, 
                updatedAt : istTimeString ? istTimeString : 0,
            }
        
        res.status(200).json({
            status: 'success',
            message : 'Apparatus updated successfully.',
            data : response
        })
    } catch (error) {
        res.status(400).json({
            status : 'failed',
            message : error.message
        });
    }
};

exports.deleteApparatus = async function (req, res, next){
    try {
        var id = req.params.id
        if (req.role === 'superAdmin'){
            var FINDapparatus = await APPARATUS.findOne({_id : id})
            if (!FINDapparatus){
                throw new Error ('apparatus not found.')
            }else if (FINDapparatus.isDeleted === true) {
                throw new Error ('apparatus is already deleted.')
            }
            var apparatus = await APPARATUS.findByIdAndUpdate(id,{
                isDeleted : true
            },{new : true})
        }else if (req.role === 'organization') {

            var organizationFind = await ORGANIZATION.findOne({userId : req.userId})

            var FINDapparatus = await APPARATUS.findOne({_id : id, organizationId : organizationFind._id})
            if (!FINDapparatus){
                throw new Error ('apparatus not created by your organization.')
            }else if (FINDapparatus.isDeleted === true){
                throw new Error ('apparatus is already deleted')
            }
            var apparatus = await APPARATUS.findByIdAndUpdate(id,{
                isDeleted : true
            },{new : true})
        }else {
            throw new Error ('you can not access.')
        }

        res.status(200).json({
            status : 'success',
            message : 'Apparatus delete successfully.',
        })
    } catch (error) {
        res.status(400).json({
            status : 'failed',
            message : error.message,
        })
    }
};