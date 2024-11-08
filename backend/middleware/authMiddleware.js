const {handleHttpError} = require('../utils/handleHttpError')
const {verifyToken} = require('../utils/handleJwt')
const User = require('../models/user')

const authMiddleware = async (req, res, next) => {
    try{
        if (!req.headers.authorization) {
            handleHttpError(res, "NOT_TOKEN", 401)
            return
        }

        // Nos llega la palabra reservada Bearer (es un estándar) y el Token, así que me quedo con la última parte
        const token = req.headers.authorization.split(' ').pop() 
        //Del token, miramos en Payload (revisar verifyToken de utils/handleJwt)
        const dataToken = await verifyToken(token,"sign")
        
        if(dataToken === undefined || !dataToken._id){
            handleHttpError(res, "UNAUTHORIZED", 401)
            return
        }
       
        const user = await User.findById(dataToken._id)
        req.user = user

        next()

    }catch(err){
        handleHttpError(res, "NOT_SESSION", 401)
    }
}

//middleware para el email de verificacion

const emailValidationMiddleware = async (req, res, next) => {
    try{
        const token = req.headers.authorization.split(" ").pop()
        const dataToken = await verifyToken(token,"email")
        if(dataToken === undefined || !dataToken.email){
            handleHttpError(res, "UNAUTHORIZED", 401)
            return
        }
        req.email = dataToken.email 
        let nameParts = req.email.split("@")[0].split(".");

        if (Array.isArray(nameParts) && nameParts.length > 1) {
            req.name = nameParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
        }
       
        next()

    }catch(err){
        console.log(err)
        handleHttpError(res, "NOT_SESSION", 401)
    }
}

//middleware para el email de secretaria
const utadValidationMiddleware = async (req, res, next) => {
    try{
        const token = req.headers.authorization.split(" ").pop()
        const dataToken = await verifyToken(token,"utad")

        if(dataToken === undefined || !dataToken.email){
            handleHttpError(res, "UNAUTHORIZED", 401)
            return
        }
        req.email = dataToken.email 
        next()

    }catch(err){
        console.log(err)
        handleHttpError(res, "NOT_SESSION", 401)
    }
}

module.exports = {authMiddleware, emailValidationMiddleware,utadValidationMiddleware}
