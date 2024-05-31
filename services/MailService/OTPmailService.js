const nodemailer=require("nodemailer")
const otpTemplate=require("../../Templates/Mail/OTPtemplate")
require("dotenv").config()
//send otp
//retrieve userId create new otp, set expiry time ,set otp in db
exports.sendOTP =(email,otp,res)=>{
    //send mail to user
    console.log(email)
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });
    const mailOptions={
        from: "404backend@gmail.com",
        to: email,
        subject: "OTP for verifiation",
        html: otpTemplate(email,otp)
    }

    transporter.sendMail(mailOptions,function(err,info){
        if(err){
            console.log(err)
            return res.status(502).json({
                status: "error",
                message: "Failed to send OTP"
            })
        }
        else{
            console.log("Email Sent"+ info.response)
            return res.status(200).json({
                status: "success",
                message: "OTP sent successfully"
            })
        }
    })
}
