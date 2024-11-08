const express = require("express")
const router = express.Router()

const {authMiddleware} = require("../middleware/authMiddleware")
const {getNotifications,deleteNotification} = require("../controllers/notifications")

router.get("/getNotifications", authMiddleware, getNotifications)

router.delete("/deleteNotification/:id", authMiddleware, deleteNotification)

module.exports = router