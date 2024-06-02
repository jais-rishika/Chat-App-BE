const express=require("express");
const app=express();

require("dotenv").config()
const PORT=process.env.PORT;

const routes=require("./Routers/index.js")
const morgan=require("morgan");
const rateLimit=require("express-rate-limit");
const helmet=require("helmet")
const cors=require("cors")

const dbConnect=require("./Config/config.js");

//if error or exception comes athat we can't catch can off the server
process.on("uncaughtException",(err)=>{
    console.log(err);
    process.exit(1)
})

app.use(cors({
    origin: "*",
    methods: ["GET","POST","PUT","PATCH","DELETE"],
    credentials: true,//what is this
}))

dbConnect();

app.use(helmet())
//to parse form data
app.use(
    express.urlencoded({
        extended: true,
        limit: "50mb",
        parameterLimit: 100000000,
    })
)
app.use(express.json({limit: "2mb"}))
app.use("/api/v1", routes);
const limiter=rateLimit({
    max: 4000,
    windowMs: 60*60*1000,
    message: "Too many requests from this IP, please try again in an hour",
})
app.use("/chatup",limiter);

if(process.env.NODE_ENV==="DEVELOPMENT"){
    app.use(morgan("dev"))
}
//promise rejection is handled if not handled saperately

process.on("unhandledRejection",(err)=>{
    console.log(err);
    process.exit(1)
})

app.listen(PORT,()=>{
    console.log(`Server is running at PORT ${PORT}`)
})

