const express = require("express")
const router = express.Router()

const {createAnswer, getAnswersByPost,updateAnswer,deleteAnswer} = require("../controllers/answers")
const {authMiddleware} = require("../middleware/authMiddleware")
const {validateCreateAnswer, validateUpdateAnswer} = require("../validators/answers")

router.post("/createAnswer", validateCreateAnswer, authMiddleware,createAnswer)

router.put("/updateAnswer/:id", validateUpdateAnswer, authMiddleware,updateAnswer)

router.delete("/deleteAnswer/:id", authMiddleware,deleteAnswer)

module.exports = router