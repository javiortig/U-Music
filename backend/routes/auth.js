const express = require("express")
const router = express.Router()

const { registerCtrl, loginCtrl, registerCheckEmail,verificationEmail} = require("../controllers/auth")
const {emailValidationMiddleware} = require("../middleware/authMiddleware")
const {validatorRegister, validatorLogin, validatorCheckEmail} = require("../validators/auth")

router.post("/register",emailValidationMiddleware, validatorRegister, registerCtrl)

router.post("/login", validatorLogin, loginCtrl) 

router.get("/check-email/:email", validatorCheckEmail, registerCheckEmail)

router.post("/verification-email/:email",validatorCheckEmail,verificationEmail)


module.exports = router
