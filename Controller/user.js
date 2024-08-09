const cloudinary=require("cloudinary")
require("dotenv").config();
const User=require("../Model/user")
const FriendRequest=require("../Model/friends")
const jwt=require("jsonwebtoken")

exports.DeleteAccount= async(req,res)=>{
    console.log("Delete Account")
    const {email}=req.body
    const {password}=req.body
    console.log("email: "+email+" ")
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

exports.EditProfile= async(req,res)=>{
    console.log("Edit Profile")
    const {name, email, about, image}= req.body;
    try {
        const user =await User.findOne({email: email});
        let uploadImage;
        if (!user) {
            return res.status(404).json({
              status: "error",
              message: "User not found",
            });
          }
        if(image){
            uploadImage= await cloudinary.uploader.upload(image,{
                folder: "profile",
                max_image_size: 1000000 
            })
        }
        if(!uploadImage.secure_url){
            return res.status(503).json({
                status: "error",
                message: "Failed to upload the image,Please try again"
            })
        }
        user.imageUrl=uploadImage.secure_url;
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

exports.getUsers= async(req,res,next)=>{
    const All_users= await User.find({
        verified: true,
    }).select("name imageUrl _id")
    // const token=req.header('Authorization').replace('Bearer ','')
    // let decode;
    // try {
    //     decode=jwt.verify(token, process.env.JWT_SECRET)
    // } catch (error) {
    //     console.log(error)
    //     return res.status(401).json({
    //         status: "error",
    //         message: "Invalid token",
    //       });
    // }
    const curr_user= req.user
    const remaining_users= All_users.filter(
        (user)=>
        !curr_user.friends.includes(user._id) &&
        user._id.toString()!=curr_user._id.toString()
    )

    return res.status(200).json({
        status: "success",
        data: remaining_users,
        message: "Users fetched successfully",
      })
}

exports.getFriends= async(req,res,next)=>{
    const this_user =await User.findById(req.user._id).populate(
        "friends",
        "_id name imageUrl"
    )
    if (!this_user?.friends) {
        return res.status(200).json({ status: "success", data: [], message: "No friends found" });
      }
    return res.status(200).json({
        status: "success",
        data: this_user.friends,
        message: "Friends fetched successfully",
      })
}

exports.getFriendsRequests= async(req,res,next)=>{
    const requests= await FriendRequest.find({
        recipient: req.user._id,
    }).populate("sender","_id name imageUrl")
    if (!requests?.friends) {
        return res.status(200).json({ status: "success", data: [], message: "No requests found" });
      }
    console.log(req.user._id)
    return res.status(200).json({
        status: "success",
        data: requests,
        message: "Friend Requests fetched successfully",
      })
}