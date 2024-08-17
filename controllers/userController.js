var USER = require("../models/userModel");
var SESSION = require("../models/sessionModel");
var RESET = require("../models/forgetPasswordModel");
const nodemailer = require("nodemailer");
const fs = require("fs");
var bcrypt = require("bcrypt");
const utility = require("../utility/date");
const jwt = require("jsonwebtoken");
const TOKEN = require("../models/tokenModel")
const crypto = require("crypto");
const PROFILE = require("../models/profileModel");
const ORGANIZATION = require("../models/organizationModel");
const options = {
  algorithm: "RS256",
  expiresIn: process.env.JWT_EXPIRE_IN_SECONDS,
  audience: "https://kmsoft.in/",
};
let secretKey = fs.readFileSync(__dirname + "/./../jwtRS256.key", "utf8");

exports.signUp = async function (req, res, next) {
  try {
    if (!req.body.password) {
      throw new Error("Password is required.");
    } else if (!req.body.confirmPassword) {
      throw new Error("Confirm password is required.");
    } else if (!req.body.email) {
      throw new Error("Email is required.");
    } else if (!req.body.userName) {
      throw new Error("Username is required.");
    }

    var mail = await USER.findOne({ email: req.body.email });
    if (mail) {
      throw new Error("Email already exists.");
    }
    if (req.body.password != req.body.confirmPassword) {
      throw new Error("Password and confirmPassword not matched.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      throw new Error(
        "Invalid email format."
      );
    }

    req.body.password = await bcrypt.hash(req.body.password, 10);
    req.body.confirmPassword = undefined;
    const data = await USER.create({
      email: req.body.email,
      userName: req.body.userName,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      isEmailVerified: req.body.isEmailVerified,
      deletedAt: "",
      isActive: true,
      isDeleted: false,
      role: req.body.role,
    })

    const profile = await PROFILE.create({
      profileName: data.userName,
      rank: 'chiefOfficer',
      shift: 'day',
      userId: data.id,
      isDeleted: false
    })
    res.status(201).json({
      status: 201,
      message: "User create successfully.",
      data: data,
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message,
    });
  }
};

exports.logIn = async function (req, res, next) {
  try {

    var check = await USER.findOne({ email: req.body.email, isDeleted: false });
    if (!check) {
      throw new Error("User not found.")
    }
    // console.log("check", check);
    if (check.role === "fireFighter") {
      //console.log("++>>>", req.headers); // Log all headers

      const isAppHeader = req.headers.isApp || req.headers.isapp; // Check both cases
      const isApp = isAppHeader && isAppHeader.trim().toLowerCase() === 'true'; // Check if isApp header is set to 'true'
      //console.log("------", isApp); // Log the value of isApp

      if (!isApp) {
        throw new Error("Login not allowed for non-app requests.");
      }

    } else if (check.role === 'superAdmin' || check.role === 'organization') {
      if (req.role === 'superAdmin') {
        const isAppHeader = req.headers.isApp || req.headers.isapp; // Check both cases
        const isApp = isAppHeader && isAppHeader.trim().toLowerCase() === 'true'; // Check if isApp header is set to 'true'
        if (isApp) {
          throw new Error("Login not allowed for superAdmin and organizations on App.");
        }
      }
    } else {
      throw new Error("Login not allowed for non-app requests.");
    }

    const { notificationToken, ipAddress, deviceName, platform } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      throw new Error(
        "Invalid email format."
      );
    }
    var mail = await USER.findOne({ email: req.body.email, isDeleted: false });
    var profile = await ORGANIZATION.findOne({ userId: mail._id, isDeleted: false });

    if (!mail) {
      throw new Error("User not found.");
    }
    let checkPass = await bcrypt.compare(req.body.password, mail.password);
    if (!checkPass) {
      throw new Error("Password invalid.");
    }

    const currentDate = new Date();
    const expiresAt = utility.addDays(
      currentDate,
      parseInt(process.env.JWT_EXPIRE_IN_SECONDS)
    );
    var objectToCreateToken = {
      userName: mail.userName,
      email: mail.email,
      password: mail.password,
      userId: mail._id,
      role: mail.role,
      createdAt: new Date()
    };
    var token = jwt.sign(objectToCreateToken, secretKey, options);
    const refreshTokenPayload = {
      userId: mail._id,
    };

    // const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    //   modulusLength: 2048,
    //   publicKeyEncoding: { type: 'spki', format: 'pem' },
    //   privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    // });

    const refreshToken = jwt.sign(refreshTokenPayload, secretKey, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN_SECONDS,
      algorithm: 'RS256',
    });

    var tokenCreate = await TOKEN.create({
      accessToken: token,
      refreshToken: refreshToken,
      userId: mail._id
    })

    var session = await SESSION.create({
      notificationToken: notificationToken,
      jwtToken: token,
      refreshToken: refreshToken,
      userAgent: req.get("User-Agent"),
      ipAddress: req.ip || ipAddress,
      deviceName: deviceName,
      platform: platform,
      userId: mail._id,
      generatedAt: Date.now(),
      isActive: true,
    });

    let response = {
      status: 202,
      message: "User Login Successfully.",
      userRole: objectToCreateToken.role,
      token: token,
      refreshToken: refreshToken,
      userId: mail._id,

    }

    if (profile) {

      function formatDate(timestamp) {
        const date = new Date(parseInt(timestamp));
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }

      let status = null;
      let exDate = formatDate(profile?.expireDate);
      let subDate = formatDate(profile?.subscriptionDate)
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
        // logo: (profile && profile.logo) ? req.protocol + "://" + req.get("host") + "/images/" + profile.logo : null,
        station: (profile && profile.station) ? profile.station : null,
        organizationId: (profile && profile._id) ? profile._id : null,
        name: (profile && profile.name) ? profile.name : null,
        subscriptionDate: formatDate(profile.subscriptionDate),
        expireDate: formatDate(profile.expireDate),
        status: status ? status : null,
      }
    }

    res.status(202).json(response);

  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
};

exports.token = async (req, res, next) => {
  try {

    if (!req.body.refreshToken || req.body.refreshToken == null) {
      throw new Error('Please provide a refresh token.');
    }

    let isValidRefreshToken = jwt.verify(req.body.refreshToken,secretKey)
    if(!isValidRefreshToken) throw new Error('refresh token is expired.');

    var token = await TOKEN.findOne({ refreshToken: req.body.refreshToken });
    if (token) {

      var findAccess = await SESSION.findOne({ refreshToken: req.body.refreshToken, });
      if (findAccess) {

        var userFind = await USER.findOne({ _id: findAccess.userId })
        const currentDate = new Date();
        const expiresAt = utility.addDays(currentDate, parseInt(process.env.JWT_EXPIRE_IN_SECONDS));
        var objectToCreateToken = {
          userName: userFind.userName,
          email: userFind.email,
          password: userFind.password,
          userId: userFind._id,
          role: userFind.role,
          createdAt: new Date()
        };


        var tokenGenerate = jwt.sign(objectToCreateToken, secretKey, options);

        var updatedAccess = await SESSION.findByIdAndUpdate(findAccess._id, {
          jwtToken: tokenGenerate
        }, { new: true });

        res.status(202).json({
          status: 202,
          message: 'Token updated successfully.',
          token: tokenGenerate
        })
      } else {
        throw new Error('Please again login your account.');
      }
    } else {
      throw new Error('This token user does not exist. try again login.');
    }
  } catch (error) {
    res.status(400).json({
      status: 'Fail',
      message: error.message,
    })
  }
}

exports.forgetPassword = async (req, res, next) => {
  try {
    var email = req.body.email;

    if (email == null) {
      throw new Error("Please provide email.");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      throw new Error(
        "'@' and '.' must be used in Email address like 'test@example.com'."
      );
    }
    let user = await USER.findOne({ email: req.body.email });

    if (user == null) {
      throw new Error("Email not found.");
    }
    console.log(user);

    let otpcode = Math.floor(900000 * Math.random() + 100000);
    console.log("OTP", otpcode);
    let date_ob = new Date().getTime() + 15 * 60000;
    let expiresAt = new Date(date_ob);

    await RESET.deleteMany({ email: user.email });

    let otpdata = new RESET({
      verificationCode: otpcode,
      email: user.email,
    });

    let otpResponse = await otpdata.save();
    res.status(200).json({
      status: 'success',
      message: 'Verification code sent successfully'
    });

    async function main() {
      let testAccount = await nodemailer.createTestAccount();
      console.log('loginnnnnn');
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: "testkmsof@gmail.com", // generated ethereal user
          pass: "ccawsblafxnqtppq", // generated ethereal password
        },
      });

      let info = await transporter.sendMail({
        from: "testkmsof@gmail.com", // sender address
        to: req.body.email, // list of receivers   "bipin.kheni.bk.bk21@gmail.com"
        subject: "Hello ✔", // Subject line
        text: "otpcode:" + otpcode, // plain text body
      });

      console.log("Message sent: %s", "Check your email Id.");
      console.log(
        "Preview URL: %s",
        nodemailer.getTestMessageUrl("Check your email.")
      );
    }
    main().catch(console.error);

    return;
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

exports.compareCode = async function (req, res) {
  try {

    let verificationCode = req.body.verificationCode;
    let email = req.body.email;

    if (!email) {
      throw new Error("Please provide an email address.");
    }
    if (!verificationCode) {
      throw new Error("Please provide a verification code.");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(
        "'@' and '.' must be used in Email address like 'test@example.com'."
      );
    }

    var reset = await RESET.findOne({
      verificationCode: verificationCode,
      email: email,
    });
    if (!reset) {
      throw new Error("Invalid verification code or email address.");
    }
    if (!reset.email) {
      throw new Error("Email address does not exist.");
    }
    var validation = reset.email

    res.status(200).json({
      status: "Success",
      message: "Your verification code is accepted.",
    });
  } catch (error) {
    res.status(400).json({
      status: "Failed",
      message: error.message,
    });
  }
};

exports.resetPassword = async function (req, res, next) {
  try {
    let password = req.body.password;

    //console.log(req.body);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      throw new Error(
        "'@' and '.' must be used in Email address like 'test@example.com'."
      );
    }
    if (
      !password ||
      !req.body.confirmPassword
    ) {
      throw new Error("Please provide a valid password.");
    }

    if (password != req.body.confirmPassword) {
      throw new Error("Password is not matched with confirmation password.");
    }

    password = await bcrypt.hash(password, 10);

    req.body.confirmPassword = undefined;

    var mail = await USER.findOne({ email: req.body.email });
    if (!mail) {
      throw new Error("User not found.");
    }
    console.log(mail);
    mail.password = password;
    mail.save();
    message = "password changed successfully";

    res.status(200).json({
      status: "Success",
      message: "Your password has been reset.",
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};

exports.logOut = async function (req, res, next) {
  try {
    // var token = req.body.authorization || req.headers['authorization'];
    // console.log(token)
    // if (!token) {
    //   throw new Error("Authorization token is missing.");
    // }
    // console.log(token);

    var SESSION_UPDATE = await SESSION.findOneAndUpdate({ jwtToken: req.token }, {
      isActive: false,
    }, { new: true });

    console.log(SESSION_UPDATE);
    // var sessiondelete = await SESSION.deleteOne({ jwtToken: token });
    // console.log(sessiondelete);
    res.status(200).json({
      status: 200,
      message: "User Logout Successfully.",
      token: SESSION_UPDATE,
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message,
    });
  }
};

// exports.logOut = async(req, res, next) => {
//   try {
//     console.log("req.token: " , req.token);
//       var find = await SESSION.findOne({ jwtToken : req.token , isActive : true }).sort({ createdAt : -1 });
//       if (find) {

//           var tokenFind = await TOKEN.findOne({ userId : find.userId });
//           if(tokenFind) {
//               await TOKEN.findByIdAndDelete(tokenFind._id)
//           }

//           await SESSION.findByIdAndUpdate(find._id, {
//               isActive: false,
//           });

//           res.status(200).json({
//               status: 200,
//               message: 'You have been logged out.'
//           });
//       } else {
//           res.status(404).json({
//               status: 404,
//               message: 'Session not found or already inactive.'
//           });
//       }
//   } catch (error) {
//       res.status(400).json({
//           status : "Fail",
//           message : error.message
//       })
//   }
// }


exports.tokenVerify = async function (req, res, next) {
  try {

    if (!req.params.token) {
      throw new Error('Please provide a token.')
    }
    var token = req.params.token;
    var tokenFind = await SESSION.findOne({ jwtToken: token });
    if (tokenFind) {
      const currentTime = new Date().getTime();
      const twentyFourHoursAgo = currentTime - 24 * 60 * 60 * 1000;

      if (tokenFind.createdAt >= twentyFourHoursAgo) {
        res.status(200).json({
          status: 200,
          message: 'This token is valid and not expired.'
        })
      } else {
        res.status(401).json({
          status: 401,
          message: 'Token has expired.'
        })
      }
    } else {
      res.status(401).json({
        status: 401,
        message: 'Token not found.'
      })
    }

  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error.message
    })
  }
}