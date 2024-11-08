const mongoose = require('mongoose');
const Classroom = require('./classroom');
const Activity = require('./activity');
const Schema = mongoose.Schema;

const reservationSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    time_slot: {  // 1: 9:00-11:00, 2: 11:00-13:00, 3: 13:00-15:00, 4: 15:00-17:00, 5: 17:00-19:00, 6: 19:00-21:00
        type: String,
        required: true
    },
    classroom_id: {
        type: String,
        default: "Sin aula asignada"
    },
    activity_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity'
    },
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
