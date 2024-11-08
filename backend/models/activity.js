const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    total_places: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['open', 'closed'],
        required: true
    },
    genre: {
        type: [String],
        required: true
    },
    admins: {
        type: [String],
    },
    recurrent: {
        type: Boolean,
        required: true
    },
    users: [{
        username: String,
        instrument: String,
        _id: false // Desactivar la creación automática de _id
    }],
    instruments: {
        type: [String],
        required: true
    },
    available_places: {
        type: Number,
        required: true
    },
    state: {
        type: String,
        enum: ['plazas disponibles', 'completo', 'en curso', 'terminado'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    image: {
        type: String
    }
}, {
    versionKey: false
});

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
