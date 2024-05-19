const mongoose=require("mongoose")
require("dotenv").config()


const url=process.env.MONGO_DB.replace("<password>",process.env.PASSWORD)
const dbConnect=()=>{
    mongoose.connect(url)
    .then(()=>console.log("Database connected"))
    .catch((err)=>console.log(err))
}

module.exports=dbConnect