const jwt = require("jsonwebtoken")
const JWT_SECRET = process.env.JWT_SECRET

const tokenSign = async (user) => {
    const sign = jwt.sign(
        {
            _id: user._id,
            email: user.email,
            nickname: user.nickname,
            role: user.role,
            tokenType: "sign"
        },
        JWT_SECRET,
        {
            expiresIn: "2h"
        }
    )
    return sign
}

//token para verificar el email
const tokenValidation = async (email) => {
    const sign = jwt.sign(
        {
            email: email,
            tokenType: "email"
        },
        JWT_SECRET,
        {
            expiresIn: "2h"
        }
    )
    return sign
}

//Token para email a secretaria
const tokenUtad = async (email) => {
    const sign = jwt.sign(
        {
            email: email,
            tokenType: "utad"
        },
        JWT_SECRET,
        {
            expiresIn: "8h"
        }
    )
    return sign
}

const verifyToken = async (tokenJwt,tokenType) => {
    try {
        // console.log("Este es mi token = " + tokenJwt);
        const decodedToken = jwt.verify(tokenJwt, process.env.JWT_SECRET);
        console.log("Token decodificado:", JSON.stringify(decodedToken));

        //comprobamos si el token es correcto para el middleware
        if(decodedToken.tokenType !== tokenType){
            throw new Error("Token no valido")
        }
        
        return decodedToken;
    }catch(err) {
        console.log(err)
    }
}


module.exports = { tokenSign, tokenValidation, verifyToken,tokenUtad}