const express = require("express")
const router = express.Router()

const {createActivity, getActivities, getActivitiesWithoutReservations, getActivity, getFilteredActivities, getRecommendedActivities, updateActivityImage, updateActivity, deleteActivity, getMyActivitiesProfile, getCreatedActivitiesProfile, addUserToActivity, deleteUserFromActivity, getImportantActivities} = require("../controllers/activity")
const {authMiddleware} = require("../middleware/authMiddleware")
const checkRol = require("../middleware/rol")
const uploadMiddleware = require("../utils/handleStorage")
const {validateCreateActivity, validateAddUserToActivity, validateUpdateActivity} = require("../validators/activity")

router.post("/createActivity", validateCreateActivity, authMiddleware,createActivity)

router.get("/getActivities",authMiddleware, getActivities) 
router.get("/getActivity/:id",authMiddleware, getActivity) 
router.get("/getRecommendedActivities",authMiddleware, getRecommendedActivities)
router.get("/getImportantActivities",authMiddleware, getImportantActivities) 
router.get("/getCreatedActivitiesProfile", authMiddleware,getCreatedActivitiesProfile)
router.get("/getMyActivitiesProfile", authMiddleware,getMyActivitiesProfile)
router.get('/getFilteredActivities', authMiddleware, getFilteredActivities);

router.put("/updateActivity/:id", validateUpdateActivity, authMiddleware,updateActivity)
router.put("/addUserToActivity/:id", validateAddUserToActivity, authMiddleware,addUserToActivity)
router.put("/deleteUserFromActivity/:id", authMiddleware,deleteUserFromActivity)
router.put("/updateActivityImage/:id", uploadMiddleware.single("image"),authMiddleware,updateActivityImage)

router.delete("/deleteActivity/:id", authMiddleware,deleteActivity)

router.get('/getActivitiesWithoutReservations', getActivitiesWithoutReservations);




module.exports = router