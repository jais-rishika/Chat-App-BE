const express=require("express")
const router=express.Router();

const authController=require("../Controller/auth");

router.post("/register",authController.register,authController.sendOTP);
router.post("/login",authController.login)
router.post("/verify-otp",authController.verifyOTP)
router.post("/send-otp",authController.sendOTP)
router.post("/reset-password",authController.resetPassword)
router.post("/forgot-password",authController.forgetPassword)
router.post("/create-profile",authController.CreateProfile)

module.exports=router;