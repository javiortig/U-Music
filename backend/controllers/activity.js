const Activity = require('../models/activity');
const Reservation = require('../models/reservation');
const User = require('../models/user');
const {handleHttpError} = require('../utils/handleHttpError');
const {createReservations} = require('./reservations');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const APP_KEY = process.env.APP_KEY;
const EMAIL = process.env.EMAIL;
const moment = require('moment');
const { createModification } = require('./modifications');
const {createNotification} = require('./notifications');



// Se crea una actividad
const createActivity = async (req, res) => {
    try {

        // Comprobamos el estado de las actividades para actualizarlas en caso de que sea necesario
        await checkStatus();

        const {
            title,
            description,
            total_places,
            type,
            genre,
            recurrent,
            users,
            instruments,
            sessions

        } = req.body;
        
        const nickname = req.user.nickname;

        // SI ES UNA ACTIVIDAD ABIERTA
        if (type === "open"){

            available_places = total_places  // De primeras las plazas disponibles van a ser el total de plazas 
            // Si la actividad es creada por un admin del sistema no se le mete en usuarios
            if (req.user.role !== "admin") {
                users.push({ username: nickname, instrument: "creator" });
                available_places = available_places - 1; // Se agrega el usuario creador al array y se reduce el número de plazas disponibles
            }            

            admins = [nickname]
            state = "plazas disponibles"

        }else if (type === "closed"){
            // Busca si todos los usuarios añadidos a la actividad existen en la base de datos
            const userUsernames = users.map(user => user.username);
            const usersInDb = await User.find({ nickname: { $in: userUsernames } });

            if (usersInDb.length !== userUsernames.length) {
                return res.status(404).json({ error: 'Some usernames are not valid' }); // Hay algún username que no existe o se ha ingresado incorrectamente
            } else{
                admins = [nickname]
                if (req.user.role !== "admin"){
                    users.push({ username: nickname, instrument: "creator" });
                }
                available_places = total_places - users.length 
                if (available_places > 0){
                    state = "plazas disponibles"
                }else{
                    state = "completo"
                }
            }

        }

        // Obtener la lista de imágenes disponibles
        const imageFolder = path.join(__dirname, '../storage/ImgsMusicaP3');
        const imageFiles = fs.readdirSync(imageFolder);
         
        // Seleccionar una imagen aleatoria
        const randomImg = imageFiles[Math.floor(Math.random() * imageFiles.length)];
        
        const imageUrl = 'http://localhost:3000/storage/ImgsMusicaP3/' + randomImg;
         

        const body = {
            title,
            description,
            total_places,
            type,
            genre,
            admins,
            recurrent,
            users,
            instruments,
            available_places,
            state,
            image: imageUrl
        };
        
        const newActivity = await Activity.create(body);

        if(req.user.role === "admin"){
            createModification("ACTIVIDAD CREADA", req.user._id, newActivity._id);
        }
        // MANEJAR RESERVAS DE ACTIVIDADES--------------------------------
       
        // Obtener el _id de la nueva actividad
        const newActivityId = newActivity._id;

        // Pasar el _id a la función createReservations
        const reservations = await createReservations(sessions, newActivityId, res);

        if (!reservations) {
            return res.status(400).json({ error: 'Error creating reservations' });
        }
        //notificamos primero al creador 
        const subjectCreator = `Se ha creado correctamente la actividad ${title}`;
        const messageCreator = `¡Hola ${nickname}!\n\nSe ha creado correctamente la actividad ${title}.\n\nDetalles de la actividad:\nDescripción: ${description}\nGénero: ${genre}\nInstrumentos: ${instruments.join(', ')}\nPlazas totales: ${total_places}\n\nSaludos,\nEquipo de la plataforma`;

        createNotification(subjectCreator,messageCreator,req.user._id );
        if (req.user.receiveNotifications) {
            await sendEmailNotification(req.user.email, subjectCreator, messageCreator);    
        }
        // Notificar a los usuarios por correo electrónico
        const subject = `Invitación de ${nickname} a ${title}`;
        const message = `¡Hola!\n\n${nickname} te ha invitado a participar en una actividad privada titulada "${title}".\n\nDetalles de la actividad:\nDescripción: ${description}\nGénero: ${genre}\nInstrumentos: ${instruments.join(', ')}\nPlazas totales: ${total_places}\n\nEsperamos contar contigo!\n\nSaludos,\nEquipo de la plataforma`;

        if(type === "closed"){
            //Enviamos email a todos los miembros invitados a la actividad 
            const userUsernames = users.map(user => user.username);
            const usersInDb = await User.find({ nickname: { $in: userUsernames } });

            for (const user of usersInDb) {
                //comprobamos si el usuario es el creador de la actividad
                if (user.nickname === nickname){
                    continue;
                }
                createNotification(subject, message, user._id);
                if (user.receiveNotifications) {
                    await sendEmailNotification(user.email, subject, message);    
                }
            }
        }else{
            //Si la actividad es open, se le envia el email a los usuarios que hagan match con la actividad 
            // Encontramos usuarios con al menos un instrumento en común y que tengan notificaciones activadas
            const usersMatchingActivity = await User.find({
                instruments: { $in: instruments }
            });

            if (usersMatchingActivity.length === 0) {
                console.log("No users matching activity criteria found");
            } else {
                // Iterar sobre los usuarios que hacen match con el availabilitySchedule de la actividad
                for (const user of usersMatchingActivity) {
                    if (user.nickname === nickname) {
                        continue; // Saltar al siguiente ciclo del bucle
                    }
                    const userAvailability = user.availabilitySchedule;
                    const userNickname = user.nickname;

                    // Iterar sobre las sesiones de la actividad
                    for (const session of sessions) {
                        const dateObject = moment(session.date, "DD/MM/YYYY");
                        const dayOfWeek = dateObject.format('dddd').toLowerCase();
                        const timeSlot = session.time_slot;
                        const availabilitySlots = userAvailability[dayOfWeek];
                        
                        // Comprobar si el usuario está disponible en el día y hora de la sesión
                        if (availabilitySlots.includes && availabilitySlots.includes(timeSlot)) {
                            // Send email notification
                            const subject = `Invitación de ${nickname} a ${title}`;
                            const message = `¡Hola ${userNickname}!\n\n${nickname} ha creado una actividad abierta titulada "${title} que es ideal para ti! ".\n\nDetalles de la actividad:\nDescripción: ${description}\nGénero: ${genre}\nInstrumentos: ${instruments.join(', ')}\nFecha: ${session.date}\nHora: ${session.time_slot}\n\nEsperamos contar contigo!\n\nSaludos,\nEquipo de la plataforma`;
            
                            if (user.receiveNotifications) {
                                await sendEmailNotification(user.email, subject, message);    
                            }
                            createNotification(subject, message, user._id);
                        }
                    }
                }
            }
        }
        
                
        res.status(201).json({ activity: newActivity });    
    }

    catch (error) {
        console.log(error);
        handleHttpError(res, "ERROR_CREATING_ACTIVITY", 403);
        
    }
}


// actividades no completas y no terminadas , publicas , ordenadas por fecha
const getActivities = async (req, res) => {

    try {
        // Comprobamos el estado de las actividades para actualizarlas en caso de que sea necesario
        await checkStatus();

        const activities = await Activity.find({ state: { $nin: ['completo', 'terminado'] }, type: 'open' }).sort({ createdAt: -1 });
        res.status(200).json(activities);
    } catch (error) {
        console.log(error);
        handleHttpError(res, "ERROR_GETTING_ACTIVITIES", 500);
    }
};


const getActivity = async (req, res) => {
    try {
        // Comprobamos el estado de las actividades para actualizarlas en caso de que sea necesario
        await checkStatus();

        const { id } = req.params;
        
        const activity = await Activity.findById(id);
        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        // Buscar todas las reservas que tengan el ID de actividad y cuya fecha sea mayor que la fecha actual
        const reservations = await Reservation.find({ 
            activity_id: id,
            date: { $gt: new Date() }
        }).sort({ date: 1 }); // Ordenar por fecha en orden ascendente

        // Convertir 'activity' en un objeto JavaScript normal
        const activityObject = activity.toObject();

        if (req.user.role === 'admin' || activityObject.admins.includes(req.user.nickname)) {
            activityObject.admin = true;
            activityObject.member = false;
        } else if (activityObject.users.find(user => user.username === req.user.nickname)) {
            activityObject.admin = false;
            activityObject.member = true;
        } else {
            activityObject.admin = false;
            activityObject.member = false;
        }

        // Si hay reservas próximas, seleccionar la primera reserva (la más próxima en el futuro)
        if (reservations.length > 0) {
            const reservation = reservations[0];

            // Convertir la fecha de la reserva a una cadena en el formato "dd/mm/yyyy"
            const dateString = moment(reservation.date).format('DD/MM/YYYY');

            // Obtener el día de la semana de la fecha de la reserva
            const dayOfWeek = moment(reservation.date).format('dddd');

            // Añadir los campos 'dateString' y 'dayOfWeek' a la reserva
            const nextReservation = reservation.toObject();
            nextReservation.date = dateString;
            nextReservation.day = dayOfWeek;

            activityObject.nextReservation = nextReservation;
        }

        // Devolver la actividad y la próxima reserva
        res.status(200).json({ activity: activityObject});
    } catch (error) {
        console.log(error)
        handleHttpError(res, "ERROR_GETTING_ACTIVITY", 500);
    }
};




// Muestra las actividades que se han creado por el admin del sistema ordenadas por fecha mas reciente
const getImportantActivities = async (req, res) => {

    try {
        // Comprobamos el estado de las actividades para actualizarlas en caso de que sea necesario
        await checkStatus();

        // Obtener todos los usuarios con el rol de 'admin'
        const adminUsers = await User.find({ role: 'admin' });

        // Extraer los nicknames de los usuarios admin
        const adminNicknames = adminUsers.map(user => user.nickname);

        // Buscar todas las actividades cuyos 'admins' estén en la lista de usuarios admin
        const activities = await Activity.find({ admins: { $in: adminNicknames } }).sort({ createdAt: -1 });

        res.status(200).json(activities);
    } catch (error) {
        handleHttpError(res, "ERROR_GETTING_IMPORTANT_ACTIVITIES", 500);
    }
};

// Muestra las actividades en las que el propio usuario está apuntado (pero no es admin) ordenadas por fecha mas reciente
const getMyActivitiesProfile = async (req, res) => {

    try {
        // Comprobamos el estado de las actividades para actualizarlas en caso de que sea necesario
        await checkStatus();

        // Obtener el nickname del usuario de la solicitud
        const nickname = req.user.nickname;

        // Buscar todas las actividades cuyo array 'users' contenga un objeto con el nickname del usuario
        // y el array 'admins' no contenga el nickname del usuario
        const activities = await Activity.find({ 
            'users.username': nickname,
            'admins': { $ne: nickname }
        }).sort({ createdAt: -1 });

        res.status(200).json(activities);
    } catch (error) {
        console.log(error);
        handleHttpError(res, "ERROR_GETTING_MY_ACTIVITIES_PROFILE", 500);
    }
};


// Editar actividad por id 
const updateActivity = async (req, res) => {

    try {
        // Comprobamos el estado de las actividades para actualizarlas en caso de que sea necesario
        await checkStatus();

        const id = req.params.id;
        const {title, description, users, total_places, type, genre, instruments, admins} = req.body;

        const nickname = req.user.nickname;

        const activity = await Activity.findById(id);

        const isAdmin = await Activity.exists({ _id: id, admins: nickname });
        if (!isAdmin) {
            return res.status(403).json({ error: 'You are not authorized to update this activity' });
        }

        //show admins of activity
        const updateFields = {};

        
        //Se reemplaza el total de plazas, se actualiza el available places y el estado de la actividad
        if (total_places && total_places !== undefined) {
            // Calcular el nuevo available_places
            const newavailable_places = total_places - activity.users.length;
        
            // Si newavailable_places es < 0, hay demasiados usuarios en la actividad
            if (newavailable_places < 0) {
                return res.status(400).json({ error: 'Not possible to change total places to this number, too many users' });
            }
        
            // Actualizar total_places y available_places
            updateFields.total_places = total_places;
            updateFields.available_places = newavailable_places;
        
            // Cambiar el estado de la actividad en función de newavailable_places
            if (newavailable_places === 0) {
                updateFields.state = 'completo';
            } else {
                updateFields.state = 'plazas disponibles';
            }
        }

        //Si la actividad es cerrada, se pueden añadir o quitar usuarios
        if (activity.type === 'closed') {
            if(users && users!==undefined){
                // Comprobar que todos los nicknames existen
                for (let i = 0; i < users.length; i++) {
                    const usersExist = await User.findOne({ nickname: users[i].username });
                    if (!usersExist) {
                        return res.status(404).json({ error: `User with nickname ${users[i].username} not found` });
                    }
                }

                // Comprobar si hay suficientes plazas para todos los usuarios
                if (users.length > activity.total_places) {
                    return res.status(400).json({ error: 'Not enough places for all users' });
                }

                updateFields.users = users;

                // Calcular el nuevo available_places
                const newavailable_places = activity.total_places - users.length;

                // Actualizar available_places
                updateFields.available_places = newavailable_places;

                // Cambiar el estado de la actividad en función de newavailable_places
                if (newavailable_places === 0) {
                    updateFields.state = 'completo';
                } else {
                    updateFields.state = 'plazas disponibles';
                }
            }
        }

        //Se reemplaza el titulo
        if (title && title !== undefined) {
            updateFields.title = title;
        }

        //Se reemplaza la description
        if (description && description !== undefined) {
            updateFields.description = description;
        }

        //Se reemplaza el tipo de la actividad
        if (type !== undefined) {
            updateFields.type = type;
        }

        //Se reemplaza el genero de la actividad
        if (genre !== undefined) {
            updateFields.genre = genre;
        }

        //Se reemplazan los admins de la actividad
        if (admins !== undefined) {
            // Comprobar que todos los nicknames existen y son parte de la actividad
            for (let i = 0; i < admins.length; i++) {
                const admin = await User.findOne({ nickname: admins[i] });
                if (!admin) {
                    return res.status(404).json({ error: `Admin with nickname ${admins[i]} not found` });
                }
                if (!activity.users.map(user => user.username).includes(admins[i])) {
                    return res.status(400).json({ error: `Admin with nickname ${admins[i]} is not part of the activity` });
                }
            }
            updateFields.admins = admins;
        }

        //Se reemplanzan los instrumentos de la actividad
        if(instruments && instruments.length != undefined) {
            updateFields.instruments = instruments;
        }

        const updatedActivity = await Activity.findByIdAndUpdate(id, updateFields, { new: true });

        if (!updatedActivity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        if(req.user.role === "admin"){
            createModification("ACTIVIDAD ACTUALIZADA", req.user._id, updatedActivity._id);
        }


        // Notifica a los miembros de la actividad sobre los cambios por correo electrónico
        const subject = `Cambios en la actividad: ${updatedActivity.title}`;
        const message = `Hola,\n\nLa actividad "${updatedActivity.title}" ha sido actualizada. Los cambios son los siguientes:\n\n- Título: ${updatedActivity.title}\n- Descripción: ${updatedActivity.description}\n- ...`;
        for (const user of updatedActivity.users) {
            const userInDb = await User.findOne({ nickname: user.username });
            if (userInDb) {
                if ( userInDb.receiveNotifications) {
                    await sendEmailNotification(userInDb.email, subject, message);    
                }
                createNotification(subject, message, userInDb._id);
            }
        }

        res.status(200).json(updatedActivity);

    }catch (error) {
        console.log(error);
        handleHttpError(res, "ERROR_UPDATING_ACTIVITY", 500);
    }
};

// Borra una actividad por id 
const deleteActivity = async (req, res) => {

    try {
        // Comprobamos el estado de las actividades para actualizarlas en caso de que sea necesario
        await checkStatus();

        const id = req.params.id;
    
        const nickname = req.user.nickname;
      
        const activity = await Activity.findById(id)
        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }
      
        const isAdmin = await Activity.exists({ _id: id, admins: nickname });
        if (!isAdmin) {
            return res.status(403).json({ error: 'You are not authorized to delete this activity' });
        }
        const deletedActivity = await Activity.findByIdAndDelete(id);
        if (!deletedActivity) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        if(req.user.role === "admin"){
            createModification("ACTIVIDAD ELIMINADA", req.user._id, deletedActivity._id);
        }
        
        // Enviar notificaciones por correo electrónico a los usuarios que admiten notificaciones
        const usersToNotify = [nickname, ...activity.users]; 
        const subject = 'Actividad eliminada';
        const message = `La actividad "${deletedActivity.title}" ha sido eliminada.`;
        for (const user of usersToNotify) {
            const userData = await User.findOne({ nickname: user.username });

            if (userData) {
                if(userData.receiveNotifications){
                    await sendEmailNotification(userData.email, subject, message);
                }
                createNotification(subject, message, userData._id);
            }
        }

        res.status(200).json({ success: true, message: 'Activity deleted successfully' });
    } catch (error) {
        console.log(error);
        handleHttpError(res, "ERROR_DELETING_ACTIVITY", 500);
    }
};


// Muestra las actividades creadas por el propio usuario ordenadas por fecha reciente
const getCreatedActivitiesProfile = async (req, res) => {

    try {
        // Comprobamos el estado de las actividades para actualizarlas en caso de que sea necesario
        await checkStatus();

        const nickname = req.user.nickname;

        const activities = await Activity.find({ admins: nickname }).sort({ createdAt: -1 });
        
        res.status(200).json(activities);
    } catch (error) {
        console.log(error);
        handleHttpError(res, "ERROR_GETTING_ACTIVITIES_BY_ADMIN", 500);
    }
};

// Muestra las actividades que cumplan con los filtros especificados OPEN ORDENADO POR FECHA RECIENTE
const getFilteredActivities = async (req, res) => {

    try {
        // Comprobamos el estado de las actividades para actualizarlas en caso de que sea necesario
        await checkStatus();

        const state = req.query.state;
        const instrument = req.query.instruments;
        const genre = req.query.genre;
        const creator = req.query.creator;
        const title = req.query.title;
        const date = req.query.date;
        const time = req.query.time;
        const sortedby = req.query.sortedby;

        let query = { type: 'open' }

        if (state){
            query.state = state;
        
        }else{
            query.state = "plazas disponibles"
        }

        if (instrument){
            query.instruments = { $in: instrument.split(',') };
        } 

        if (genre) query.genre = { $all: genre.split(',') };

        if (creator) query.admins = creator;
        
        if (title) query.title = { $regex: title, $options: 'i' };

        const sortQuery = {};

        if (sortedby){
            if (sortedby === "AZ"){
                sortQuery.title = 1; // Ordenar por título en orden ascendente
            }else if (sortedby === "ZA"){
                sortQuery.title = -1; // Ordenar por título en orden descendente
            }else if (sortedby === "recent"){
                sortQuery.createdAt = -1; // Ordenar por fecha de creación en orden descendente (más reciente primero)
            }else if (sortedby === "oldest"){
                sortQuery.createdAt = 1; // Ordenar por fecha de creación en orden ascendente (más antiguo primero)
            }
        }

        const activities = await Activity.find(query).sort(sortQuery);

        const returnActivities = [];

        if (!date || !time){
            return res.status(200).json(activities);
        }

        for (const activity of activities) {
            const reservations = await Reservation.find({ activity_id: activity._id });
            // Comprobar si reservations es null o está vacío
            if (!reservations || reservations.length === 0) {
                continue; // Saltar al siguiente ciclo del bucle
            }   

            if (date){
                for (const reservation of reservations) {
                    const dayOfWeek = moment(reservation.date).format('dddd').toLowerCase();
                    if (dayOfWeek === date) {
                        returnActivities.push(activity);
                    }
                }
            }
            if (time){
                for (const reservation of reservations) {
                    const time_slot = reservation.time_slot;
                    if (time_slot === time) {
                        returnActivities.push(activity);
                    }
                }
            }
        }

        

        res.status(200).json(returnActivities);
    } catch (error) {
        console.log(error)
        handleHttpError(res, "ERROR_GETTING_FILTERED_ACTIVITIES", 500);
    }
};

//Funcion para cuando usuario se une a actividad
const addUserToActivity = async (req, res) => {

    try {
        // Comprobamos el estado de las actividades para actualizarlas en caso de que sea necesario
        await checkStatus();

        const id = req.params.id;
        const user_id  = req.user._id;
        const nickname = req.user.nickname
        const instrument = req.body.instrument;

        const activity = await Activity.findById(id);
        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        if (activity.users.map(user => user.username).includes(nickname)) {
            return res.status(400).json({ error: 'User already joined the activity' });
        }
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Restar uno de available_places
        activity.available_places -= 1;

        // Si available_places es 0, cambiar el estado a 'completo'
        if (activity.available_places === 0) {
            activity.state = 'completo';
        }

        // Añadir el usuario y su instrumento a la actividad y guardar los cambios
        activity.users.push({ username: nickname, instrument: instrument });
        const updatedActivity = await activity.save();
        //avisamos al usuario que se ha unido a la actividad
        const subjectUser = `Te has unido a la actividad ${updatedActivity.title}`;
        const messageUser = `¡Hola ${nickname}!\n\nTe has unido a la actividad ${updatedActivity.title} con el instrumento ${instrument}.\n\nSaludos,\nEquipo de la plataforma`;

        createNotification(subjectUser,messageUser,user._id );
        if (user.receiveNotifications) {
            await sendEmailNotification(user.email, subjectUser, messageUser);
        }
        const adminsToNotify = updatedActivity.admins
        const subject = 'Nuevo usuario añadido a la actividad';
        const message = `El usuario "${nickname}" se ha unido a la actividad "${updatedActivity.title}" con el instrumento "${instrument}".`;
        for (const admin of adminsToNotify) {
            const userData = await User.findOne({ nickname: admin });
            if(userData.receiveNotifications){
                await sendEmailNotification(userData.email, subject, message);
            }
            createNotification(subject, message, userData._id);
        }

        res.status(200).json(updatedActivity);
    } catch (error) {
        console.log(error);
        handleHttpError(res, "ERROR_ADDING_USER_TO_ACTIVITY", 500);
    }
};

const getRecommendedActivities = async (req, res) => {
    try {
        // Comprobamos el estado de las actividades para actualizarlas en caso de que sea necesario
        await checkStatus();

        const nickname = req.user.nickname;

        // Buscar al usuario por su nickname
        const user = await User.findOne({ nickname });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Buscar todas las actividades que sean de tipo open, cuyo estado sea plazas disponibles o en curso,
        // y que tengan al menos uno de los instruments del usuario
        const activities = await Activity.find({
            type: 'open',
            state: { $in: ['plazas disponibles', 'en curso'] },
            instruments: { $in: user.instruments }
        }).sort({ createdAt: -1 }); // Ordenar de más reciente a menos reciente

        const recommendedActivities = [];

        for (const activity of activities) {
            const reservations = await Reservation.find({ activity_id: activity._id });
            // Comprobar si reservations es null o está vacío
            if (!reservations || reservations.length === 0) {
                continue; // Saltar al siguiente ciclo del bucle
            }

            for (const reservation of reservations) {
                const dayOfWeek = moment(reservation.date).format('dddd').toLowerCase();
                const timeSlot = reservation.time_slot;

                if (user.availabilitySchedule[dayOfWeek].includes(timeSlot)) {
                    recommendedActivities.push(activity);
                    break;
                }
            }
        }

        // Devolver las actividades recomendadas
        res.status(200).json(recommendedActivities);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error getting recommended activities' });
    }
};


const deleteUserFromActivity = async (req, res) => {
    try {
        // Comprobamos el estado de las actividades para actualizarlas en caso de que sea necesario
        await checkStatus();

        const id = req.params.id;
        const user_id  = req.user._id;
        const nickname = req.user.nickname

        const activity = await Activity.findById(id);
        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        if (!activity.users.map(user => user.username).includes(nickname)) {
            return res.status(400).json({ error: 'User not in the activity' });
        }
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the user is an admin and if they are the only admin of the activity
        const userIsAdmin = activity.admins.includes(nickname);
        const onlyOneAdmin = activity.admins.length === 1;
        if (userIsAdmin && onlyOneAdmin) {
            return res.status(400).json({ error: 'You are the only admin of the activity and cannot leave.' });
        }

        // Sumar uno a available_places
        activity.available_places += 1;

        // Si el estado era 'completo', cambiarlo a 'plazas disponibles'
        if (activity.state === 'completo') {
            activity.state = 'plazas disponibles';
        }

        // Eliminar el usuario de la actividad y guardar los cambios
        const userIndex = activity.users.findIndex(user => user.username === nickname);
        if (userIndex > -1) {
            activity.users.splice(userIndex, 1);
        }
        const updatedActivity = await activity.save();

        //avisamos al usuario tambien que se ha salido de la actividad
        const subjectUser = `Te has salido de la actividad ${updatedActivity.title}`;
        const messageUser = `¡Hola ${nickname}!\n\nTe has salido de la actividad ${updatedActivity.title}.\n\nSaludos,\nEquipo de la plataforma`;

        createNotification(subjectUser,messageUser,user._id );
        if (user.receiveNotifications) {
            await sendEmailNotification(user.email, subjectUser, messageUser);
        }

        const adminsToNotify = updatedActivity.admins
        const subject = 'Usuario eliminado de la actividad';
        const message = `El usuario "${nickname}" se ha eliminado de la actividad "${updatedActivity.title}".`;
        for (const admin of adminsToNotify) {
            const userData = await User.findOne({ nickname: admin });
            if(userData.receiveNotifications){
                await sendEmailNotification(userData.email, subject, message);
            }
            createNotification(subject, message, userData._id);
        }

        res.status(200).json(updatedActivity);
    } catch (error) {
        console.log(error);
        handleHttpError(res, "ERROR_REMOVING_USER_FROM_ACTIVITY", 500);
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
        console.log(error);
        throw error;
    }
};

const updateActivityImage = async (req, res) => {


    try {
        // Comprobamos el estado de las actividades para actualizarlas en caso de que sea necesario
        await checkStatus();

        const id = req.params.id;
        const nickname = req.user.nickname;
        const imagePath = req.file.filename 
        
        const isAdmin = await Activity.exists({ _id: id, admins: nickname });
        if (!isAdmin) {
            return res.status(403).json({ error: 'You are not authorized to delete this activity' });
        }

        const updatedActivity = await Activity.findByIdAndUpdate(id, {image: imagePath}, {new: true});

        if (!updatedActivity) {
            return res.status(404).json({ error:'Activity not found' });
        }
        if(req.user.role === "admin"){
            createModification("FOTO ACTUALIZADA", req.user._id, updatedActivity._id);
        }

        res.status(200).json({ message: 'Activity image updated successfully', activity: updatedActivity });
    }
    catch(err){
        console.log(err)
        handleHttpError(res, 'ERROR_UPDATE_ACTIVITY_IMAGE')
    }
}

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

const getActivitiesWithoutReservations = async (req, res) => {
    try {
        // Get all activities
        const activities = await Activity.find();

        // Initialize an empty array to hold the activities without reservations
        let activitiesWithoutReservations = [];

        // Loop through each activity
        for (let activity of activities) {
            // Get the reservations for the current activity
            const reservations = await Reservation.find({ activity_id: activity._id });

            // If the activity has no reservations, add it to the array
            if (reservations.length === 0) {
                activitiesWithoutReservations.push(activity);
            }
        }

        res.status(200).json(activitiesWithoutReservations);
    } catch (error) {
        handleHttpError(res, "ERROR_GETTING_ACTIVITIES_WITHOUT_RESERVATIONS", 500);
        console.log(error);
    }
};



module.exports = {
    createActivity,
    getActivities,
    getActivity,
    updateActivity,
    deleteActivity,
    getCreatedActivitiesProfile,
    getMyActivitiesProfile,
    addUserToActivity,
    deleteUserFromActivity, 
    getImportantActivities,
    getFilteredActivities, 
    getRecommendedActivities,
    updateActivityImage,
    sendEmailNotification, 
    getActivitiesWithoutReservations
};


