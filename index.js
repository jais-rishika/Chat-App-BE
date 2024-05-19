const express=require("express");
const app=express();

require("dotenv").config()
const PORT=process.env.PORT;

const morgan=require("morgan");
const rateLimit=require("express-rate-limit");
const helmet=require("helmet")
const cors=require("cors")

//DURING testing 

//if error or exception comes athat we can't catch can off the server
process.on("uncaughtException",(err)=>{
    console.log(err);
    process.exit(1)
})
//promise rejection is handled if not handled saperately
process.on("unhandledRejection",(err)=>{
    console.log(err);
    process.exit(1)
})

app.use(express.json())
//to parse form data
app.use(
    express.urlencoded({
        extended: true,
    })
)
app.use(cors({
    origin: "*",
    methods: ["GET","POST","PUT","PATCH","DELETE"],
    credentials: true,//what is this
}))
app.use(helmet())

app.use(express.json({limit: "10kb"}))

if(process.env.NODE_ENV==="DEVELOPMENT"){
    app.use(morgan("dev"))
}
const routes=require("./Routers/auth.js")
app.use("/api/v1", routes);
const limiter=rateLimit({
    max: 4000,
    windowMs: 60*60*1000,
    message: "Too many requests from this IP, please try again in an hour",
})

app.use("/api",limiter);

app.listen(8080,()=>{
    console.log(`Server is running at PORT ${PORT}`)
})

const dbConnect=require("./Config/config.js");
dbConnect();