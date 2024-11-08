const User = require('../models/user')
const { handleHttpError } = require('../utils/handleError')
const { matchedData } = require('express-validator')
const Activity = require('../models/activity')
const Reservation = require('../models/reservation')
const { encrypt } = require("../utils/handlePassword")
const { createModification } = require('./modifications');
const {createNotification} = require('./notifications');

/**
 * Obtener los datos de un usuario para la página de perfil
 * @param {*} req 
 * @param {*} res 
 */
const getUserProfile = async (req, res) => {
    try{
        const user = await User.findOne({ email: req.user.email }).select( "name email nickname bio instruments availabilitySchedule image")
        res.send({user})
    }catch(err){
        handleHttpError(res, 'ERROR_GET_USER') //Si nos sirve el de por defecto que hemos establecido, no es necesario pasar el 403
    }
}

/**
 * Actualizar un actualiza los datos de un usuario
 * @param {*} req 
 * @param {*} res 
 */
const updateUserProfile = async (req, res) => {
    try {
        const id  = req.user._id
        const body = matchedData(req)

        const data = await User.findOneAndUpdate(id, body);

        res.send(data)    
    }catch(err){
        console.log(err) 
        handleHttpError(res, 'ERROR_UPDATE_USER')
    }
}

const updateUserImage = async (req, res) => {
    try {
        const id  = req.user._id
        const image = req.file.filename 

        const imageUrl = 'http://localhost:3000/storage/usersImages/' + image;

        const updatedUser = await User.findByIdAndUpdate(id, {image: imageUrl}, {new: true}).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User image updated successfully', user: updatedUser });
    }
    catch(err){
        console.log(err)
        handleHttpError(res, 'ERROR_UPDATE_USER_IMAGE')
    }
}


/**
 * Eliminar un usuario
 * @param {*} req 
 * @param {*} res 
 */
const deleteUser = async (req, res) => {
    try {
        const nickname = req.user.nickname;

        // Eliminar actividades creadas por el usuario
        await Activity.deleteMany({ createdBy: nickname });

        // Eliminar al usuario de los arrays de usuarios en las reservas
        await Reservation.updateMany(
            { users: nickname },
            { $pull: { users: nickname } }
        );

        // Eliminar al usuario de la colección de usuarios
        const data = await User.deleteOne({ _id: req.user._id });

        res.send(data);
    } catch(err) {
        console.log(err);
        handleHttpError(res, 'ERROR_DELETE_USER');
    }
};

// Eliminar un usuario por parte de un administrador
const adminDeleteUser = async (req, res) => {
    try {
        if(req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const id = req.params.id
        const user = await User.findById(id)
        // Eliminar actividades creadas por el usuario
        await Activity.deleteMany({ createdBy: user.nickname });

        // Eliminar al usuario de los arrays de usuarios en las reservas
        await Reservation.updateMany(
            { users: user.nickname },
            { $pull: { users: user.nickname } }
        );

        // Eliminar al usuario de la colección de usuarios
        const data = await User.deleteOne({ _id: id });
        if (!data) {
            return res.status(404).json({ error: 'User not found' });
        }

        createModification("DELETE USER", req.user._id, id);

        res.send(data);
    } catch(err) {
        console.log(err);
        handleHttpError(res, 'ERROR_DELETE_USER');
    }
};

/**
 * Encargado de actualizar la contraseña de la base de datos
 * @param {*} req 
 * @param {*} res 
 */

const updateUserPassword = async (req, res) => {
    try {
        const id  = req.user._id
        const validData = matchedData(req);
        const password = await encrypt(validData.password) // Assuming the new password is sent in the request body
        const data = await User.findOneAndUpdate({_id: id}, {password: password}, {new: true}).select('-password');

        res.send(data);
    } catch (err) {
        console.log(err);
        handleHttpError(res, "ERROR_REGISTER_USER");
    }
};

const checkNickaname = async (req, res) => {
    try {
        const nickname = req.params.nickname;
        const data = await User.findOne({ nickname: nickname });
        if(data){
            res.send({status: true})
        }
        else{
            res.send({status: false})
        }
    }
    catch(err) {
        console.log(err);
        handleHttpError(res, 'ERROR_GET_NICKNAME');
    }
}

//get all users 
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.send(users);
    } catch (err) {
        console.log(err);
        handleHttpError(res, 'ERROR_GET_USERS');
    }
}

//muestra actividades que cumplan con los filtros de búsqueda

const getFilteredUsers = async (req, res) => {
    try {
        const { name, nickname, instrument } = req.query;
        const filter = {};

        if (name) filter.name = new RegExp("^" + name, 'i');
        if (nickname) filter.nickname = new RegExp("^" + nickname, 'i');
        if (instrument) {
            const instrumentArray = instrument.split(',').map(instrument => new RegExp("^" + instrument.trim(), 'i'));
            filter.instruments = { $all: instrumentArray };
        }

        const users = await User.find(filter).select('-password');
        res.send(users);
    } catch (err) {
        console.log(err);
        handleHttpError(res, 'ERROR_GET_FILTERED_USERS');
    }
}

//coge el user de otra persona
const getAnotherUserProfile = async (req,res) => {
    try {
        const id = req.params.id
        const user = await User.findById(id).select('-password');
        res.send(user);
    } catch (err) {
        console.log(err);
        handleHttpError(res, 'ERROR_GET_USER');
    }
}




module.exports = { getUserProfile, updateUserProfile, deleteUser, updateUserPassword,checkNickaname,updateUserImage,getAllUsers,getFilteredUsers,getAnotherUserProfile,adminDeleteUser};