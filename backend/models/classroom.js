const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    building: {
        type: String,
        required: true
    }
});

const Classroom = mongoose.model('Classroom', classroomSchema);

module.exports = Classroom;
