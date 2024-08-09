const mongoose=require("mongoose")
const friendRequestSchema =new mongoose.Schema({
    sender:{
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },
    recipient:{
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },
    createdAt:{
        type: Date,
        default: Date.now()
    }
})

const friends=mongoose.model("FriendRequest",friendRequestSchema);
module.exports= friends;