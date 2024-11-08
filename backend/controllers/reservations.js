const Reservation = require('../models/reservation');
const Activity = require('../models/activity');
const User = require('../models/user');
const {handleHttpError} = require('../utils/handleHttpError');
const moment = require('moment');
const { createModification } = require('./modifications');
const {createNotification} = require('./notifications');
const { tokenUtad } = require("../utils/handleJwt")
const nodemailer = require('nodemailer');
const APP_KEY = process.env.APP_KEY;
const EMAIL = process.env.EMAIL;
const EMAIL_SECRETARIA = process.env.EMAIL_SECRETARIA;

const checkStatus = async () => {
    
    try {
        
        // Obtener la fecha y hora actual
        const currentDate = new Date();

        // Obtener todas las actividades
        const activities = await Activity.find();

        // Iterar sobre cada actividad
        for (let activity of activities) {
            // Obtener las reservas para la actividad actual
            const reservations = await Reservation.find({ activity_id: activity._id });

            let allReservationsCompleted = true;
            let anyReservationInProgress = false;

            // Iterar sobre cada reserva
            for (let reservation of reservations) {
                // Obtener la fecha y hora de la reserva
                const reservationDate = new Date(reservation.date);
                const timeSlot = reservation.time_slot.split('-');
                const reservationStartTime = parseInt(timeSlot[0], 10);
                const reservationEndTime = parseInt(timeSlot[1], 10);

                 // Convertir los números en objetos de hora
                 const startTimeObject = new Date(reservationDate);
                 startTimeObject.setHours(reservationStartTime);
 
                 const endTimeObject = new Date(reservationDate);
                 endTimeObject.setHours(reservationEndTime);
 
                 // Verificar si la reserva ha ocurrido
                 if (currentDate > endTimeObject || (currentDate.getDate() === reservationDate.getDate() && currentDate.getHours() >= reservationEndTime)) {
                     // La reserva ha ocurrido
                     continue;
                 } else if (currentDate.getDate() === reservationDate.getDate() && currentDate.getHours() >= reservationStartTime && currentDate.getHours() < reservationEndTime) {
                     // La reserva está en curso
                     anyReservationInProgress = true;
                 } else {
                     // La reserva no ha ocurrido
                     allReservationsCompleted = false;
                     break;
                 }
            }

            // Si alguna reserva está en curso, actualizar el estado de la actividad a "en curso"
            if (anyReservationInProgress) {
                await Activity.findByIdAndUpdate(activity._id, { state: 'en curso' });
            }
            // Si todas las reservas han ocurrido y hay reservas, actualizar el estado de la actividad a "terminada"
            else if (allReservationsCompleted && reservations.length > 0) {
                await Activity.findByIdAndUpdate(activity._id, { state: 'terminado' });
            }
            // Si no hay reservas en curso y no todas han ocurrido
            else {
                // Comprobar el número de plazas disponibles
                if (activity.plazas_disponibles === 0) {
                    // Cambiar el estado de la actividad a "completo"
                    await Activity.findByIdAndUpdate(activity._id, { state: 'completo' });
                } else {
                    // Cambiar el estado de la actividad a "plazas disponibles"
                    await Activity.findByIdAndUpdate(activity._id, { state: 'plazas disponibles' });
                }
            }
        }

    } catch (error) {
        handleHttpError(res, "ERROR_CHECKING_STATUS", 403);
        console.log(error);
    }
};


const createReservations = async (sessions, newActivityId, res) => {
    try {
        const reservations = [];

        for (let i = 0; i < sessions.length; i++) {
            const {
                date,
                time_slot,
            } = sessions[i];

            const isoDate = moment(date, "DD/MM/YYYY").toISOString();

            const newReservation = new Reservation({
                date: isoDate,
                time_slot,
                classroom_id: "pending",
                activity_id: newActivityId
            });

            const savedReservation = await newReservation.save();
            if (!savedReservation) {
                handleHttpError(res, "ERROR CREATING RESERVATION", 403);
            }

        }

        return reservations;
    } catch (error) {
        console.log(error);
        handleHttpError(res, "ERROR CREATING RESERVATION", 403);
    }
};
     

const updateReservation = async (req, res) => {

    // Comprobamos el estado de las actividades para actualizarlas en caso de que sea necesario
    await checkStatus();

    try {
        const id_reservation = req.params.id;
        const {
            date,
            time_slot,
        } = req.body;

        const nickname = req.user.nickname;
        
        const reservation = await Reservation.findById(id_reservation);
        const activityId = reservation.activity_id;

        // Buscar la actividad correspondiente
        const activity = await Activity.findById(activityId);
        const isAdmin = activity.admins.includes(nickname);

        if (!isAdmin) {
            return res.status(403).json({ error: 'You are not authorized to update this reservation' });
        }

        const updateFields = {};
        if (date && date !== undefined) {
            const isoDate = moment(date, "DD/MM/YYYY").toISOString();
            updateFields.date = isoDate;
        }
        if (time_slot && time_slot !== undefined) {
            updateFields.time_slot = time_slot;
        }

        const updatedReservation = await Reservation.findByIdAndUpdate(id_reservation, updateFields, { new: true });
        if (!updatedReservation) {
            handleHttpError(res, "ERROR UPDATING RESERVATION", 403);
        }

        if(req.user.role === "admin"){
            createModification("RESERVA ACTUALIZADA", req.user._id, updatedReservation._id);
        }

         // Enviar notificaciones por correo electrónico a los usuarios inscritos en la actividad
         const subject = `Reserva actualizada en ${activity.title}`;
         const message = `La reserva en la actividad "${activity.title}" ha sido actualizada. Por favor, revisa los detalles de la actividad.`;

         for (const user of activity.users) {
            const userData = await User.findOne({ nickname: user.username });
            if (userData.receiveNotifications) {
                await sendEmailNotification(userData.email, subject, message);
            }
            createNotification(subject, message, userData._id);
        }

        // Encontrar usuarios posibles que no están asignados a la actividad y enviar notificaciones
        if (activity.type === "open") {
            const usersPossible = await User.find({
                instruments: { $in: activity.instruments },
                _id: { $nin: activity.users.map(user => user._id) } // Excluir usuarios ya inscritos en la actividad
            });

            if (usersPossible.length === 0) {
                console.log("No possible users found");
            } else {
                for (const user of usersPossible) {
                    // Verificar disponibilidad en el horario de la actividad
                    const dayOfWeek = moment(date, "DD/MM/YYYY").format('dddd').toLowerCase();
                    const timeSlot = time_slot;
    
                    if (user.availabilitySchedule[dayOfWeek].includes(timeSlot)) {
                        const subject = `Nueva oportunidad de reserva en ${activity.title}`;
                        const message = `Se ha actualizado una reserva en la actividad "${activity.title}". ¡Hay una nueva oportunidad de reserva disponible! Por favor, revisa los detalles de la actividad.`;
                        if(user.receiveNotifications){
                            await sendEmailNotification(user.email, subject, message);
                        }
                        createNotification(subject, message, user._id);
                    }
                }
            }
        }
        
        res.status(200).json(updatedReservation);
    }
    catch (error) {
        console.log(error);
        handleHttpError(res, "ERROR UPDATING RESERVATION", 403);
    }
}

const deleteReservation = async (req, res) => {

    // Comprobamos el estado de las actividades para actualizarlas en caso de que sea necesario
    await checkStatus();


    try {
        const id = req.params.id;
        const nickname = req.user.nickname;
        
        const reservation = await Reservation.findById(id);
        const activityId = reservation.activity_id;

        // Buscar la actividad correspondiente
        const activity = await Activity.findById(activityId);
        const isAdmin = activity.admins.includes(nickname);

        if (!isAdmin) {
            return res.status(403).json({ error: 'You are not authorized to delete this reservation' });
        }

        // Comprobar si la actividad es recurrente
        if (!activity.recurrent) {
            return res.status(400).json({ error: 'Cannot delete a reservation from a non-recurrent activity' });
        }

        // Comprobar si hay 2 o más reservas
        const reservationsCount = await Reservation.countDocuments({ activity_id: activityId });
        if (reservationsCount < 2) {
            return res.status(400).json({ error: 'Cannot delete a reservation when there is only one reservation for the activity' });
        }

        const deletedReservation = await Reservation.findByIdAndDelete(id);
        if (!reservation) {
            handleHttpError(res, "ERROR DELETING RESERVATION", 403);
        }

        if(req.user.role === "admin"){
            createModification("RESERVA ELIMINADA", req.user._id, deletedReservation._id);
        }

        // Enviar notificaciones por correo electrónico a los usuarios inscritos en la actividad
        for (const user of activity.users) {
            const userData = await User.findOne({ nickname: user.username });
            const subject = `Reserva eliminada de ${activity.title}`;
            const message = `La reserva en la actividad "${activity.title}" ha sido eliminada. Por favor, revisa los detalles de la actividad.`;
        
            if(userData.receiveNotifications){
                await sendEmailNotification(userData.email, subject, message);
            }
            createNotification(subject, message, userData._id);
        }

        res.status(200).json({ success: true, message: 'Reservation deleted successfully' });
        res.status(200).json(deletedReservation);
    }
    catch (error) {
        handleHttpError(res, "ERROR DELETING RESERVATION", 403);
    }
};

const addReservation = async (req, res) => {

    // Comprobamos el estado de las actividades para actualizarlas en caso de que sea necesario
    await checkStatus();


    try {
        const activity_id = req.params.id;
        const {
            date,
            time_slot,
        } = req.body;

        const nickname = req.user.nickname;
        const isAdmin = await Activity.exists({ admins: nickname });
        if (!isAdmin) {
            return res.status(403).json({ error: 'You are not authorized to add a reservation to this activity' });
        }

        // Buscar la actividad por su ID
        const activity = await Activity.findById(activity_id);
        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        // Comprobar si la actividad es recurrente
        if (!activity.recurrent) {
            return res.status(400).json({ error: 'Cannot add a reservation to a non-recurrent activity' });
        }

        const isoDate = moment(date, "DD/MM/YYYY").toISOString();

        const newReservation = new Reservation({
            date: isoDate,
            time_slot,
            classroom_id: "pending",
            activity_id: activity_id
        });

        const addedReservation = await newReservation.save();
        if (!addedReservation) {
            handleHttpError(res, "ERROR ADDING RESERVATION TO ACTIVITY", 403);
        }

        if(req.user.role === "admin"){
            createModification("RESERVA AÑADIDA", req.user._id, addedReservation._id);
        }

        // Enviar notificaciones por correo electrónico según el tipo de actividad
    
        // Enviar correo a los usuarios inscritos en la actividad y con  notificaciones activadas
        for (const user of activity.users) {
            const userData = await User.findOne({ nickname : user.username });
            const subject = `Reserva añadida a ${activity.title}`;
                const message = `Se ha añadido una reserva a la actividad "${activity.title}" en la fecha ${date} y hora ${time_slot}.`;
            if (userData.receiveNotifications) {
                await sendEmailNotification(userData.email, subject, message);
            }
            createNotification(subject, message, userData._id);
        }
        if (activity.type === "open") {
            // Enviar correo a los usuarios que tengan instrumentos coincidentes y notificaciones activadas
            const usersMatchingActivity = await User.find({
                instruments: { $in: activity.instruments },
                _id: { $nin: activity.users.map(user => user._id) } // Excluir usuarios ya inscritos en la actividad
            });

            if (usersMatchingActivity.length === 0) {
                console.log("No users matching activity criteria found");
            } else {
                // Si existen usuarios, enviar correos electrónicos
                for (const user of usersMatchingActivity) {
                    const userAvailability = user.availabilitySchedule;
                    const dayOfWeek = moment(date, "DD/MM/YYYY").format('dddd').toLowerCase();
                    const timeSlot = time_slot;
        
                    // Verificar si el usuario está disponible en el horario de la reserva
                    if (userAvailability[dayOfWeek].includes(timeSlot)) {
                        const subject = `Reserva añadida a actividad abierta "${activity.title}"`;
                        const message = `Se ha añadido una reserva que te puede interesar a la actividad abierta "${activity.title}" en la fecha ${date} y hora ${time_slot}.`;
                        if(user.receiveNotifications){
                            await sendEmailNotification(user.email, subject, message);
                        }
                        createNotification(subject, message, user._id);
                    }
                }
            }
        }

        res.status(200).json(addedReservation);
    }
    catch (error) {
        handleHttpError(res, "ERROR ADDING RESERVATION TO ACTIVITY", 403);
    }
};


const getAllReservationsFromActivity = async (req, res) => {

    // Comprobamos el estado de las actividades para actualizarlas en caso de que sea necesario
    await checkStatus();


    try {
        const id = req.params.id; // Obtener el ID de la actividad de los parámetros de la ruta
        const nickname = req.user.nickname;

        // Buscar la actividad correspondiente
        const activity = await Activity.findById(id);
        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        // Comprobar si el usuario es miembro o administrador de la actividad
        const isMemberOrAdmin = activity.users.includes(nickname) || activity.admins.includes(nickname);
        if (!isMemberOrAdmin) {
            return res.status(403).json({ error: 'You are not a member or admin of this activity' });
        }

        // Buscar todas las reservas que tengan el ID de actividad
        let reservations = await Reservation.find({ activity_id: id }).sort({ date: 1 });

        // Cambiar el formato de la fecha y añadir el día de la semana en cada reserva
        reservations = reservations.map(reservation => {
            const reservationObject = reservation.toObject();
            reservationObject.date = moment(reservation.date).format('DD/MM/YYYY');
            reservationObject.day = moment(reservation.date).format('dddd');
            return reservationObject;
        });

        // Devolver las reservas
        res.status(200).json(reservations);
    } catch (error) {
        res.status(500).json({ error: 'Error getting reservations' });
    }
};

//funcion para enviar email de notificacion
const sendEmailNotification = async (toEmail,type, message) => {
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
            from: 'poner email o de la uni o del admin del sistema',
            to: toEmail,
            subject:  type,
            text: message
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

// coger todas las reservas dónde un usuario es admin

const getReservationsFromAdmin = async (req, res) => {
    try {
        const nickname = req.user.nickname;

        // Buscar todas las actividades donde el usuario es administrador
        const activities = await Activity.find({ admins: nickname }).sort({ createdAt: -1 });

        // Buscamos las reservas de cada actividad
        const activityReservations = [];
        for (const activity of activities) {
            const reservations = await Reservation.find({ activity_id: activity._id }).sort({ date: 1 });
            activityReservations.push({ activityName: activity.title, reservations });
        }

        res.status(200).json(activityReservations);
    } catch (error) {
        console.error("Error al obtener reservaciones:", error);
        res.status(500).json({ error: 'Error getting reservations' });
    }
}

//Reservar aula para una reserva (recibe el id de la reserva,numero del aula, string con el edificio,fecha y franaj horaria)

const reserveClassroom = async (req, res) => {
    try {
        const id = req.params.id;
        const { classroomNumber, building, date, time_slot, extra} = req.body;
        const nickname = req.user.nickname;
        const email = req.user.email;

        const reservation = await Reservation.findById(id);
        const activityId = reservation.activity_id;

        // Buscar la actividad correspondiente
        const activity = await Activity.findById(activityId);
        const isAdmin = activity.admins.includes(nickname);

        if (!isAdmin) {
            return res.status(403).json({ error: 'You are not authorized to reserve a classroom for this reservation' });
        }

        // **** UPDATE RESERVATION ****
        const updateFields = {};
        if (date !== undefined) {
            const isoDate = moment(date, "DD/MM/YYYY").toISOString();
            if(isoDate !== reservation.date){
                updateFields.date = isoDate;
            }
        }

        if (time_slot !== undefined && time_slot !== reservation.time_slot) {
            updateFields.time_slot = time_slot;
        }

        updateFields.classroom_id = "Pendiente de confirmación";
        const updatedReservation = await Reservation.findByIdAndUpdate(id, updateFields, { new: true });

        if (!updatedReservation) {
            handleHttpError(res, "ERROR UPDATING RESERVATION", 403);
        }

        if(req.user.role === "admin"){
            createModification("RESERVA ACTUALIZADA", req.user._id, updatedReservation._id);
        }

        // Si se han actualizado el campo 'date' o 'time_slot'
        if ('date' in updateFields || 'time_slot' in updateFields) {
            const subject = `Reserva actualizada en ${activity.title}`;
            const message = `La reserva en la actividad "${activity.title}" ha sido actualizada. Por favor, revisa los detalles de la actividad.`;

            // Notificar a los usuarios de la actividad
            for (const user of activity.users) {
                const userData = await User.findOne({ nickname: user.username });
                if (userData.receiveNotifications) {
                    await sendEmailNotification(userData.email, subject, message);
                }
                createNotification(subject, message, userData._id);
            }

            // Encontrar usuarios posibles que no están asignados a la actividad y enviar notificaciones
            if (activity.type === "open") {
                const usersPossible = await User.find({
                    instruments: { $in: activity.instruments },
                    _id: { $nin: activity.users.map(user => user._id) } // Excluir usuarios ya inscritos en la actividad
                });

                if (usersPossible.length === 0) {
                    console.log("No possible users found");
                } else {
                    for (const user of usersPossible) {
                        // Verificar disponibilidad en el horario de la actividad
                        const dayOfWeek = moment(date, "DD/MM/YYYY").format('dddd').toLowerCase();
                        const timeSlot = time_slot;
        
                        if (user.availabilitySchedule[dayOfWeek].includes(timeSlot)) {
                            const subject = `Nueva oportunidad de reserva en ${activity.title}`;
                            const message = `Se ha actualizado una reserva en la actividad "${activity.title}". ¡Hay una nueva oportunidad de reserva disponible! Por favor, revisa los detalles de la actividad.`;
                            if(user.receiveNotifications){
                                await sendEmailNotification(user.email, subject, message);
                            }
                            createNotification(subject, message, user._id);
                        }
                    }
                }
            }
        }
        // **** FIN DE UPDATE ****

        //creamos un token para enviar a la secretaria
        const emailSecretaria = EMAIL_SECRETARIA;
        token = await tokenUtad(emailSecretaria)

        // Enviamos por correo a secretaria utad para preguntarle si es posible reservar el aula
        const subject = `${email} quiere reservar un aula`;
        let message = `El usuario ${email} quiere reservar el aula ${classroomNumber} del edificio ${building} para la actividad ${activity.title} en la fecha ${date} y franja horaria ${time_slot}.`;
        if(extra){
            message += ` Comentario adicional: ${extra}`;
        }
        message += `\n\nPara confirmar la reserva, haga clic en el siguiente enlace: http://localhost:5000/confirmar-reserva?token=${token}&id=${id}&classroomNumber=${classroomNumber}&building=${building}&email=${email}&activity=${activity.title.replace(" ", "%20")}&date=${date}&timeSlot=${time_slot}`;

        await sendEmailNotification(emailSecretaria, subject, message);

        res.status(200).json(updatedReservation);
    }
    catch (error) {
        console.log(error);
        handleHttpError(res, "ERROR RESERVIN CLASSROOM", 403);
    }
}

// funcion para aceptar o rechazar la reserva del aula
const acceptOrRejectClassroom = async (req, res) => {
    try {
        const id = req.params.id;
        const { accept, classroomNumber, building} = req.body;

        const reservation = await Reservation.findById(id);
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        const activityId = reservation.activity_id;

        // Buscar la actividad correspondiente
        const activity = await Activity.findById(activityId);

        if (accept) {
            // Aceptar la reserva
            const updatedReservation = await Reservation.findByIdAndUpdate(id, { classroom_id: `${building}+${classroomNumber}` }, { new: true });
            if (!updatedReservation) {
                handleHttpError(res, "ERROR UPDATING RESERVATION", 403);
            }
            
            const subject = `Reserva aceptada en ${activity.title}`;
            const message = `La reserva en la actividad "${activity.title}" ha sido aceptada. Por favor, revisa los detalles de la actividad.`;
            
            //avisamos a los admins de la actividad
            for (const admin of activity.admins) {
                const adminData = await User.findOne({ nickname : admin });
                if (adminData.receiveNotifications) {
                    await sendEmailNotification(adminData.email, subject, message);
                }
                createNotification(subject, message, adminData._id);
            }

            //ahora avisamos a los usarios de la actividad comprobando que no estan en la lista de admins
            for (const user of activity.users) {
                if (!activity.admins.includes(user.username)) {
                    const userData = await User.findOne({ nickname: user.username });
                    if (userData.receiveNotifications) {
                        await sendEmailNotification(userData.email, subject, message);
                    }
                    createNotification(subject, message, userData._id);
                }
            }

            res.status(200).json(updatedReservation);
        } else {
            // Rechazar la reserva
            const updatedReservation = await Reservation.findByIdAndUpdate(id, { classroom_id: "Aula no disponible" }, { new: true });
            if (!updatedReservation) {
                handleHttpError(res, "ERROR UPDATING RESERVATION", 403);
            }

            const subject = `Reserva rechazada en ${activity.title}`;
            const message = `Tu reserva en la actividad "${activity.title}" ha sido rechazada. Por favor, revisa los detalles de la actividad.`;
            
            for (const admin of activity.admins) {
                const adminData = await User.findOne({ nickname: admin });
                if (adminData.receiveNotifications) {
                    await sendEmailNotification(adminData.email, subject, message);
                }
                createNotification(subject, message, adminData._id);
            }
            res.status(200).json(updatedReservation);
        }

        
    }
    catch (error) {
        console.log(error);
        handleHttpError(res, "ERROR ACCEPTING OR REJECTING CLASSROOM RESERVATION", 403);
    }
}

module.exports = {createReservations, updateReservation, deleteReservation, addReservation, getAllReservationsFromActivity,getReservationsFromAdmin,reserveClassroom,acceptOrRejectClassroom};