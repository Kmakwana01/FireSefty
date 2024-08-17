const bcrypt = require('bcrypt')
const PROFILE = require('../models/profileModel');
const USER = require('../models/userModel');
const ORGANIZATION = require('../models/organizationModel');
const GROUP_PLAYER = require("../models/appGroupPlayerModel");
const HOST_REQUEST = require("../models/appHostRequestModel");
const PLAYER_REQUEST = require("../models/appPlayerRequestModel");

exports.createProfile = async function (req, res, next) {
    try {
        if (!req.body.email) {
            throw new Error('email is required.')
        } else if (!req.body.organizationId) {
            throw new Error('organizationId is required.')
        } else if (!req.body.shift) {
            throw new Error('shift is required.')
        } else if (!req.body.rank) {
            throw new Error('rank is required.')
        } else if (!req.body.station) {
            throw new Error('station is required.')
        } else if (!req.body.profileName) {
            throw new Error('profileName is required.')
        } else if (!req.body.password) {
            throw new Error('password is required.')
        }
        var organization = await ORGANIZATION.findOne({ _id: req.body.organizationId })
        if (!organization) {
            throw new Error('organization not found')
        }
        var findUser = await USER.findOne({ email: req.body.email, isDeleted: false })
        if (findUser) {
            throw new Error('this emailId is already in use.')
        }
        req.body.password = await bcrypt.hash(req.body.password, 10);

        const user = await USER.create({
            email: req.body.email,
            userName: "",
            password: req.body.password,
            isEmailVerified: "",
            deletedAt: "",
            isActive: true,
            isDeleted: false,
            role: "fireFighter",
        })
        if (req.file) {
            var img;
            if (req.file === '' || req.file === null) {
                img = '';
            } else {
                img = req.file.filename
            }
            // const url = req.protocol + "://" + req.get("host") + "/images/" + req.file.filename;
            var profile = await PROFILE.create({
                profileName: req.body.profileName,
                rank: req.body.rank,
                shift: req.body.shift,
                profileImage: img,
                station: req.body.station,
                userId: user.id,
                organizationId: req.body.organizationId,
                isDeleted: false
            })
        } else {
            // const url = req.protocol + "://" + req.get("host") + "/images/" + req.file.filename;
            var profile = await PROFILE.create({
                profileName: req.body.profileName,
                rank: req.body.rank,
                shift: req.body.shift,
                profileImage: '',
                station: req.body.station,
                userId: user.id,
                organizationId: req.body.organizationId,
                isDeleted: false
            })
        }
        var response = {
            userId: user.id,
            profileName: profile.profileName,
            rank: profile.rank,
            shift: profile.shift,
            profileImage: profile.profileImage,
            station: profile.station,
            organizationId: profile.organizationId,
            email: user.email,
            password: user.password,
            role: user.role,
        }
        res.status(200).json({
            status: 'success',
            message: 'Profile created successfully',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
};

exports.getProfile = async function (req, res, next) {
    try {
        id = req.params.id
        if (!id) {
            throw new Error('organizationId is required.')
        }

        var profile = await PROFILE.find({ organizationId: id, isDeleted: false }).populate({
            path: "userId",
            match: { role: 'fireFighter' }
        }).exec();
        var data = profile.filter(user => user.userId != null);

        var response = data.map((record) => {
            console.log("record", record);
            var url;
            if (record.profileImage === null || record.profileImage === '') {
                url = ''
            } else {
                url = req.protocol + "://" + req.get("host") + "/images/" + record.profileImage;
            }

            return {
                profileId: record.id,
                organizationId: record.organizationId,
                userId: record.userId._id,
                email: record.userId.email,
                profileName: record.profileName,
                profileImage: url,
                rank: record.rank,
                shift: record.shift,
                station: record.station,
                isDeleted: record.isDeleted,
                role: record.userId.role
            }
        })

        res.status(200).json({
            status: 'success',
            message: 'Profile get successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
}

exports.updateProfile = async function (req, res, next) {
    try {
        id = req.params.id
        var find = await PROFILE.findOne({ _id: id, isDeleted: false })
        if (!find) {
            throw new Error('Profile not found.')
        } else if (find.isDeleted === true) {
            throw new Error('Profile is already deleted')
        }

        if (req.body.email || req.body.email !== null || req.body.email !== '') {
            var user = await USER.findByIdAndUpdate(find.userId, {
                email: req.body.email
            }, { new: true });
        }

        if (req.file) {
            var img;
            if (req.file === null || req.file === '') {
                img = '';
            } else {
                img = req.file.filename;
            }


            // const url = req.protocol + "://" + req.get("host") + "/images/" + req.file.filename;
            var profile = await PROFILE.findByIdAndUpdate(id, {
                profileName: req.body.profileName,
                rank: req.body.rank,
                shift: req.body.shift,
                profileImage: img,
                station: req.body.station,
                isDeleted: false
            }, { new: true });

        } else {
            var profile = await PROFILE.findByIdAndUpdate(id, {
                profileName: req.body.profileName,
                rank: req.body.rank,
                shift: req.body.shift,
                // profileImage: url,
                station: req.body.station,
                isDeleted: false
            }, { new: true });
        }
        var response = {
            profileId: profile.id,
            organizationId: profile.organizationId,
            userId: profile.userId,
            profileName: profile.profileName,
            email: user.email,
            profileImage: profile.profileImage,
            rank: profile.rank,
            shift: profile.shift,
            station: profile.station,
            isDeleted: profile.isDeleted
        }
        res.status(200).json({
            status: 'success',
            message: 'Profile update successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
}

exports.deleteProfile = async function (req, res, next) {
    try {
        id = req.params.id
        var find = await PROFILE.findOne({ _id: id, isDeleted: false })
        if (!find) {
            throw new Error('Profile not found.')
        } else if (find.isDeleted === true) {
            throw new Error('Profile is already deleted')
        }
        console.log("FIND", find)
        var profile = await PROFILE.findByIdAndUpdate(id, {
            isDeleted: true
        }, { new: true });
        console.log("profile", profile)

        var user = await USER.findByIdAndUpdate(profile.userId, {
            isDeleted: true
        }, { new: true })
        console.log("user", user)

        var groupPlayer = await GROUP_PLAYER.updateMany({ userId: user.id }, { isDeleted: true }, { new: true });
        console.log("groupPlayer", groupPlayer)

        var hostRequest = await HOST_REQUEST.updateMany({ userId: user.id }, { isDeleted: true }, { new: true });
        console.log("hostRequest", hostRequest)

        var playerRequest = await PLAYER_REQUEST.updateMany({ userId: user.id }, { isDeleted: true }, { new: true });
        console.log("playerRequest", playerRequest)

        var response = {
            profileId: profile.id,
            organizationId: profile.organizationId,
            userId: profile.userId,
            profileName: profile.profileName,
            profileImage: profile.profileImage,
            rank: profile.rank,
            shift: profile.shift,
            station: profile.station,
            isDeleted: profile.isDeleted
        }
        res.status(200).json({
            status: 'success',
            message: 'Profile delete successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
}

exports.getFireFighters = async function (req, res, next) {
    try {
        var fireFighters = await USER.find({ role: "fireFighter", isDeleted: false });
        var data = fireFighters.filter((fireFighter) => fireFighter._id.toString() !== req.userId);
        if (fireFighters.length === 0) {
            throw new Error("there is no fireFighters available ")
        }

        var response = await Promise.all(data.map(async (record) => {
            var loginUserProfile = await PROFILE.findOne({ userId: req.userId });
            var profile = await PROFILE.findOne({ userId: record.id, organizationId: loginUserProfile.organizationId, isDeleted: false });
            if (profile) {
                return {
                    userId: record._id,
                    profileId: profile._id,
                    profileName: profile.profileName,
                }
            }
            return null;
        }))

        const filteredResponse = response.filter(record => record !== null);

        res.status(200).json({
            status: 'success',
            message: 'get fire Fighter successfully.',
            data: filteredResponse
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
}


exports.getProfileUser = async function (req, res, next) {
    try {
        console.log("req.params.id", req.params.id);
        var user = await PROFILE.findOne({ userId: req.params.id }).populate('userId');
        if (!user) {
            throw new Error("Profile not found")
        }

        var url;
        if (user.profileImage === null || user.profileImage === '') {
            url = ''
        } else {
            url = req.protocol + "://" + req.get("host") + "/images/" + user.profileImage;
        }

        const response = {
            _id: user.id,
            organizationId: user.organizationId,
            userId: user.userId._id,
            email: user.userId.email,
            rank: user.rank,
            shift: user.shift,
            profileName: user.profileName,
            profileImage: url,
            station: user.station,
            isDeleted: user.isDeleted,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
        res.status(200).json({
            status: 'success',
            message: 'User successfully get.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
}

exports.getProfileById = async function (req, res, next) {
    try {
        console.log("req.userId", req.userId)
        var profile = await PROFILE.findOne({ userId: req.userId, isDeleted: false }).populate("userId")
        console.log("profile", profile)

        if (!profile) {
            throw new Error("Profile not found")
        }
        var url;
        if (profile.profileImage === null || profile.profileImage === '' || profile.profileImage === undefined) {
            url = '';
        } else if (profile.profileImage) {
            url = req.protocol + "://" + req.get("host") + "/images/" + profile.profileImage
        }

        // console.log(profile,'profile')
        let logo;
        if (req.role === 'organization') {
            var organizationFind = await ORGANIZATION.findOne({ userId: req.userId })
            if (organizationFind?.logo === null || organizationFind?.logo === '' || organizationFind?.logo === undefined) {
                logo = '';
            } else if (organizationFind?.logo) {
                logo = req.protocol + "://" + req.get("host") + "/images/" + organizationFind?.logo
            }

        }

        var response = {
            profileName: profile.profileName,
            email: profile.userId.email,
            profileImage: url,
            userRole: req.role,
            logo: logo ? logo : null
        }


        if (organizationFind) {
            function formatDate(timestamp) {
                const date = new Date(parseInt(timestamp));
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            }

            let status = null;
            let exDate = formatDate(organizationFind?.expireDate);
            let subDate = formatDate(organizationFind?.subscriptionDate)
            let subParts = subDate.split("/");
            let formattedSubDate = `${subParts[1]}/${subParts[0]}/${subParts[2]}`;
            let exParts = exDate.split("/");
            let formattedExDate = `${exParts[1]}/${exParts[0]}/${exParts[2]}`;
            const today = new Date();
            const expireDate = new Date(formattedExDate);
            console.log("expireDate: ", expireDate);
            const subscriptionDate = new Date(formattedSubDate);
            console.log("sub", subscriptionDate)
            const daysUntilExpire = Math.floor((expireDate - today) / (1000 * 60 * 60 * 24));
            console.log("daysexpire", daysUntilExpire)
            if (daysUntilExpire < 0) {
                status = "red";
            } else if (daysUntilExpire <= 30 && daysUntilExpire >= 0) {
                status = "yellow";
            } else {
                status = "green";
            }
            console.log("status", status);

            response.data = {
                logo: (organizationFind && organizationFind.logo) ? req.protocol + "://" + req.get("host") + "/images/" + organizationFind.logo : null,
                station: (organizationFind && organizationFind.station) ? organizationFind.station : null,
                organizationId: (organizationFind && organizationFind._id) ? organizationFind._id : null,
                name: (organizationFind && organizationFind.name) ? organizationFind.name : null,
                subscriptionDate: formatDate(organizationFind.subscriptionDate),
                expireDate: formatDate(organizationFind.expireDate),
                status: status ? status : null,
                contactName : organizationFind.contactName
            }
        }

        
        res.status(200).json({
            status: 'success',
            message: 'profile ge successfully.',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
}

exports.updatePasswordOfProfile = async function (req, res, next) {
    try {
        console.log("req.userId", req.userId)
        if (!req.body.password) {
            throw new Error("password is required.")
        }
        var user = await USER.findOne({ _id: req.userId })
        if (!user) {
            throw new Error("User not found.")
        }
        req.body.password = await bcrypt.hash(req.body.password, 10);
        var User = await USER.findByIdAndUpdate(req.userId, {
            password: req.body.password
        }, { new: true })
        res.status(200).json({
            status: 'success',
            message: 'profile password successfully.'
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
}

exports.updateProfileOfUser = async function (req, res, next) {
    try {

        var user = await USER.findOne({ _id: req.userId })
        if (!user) {
            throw new Error("user not found")
        }
        console.log("user")
        var users = await USER.findOne({ email: req.body.email });
        if (users && users._id.toString() !== req.userId) {
            throw new Error('this email is already in use.')
        }
        var userUpdate = await USER.findByIdAndUpdate(req.userId, {
            email: req.body.email
        }, { new: true })
        console.log("userUpdate", userUpdate)

        if (req.body.profileName) {
            await PROFILE.findOneAndUpdate(
                {
                    userId: req.userId
                },
                {
                    profileName: req.body.profileName,
                }
            )
        }

        if (req.file) {
            var profileImage;
            if (profileImage === null || profileImage === '') {
                profileImage = ''
            } else {
                profileImage = req.file.filename;
            }
            console.log("Heloo")
            var profileUpdate = await PROFILE.findOneAndUpdate(
                {
                    userId: req.userId
                },
                {
                    profileImage: profileImage,

                }, { new: true })

            if (req.role === 'organization') {
                await ORGANIZATION.findOneAndUpdate({ userId: req.userId }, {
                    logo: profileImage
                })
            }

        } else {
            console.log("PROFILE", profileUpdate)
            var profileUpdate = await PROFILE.findOneAndUpdate({ userId: req.userId }, { name: req.body.name }, { new: true })
        }

        var image;
        if (profileUpdate.profileImage === null || profileUpdate.profileImage === '') {
            image = '';
        } else {
            image = req.protocol + "://" + req.get("host") + "/images/" + profileUpdate.profileImage
        }

        var response = {
            userId: userUpdate.id,
            email: userUpdate.email,
            profileImage: image,
            profileName: profileUpdate.profileName,
            userRole: req.role
        }
        res.status(200).json({
            status: 'success',
            message: 'profile updated successfully',
            data: response
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message,
        })
    }
};

exports.updatePasswordOfOrganizationProfile = async function (req, res, next) {
    try {

        if (!req.body.password) {
            throw new Error("password is required.")
        }
        var user = await USER.findOne({ _id: req.body.userId })
        if (!user) {
            throw new Error("User not found.")
        }
        req.body.password = await bcrypt.hash(req.body.password, 10);
        var User = await USER.findByIdAndUpdate(user._id, {
            password: req.body.password
        }, { new: true })
        res.status(200).json({
            status: 'success',
            message: 'profile password successfully.'
        })
    } catch (error) {
        res.status(400).json({
            status: 'failed',
            message: error.message
        })
    }
}
