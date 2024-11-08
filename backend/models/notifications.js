const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;