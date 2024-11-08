const express = require("express")
const router = express.Router()

const {authMiddleware} = require("../middleware/authMiddleware")

const {validatorUserUpdate, validatorUserUpdatePassword} = require("../validators/users")

const { getUserProfile, updateUserProfile, deleteUser, updateUserPassword,checkNickaname,updateUserImage,getAllUsers,getFilteredUsers,getAnotherUserProfile,adminDeleteUser} = require("../controllers/users")

const uploadMiddleware = require("../utils/handleStorage")



router.get("/getUserProfile", authMiddleware, getUserProfile)

router.put("/updateUserProfile", authMiddleware, validatorUserUpdate, updateUserProfile)

router.put("/updateUserPassword", authMiddleware, validatorUserUpdatePassword, updateUserPassword)

router.delete("/deleteUserProfile", authMiddleware, deleteUser)

router.delete("/adminDeleteUser/:id", authMiddleware, adminDeleteUser)

router.get("/checkNickname/:nickname", checkNickaname)

router.put("/updateUserImage",uploadMiddleware.single("image"),authMiddleware, updateUserImage)

router.get("/getAllUsers", authMiddleware,getAllUsers)

router.get("/getFilteredUsers", authMiddleware,getFilteredUsers)

router.get("/getAnotherUserProfile/:id", authMiddleware,getAnotherUserProfile)




module.exports = router