const { matchedData } = require("express-validator")
const { tokenSign,tokenValidation} = require("../utils/handleJwt")
const { encrypt, compare } = require("../utils/handlePassword")
const {handleHttpError} = require("../utils/handleHttpError")
const fs = require('fs');
const path = require('path');
const User = require("../models/user");
const nodemailer = require('nodemailer');
const APP_KEY = process.env.APP_KEY
const EMAIL = process.env.EMAIL

//Primer post con solo el email

const verificationEmail = async (req, res) => {
    try {
        const email = req.params.email;
        token = await tokenValidation(email)
        sendEmail(email, token);

        res.json({ message: 'Email sent' });

    } catch (err) {
        console.log(err);
        handleHttpError(res, "ERROR_VERIFICATION_EMAIL");

    }
}

// Function to send email
const sendEmail = async (toEmail, token) => {
    try {
        // Create a transporter using SMTP settings for your email provider
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: false, 
            auth: {
                user: EMAIL,
                pass: APP_KEY
            }
        });

        const mailOptions = {
            from: 'alexander.bas@live.u-tad.com',
            to: toEmail,
            subject: 'Email Verification',
            text: `Click the following link to verify your email: http://localhost:5000/configure?token=${token}`
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
    }catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

        
/**
 * Encargado de registrar un nuevo usuario
 * @param {*} req 
 * @param {*} res 
 */
const registerCtrl = async (req, res) => {
    try {

        const email = req.email;
        const name = req.name;
        req = matchedData(req)
        const password = await encrypt(req.password)
        const body = {...req, password} // Con "..." duplicamos el objeto y le añadimos o sobreescribimos una propiedad
        body.email = email;
        body.name = name;
        body.role = "user";

        
        // Obtener la lista de imágenes disponibles
        
        const imageFolder = path.join(__dirname, '../storage/FotosPerfil');
        const imageFiles = fs.readdirSync(imageFolder);
        
        // Seleccionar una imagen aleatoria
        const randomImg = imageFiles[Math.floor(Math.random() * imageFiles.length)];
       
        const imageUrl = 'http://localhost:3000/storage/FotosPerfil/' + randomImg;
        
        body.image = imageUrl;
        
        const dataUser = await User.create(body);
        dataUser.set('password', undefined, { strict: false });
        const data = {
            token: await tokenSign(dataUser),
            user: dataUser
        };

        res.send(data);
    } catch (err) {
        console.log(err);
        handleHttpError(res, "ERROR_REGISTER_USER");
    }
};


const loginCtrl = async (req, res) => {
    try {
        req = matchedData(req)
        const user = await User.findOne({ email: req.email }).select("password email nickname")

        if(!user){
            handleHttpError(res, "USER_NOT_EXISTS", 404)
            return
        }
        
        const hashPassword = user.password;
        const check = await compare(req.password, hashPassword)

        if(!check){
            handleHttpError(res, "INVALID_PASSWORD", 401)
            return
        }

        //Si no quisiera devolver el hash del password
        user.set('password', undefined, {strict: false})
        const data = {
            token: await tokenSign(user),
            user
        }

        res.send(data)

    }catch(err){
        console.log(err)
        handleHttpError(res, "ERROR_LOGIN_USER")
    }
}


const registerCheckEmail = async (req, res) => {
    try {
        const email = req.params.email;
        const user = await User.findOne({ where: { email } });
        if (user) {
            return res.json({ unique: false });
        } else {
            return res.json({ unique: true });
        }
    } catch (error) {
        console.error('Error al verificar la unicidad del correo electrónico:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}

module.exports = { registerCtrl, loginCtrl, registerCheckEmail, verificationEmail}