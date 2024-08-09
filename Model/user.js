const mongoose=require("mongoose")
const bcrypt=require("bcrypt")
const crypto=require("crypto")
const userSchema=new mongoose.Schema(
    {
        name:{
            type: String
        },
        imageUrl:{
            type: String
        },
        about: {
            type: String
        },
        email:{
            type: String,
            required: [true, "email is required"],
            unique: true,
            validate:{
                validator: function(email){
                    return String(email)
                    .toLowerCase()
                    .match(
                        /^(([^<>()\[\]\.,;:\s@"]+(\.[^<>()\[\]\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    )
                },
                message: "email is not valid"
            }
        },
        password:{
            type: String,
            required: [true,"password is required"],
            validate:{
                validator: function (password){
                    return password.length>=6
                },
                message:"Password must be atleast 6 characters long"
            },
        },
        createdAt:{
            type: Date
        },
        updatedAt:{
            type: Date
        },
        passwordChangedAt:{
            type: Date
        },
        passwordResetToken:{
            type: String
        },
        passwordResetTokenExpires:{
            type: Date
        },
        verified:{
            type: Boolean,
            default: false
        },
        otp:{
            type: String
        },
        otpExpires:{
            type: Date
        },
        socket_id:{
            type:String
        },
        friends:[{
            type: mongoose.Schema.ObjectId,
            ref: "User"
        }]
    },
        { timestamps: true },
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("otp") || !this.otp) return next();
  
    this.otp = await bcrypt.hash(this.otp.toString(), 12);
  
    next();
  });
  
  userSchema.pre("save", async function (next) {
    if (!this.isModified("password") || !this.password) {
      return next();
    }
    this.password = await bcrypt.hash(this.password, 12);
  
    next();
  });
  
  userSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew || !this.password)
      return next();
  
    this.passwordChangedAt = Date.now() - 1000;
    next();
  });


userSchema.methods.ComparePassword = async function (
    candidatePassword,
    userPassword
  ) {
    return await bcrypt.compare(candidatePassword, userPassword);
  };

userSchema.methods.CreatePasswordResetToken = async function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
  
    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
  
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
    return resetToken;
  };

userSchema.methods.CompareOTP =async function(candidateOTP,userOTP){
    console.log("Compare")
    return await bcrypt.compare(candidateOTP,userOTP)
}

const User=mongoose.model("User",userSchema);
module.exports= User;