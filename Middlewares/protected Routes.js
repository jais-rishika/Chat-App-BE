const promisify= require("util")
const jwt= require("jsonwebtoken")
const User=require("../Model/user")
require("dotenv").config()

exports.protectRoutes =async(req,res,next)=>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token=req.headers.authorization.split(" ")[1]
    }else if(req.cookies.jwt){
        token=req.cookies.jwt
    }else{
        return res.status(404).json({
            status: "error",
            message: "INVALID token"
        })
    }
}

//verify the token
const decodeToken= await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
)

//check if user exists

const valid_user =await User.findById(decodeToken.userId)
if(!valid_user){
    return req.status(403).json({
        status: "error",
        message: "User  not found"
    })
}
req.user=valid_user;
next()