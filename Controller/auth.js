//jwt token
const jwt=require("jsonwebtoken");
require("dotenv").config();
const User=require("../Model/user")
const cloudinary=require("cloudinary")
const otpGenerator=require("otp-generator")
const crypto=require("crypto")
//token creation
const createToken=(userId)=>{
    return jwt.sign({userId},process.env.JWT_SECRET)
}

const filterObj=require("../utils/filterObj")
const {sendOTP}= require("../services/MailService/OTPmailService")
const sendPasswordResetEmail = require("../services/MailService/passwordResetMailService");

//register
//retrieve email and password ,filterbody to send, check if existing user ,if and also verified then error, else update
exports.register=async (req,res,next)=>{
    try{
    const { email } = req.body;
    const filterBody = filterObj(req.body, "email", "password");
    const existingUser=await User.findOne({email:email})
    if(existingUser && existingUser.verified){
        return res.status(403).json({
            status: "Error",
            message: "Email already exists",
        }) 
    }
    else if(existingUser){
        await User.findOneAndUpdate({email:email},filterBody,{
            new: true,
            validateModifiedOnly: true
        })
        req.userId=existingUser._id;
        next();
    }
    
    else{ 
        const new_user=await User.create(filterBody)
        req.userId=new_user.id;
        next();
    }
}catch(err){
    console.log(err)
    return res.status(500).json({
        status: "Error",
        message: "Something wrong",
    })
}}

//send otp
//retrieve userId create new otp, set expiry time ,set otp in db
exports.sendOTP =async(req,res,next)=>{
    const userId=req.userId;
    const new_otp=otpGenerator.generate(6,{
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false, 
    })
    
    const otp_expiry_time=Date.now() + 10 * 60 * 1000;
    const user=await User.findByIdAndUpdate(userId,{
        otp: new_otp,
        otpExpires: otp_expiry_time,
    })
    user.otp=new_otp.toString()
    await user.save({
        new: true,
        validateModifiedOnly: true
    })
   
    //send mail to user
    try{
        console.log(user.email +" "+user.otp+" "+res)
        sendOTP(user.email,new_otp,res);
    }
    catch{
        return res.status(502).json({
            status: "error",
            message: "Some Error Occurred",
          });
    }
}

  
//verify otp
//retrieve email and otp ,find user thorough email and if not expired, compareOTP, if coreect make verified user
exports.verifyOTP=async(req,res,next)=>{
    const {email,otp}=req.body
    const user=await User.findOne({
        email: email,
        otpExpires: {$gt: Date.now()}
    })
    console.log(user)
    if(!user){
        console.log("hello1")
        return res.status(403).json({
            status: "error",
            message: "Invalid Email or OTP expired"
        })
    }
    if(!(await user.CompareOTP(otp,user.otp))){
        console.log("hello2")
        return res.status(403).json({
            status: "error",
            message: "Invalid or expired OTP "
        })
    }
    const token=createToken(user._id);
    
    user.verified=true;
    user.otp=undefined;
    user.otpExpires=undefined;

    await user.save()
    return res.status(200).json({
        status: "success",
        message: "You are verified user now",
        token
    })
    
}

//login
//get email and password, find password though email compare pass , generate token and return the status
exports.login=async (req,res,next)=>{
    const {email,password}=req.body;
    const user=await User.findOne({email:email}).select("+password")
    if(!user|| !(await user.ComparePassword(password,user.password))){
        return res.status(403).json({
            status: "error",
            message: "invalid credentials"
        })
    }
    const token=createToken(user._id);
        return res.status(200).json({
        status: "success",
        message: "Logged in successfully",
        token
    })
}

exports.forgetPassword=async(req,res,next)=>{
    const {email}=req.body;
    const user= User.findOne({email})

    if(!user){
        return res.status(404).json({
            status: "error",
            message: "INVALID Email "
        })
    }

    const resetToken= await user.createPasswordResetToken();
    await User.save({validateBeforeSave: false })
    try{
        const reseturl=`http:localhost:3000/auth/reset-password/code=${resetToken}`;
        sendPasswordResetEmail(email,reseturl,res)
    }
    catch(err){
        user.passwordResetToken=undefined
        passwordResetExpires = undefined;

        await User.save({validateBeforeSave: false })
        
        return res.status(502).json({
            status: "error",
            message: "there was an error sending the mail. Try again later"
        })
    }
}

exports.resetPassword=async()=>{
    //get user on basis of their token
    const hashedToken= crypto
    .createHash("SHA256")
    .update(req.body.token)
    .digest("hex")

    const user= await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {$gt: Date.now()}
    })

    //if user not found
    if(!user){
        return res.status(403).json({
            status: "error",
            message: "Something went wrong"
        })
    }

    //send mail to user

    //update the password
    user.password=req.body.password;
    user.passwordResetToken=undefined
    user.passwordResetTokenExpires=undefined

    await user.save();

    const token= createToken(user._id)
    return res.status(200).json({
        status: "success",
        message: "Password updated successfully",
        token
    })

}

exports.CreateProfile=async(req,res,next)=>{
    const {name,about,email,image}=req.body;
    try{
        const user=await User.findOne({email: email})
        if(!user){
            return res.status(403).json({
                status: "error",
                message: "Something went wrong"
            }) 
        }
        if(image){
            const uploadImage= await cloudinary.uploader.upload(image,{
                folder: "profile",
                max_image_size: 1000000 // 1 MB
            })
            if(!uploadImage.secure_url){
                return res.status(503).json({
                    status: "error",
                    message: "Failed to upload the image,Please try again"
                })
            }
            user.imageUrl=uploadImage.secure_url;
        }
        user.name=name;
        user.about=about;

        await user.save();
        let url;
        if(user.imageUrl){
            url=user.imageUrl
        }
        return res.status(200).json({
            status: "success",
            message: "image successfully uploaded",
            name,
            about,
            url
        })
    }
    catch(err){
        console.log(err)
        return res.status(503).json({
            status: "error",
            message: "Some error occured"
        })
    }
}