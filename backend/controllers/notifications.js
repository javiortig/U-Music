const {handleHttpError} = require('../utils/handleHttpError');
const Notification = require('../models/notifications');

// Crear una nueva notificación para un usuario
const createNotification = async function(subject,message,userId){
    try {

        if (!subject || !message || !userId ) {
            throw new Error('Notification details are missing');
        }
        const notification = new Notification({
            subject: subject,
            message: message,
            user: userId
        });

        const savedNotification = await notification.save();
        if (!savedNotification) {
            throw new Error('Notification not created');
        }
        return notification;
    } catch (error) {
        throw error;

        return null;
    }
}

//coger las notificaciones de un usuario
const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
        if (!notifications) {
            throw new Error('Notifications not found');
        }
        
        res.send(notifications);
    } catch (error) {
        handleHttpError(res, "ERROR_GETTING_NOTIFICATIONS", 403);
    }
}

//eliminar una notificación
const deleteNotification = async (req, res) => {
    try {
        const notificationId = req.params.id;
        //comprobamos primero que el usuario y el usuario de la notificación sean el mismo
        const notification = await Notification.finbById(notificationId);
        if (notification.user !== req.user._id) {
            throw new Error('Unauthorized');
        }

        const data = await Notification.deleteOne({ _id: notificationId });
        if (!data) {
            throw new Error('Notification not found');
        }
        res.send(data);
    }
    catch (error) {
        handleHttpError(res, "ERROR_DELETING_NOTIFICATION", 403);
    }
}

module.exports = {createNotification,getNotifications,deleteNotification};
