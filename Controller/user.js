require("dotenv").config();
const User=require("../Model/user")

exports.DeleteAccount= async(req,res,next)=>{
    console.log("Delete Account")
    const {email}=req.body
    const {password}=req.body
    console.log("email: "+email+" "+"password: "+ password)
    try{
        const user=await User.findOne({email: email}).select("+password")
        if(!user|| !(await user.ComparePassword(password,user.password))){
            return res.status(403).json({
                status: "error",
                message: "invalid credentials"
            })
        }
        await User.deleteOne({email: email})
        return res.status(200).json({
            status: "success",
            message: "Account deleted successfully",
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