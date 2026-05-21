const customError = require("../utils/customError");
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
const USER = require("../model/user.Schema")
dotenv.config()

const authMiddleware = async (req, res, next) => {
  let token = ""
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.split(" ")[1]) {
        token = authHeader.split(" ")[1]
  }else{
    return next(new customError("unauthorized: ", 401));
  }

  if (!token) {
      return next(new customError("unauthorized: ", 401));
    }

  try {
    const verifyToken =  jwt.verify(token, process.env.JWT_SIGNATURE)
    if(!verifyToken){
        return next(new customError("unauthorized:invaild token ", 401)); 
    }

    const user = await USER.findById(verifyToken.userId)
    if(!user){
         return next(new customError("unauthorized: user not found ", 401));
    }

     req.user = user

     return next()
  } catch (error) {
     // jwt.verify() throws if token is expired or invalid
        if (error.name === "JsonWebTokenError") {
            return next(new customError("invalid token", 401))
        }
        if (error.name === "TokenExpiredError") {
            return next(new customError("token has expired, please login again", 401))
        }
        return next(error)
  }
};

module.exports = authMiddleware