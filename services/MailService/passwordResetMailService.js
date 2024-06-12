const nodemailer=require("nodemailer")
//template
const resetTemplate=require("../../Templates/Mail/passwordResetTemplate")

require("dotenv").config()
exports.sendPasswordResetEmail=(email,reseturl,res)=>{
    console.log("gmail"+ email)
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
        subject: "Request for Password Reset",
        html: resetTemplate(email,reseturl),
    }
    
    transporter.sendMail(mailOptions,function(err,info){
        if(err){
            console.log(err)
            return res.status(502).json({
                status: "error",
                message: "Failed to send link"
            })
        }
        else{
            console.log("Email Sent"+ info.response)
            return res.status(200).json({
                status: "success",
                message: "Link sent successfully"
            })
        }
    })
}


