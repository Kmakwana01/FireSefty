const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
var SESSION = require('../models/sessionModel')
dotenv.config({ path: __dirname + '/./../.env' });
const utility = require('../utility/date')
const fs = require('fs');

const options = {
  algorithm: "RS256",
  expiresIn: '1d',
  audience: 'https://kmsoft.in/'
};
let privateKey = fs.readFileSync(__dirname + '/./../jwtRS256.key', 'utf8');

exports.verifyToken = async (req, res, next) => {

  const token = req.headers["authorization"] || req.body.token || req.query.token || req.headers["x-access-token"];
  console.log(token,"token")
  if (!token) {
    return res.status(401).send({ "error": "A token is required for authentication", header: req.headers });
  }
  try {
    const tokenArray = token.split(" ");
    if (tokenArray.length > 1) {
      const token = tokenArray[1];

      var FIND_SESSION = await SESSION.findOne({ jwtToken: token, isActive: true });
      if (!FIND_SESSION) {
        throw new Error("Your session is expired.")
      }

      const user = jwt.verify(token, privateKey, options);

      if (user.exp) {
        let tokeExpiresAt = new Date(user.exp * 1000);
        const currentDate = new Date();
        if (tokeExpiresAt.getTime() > currentDate.getTime()) {
          req.userId = user.userId;
          req.role = user.role;
          req.token = FIND_SESSION.jwtToken
          console.log(req.role , "---------->" , req.userId);
          return next();

        }
        else {
          return res.status(419).send({ "error": "Token expired" });
        }
      }
      else {
        return res.status(498).send({ "error": "Invalid token" });
      }
    }
    else {
      return res.status(401).send({ "token": tokenArray, "tokenLength": tokenArray.length, "error": "Invalid Token 1", header: req.headers });
    }
  }
  catch (err) {
    return res.status(401).send({ "error": "Invalid Token 2", header: req.headers, err: err });
  }
};