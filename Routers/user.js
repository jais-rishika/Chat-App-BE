const express=require("express")
const router=express.Router();

const userController=require("../Controller/user");
const protectedRoutes=require("../Middlewares/protectedRoutes")

// router.post("/profile",authController.EditProfile)
router.post("/delete-account",protectedRoutes, userController.DeleteAccount)
router.post("/edit-profile", protectedRoutes, userController.EditProfile)
router.get("/get-users", protectedRoutes, userController.getUsers)
router.get(
    "/get-friend-requests",
    protectedRoutes,
    userController.getFriendsRequests
)
router.get("/get-friends", protectedRoutes, userController.getFriends);
module.exports=router;