const express=require("express")
const router=express.Router();

const userController=require("../Controller/user");

// router.post("/profile",authController.EditProfile)
router.post("/delete-account",userController.DeleteAccount)


module.exports=router;