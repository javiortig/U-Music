const mongoose = require('mongoose');
const User = require('./user');

const modificationSchema = new mongoose.Schema({
    modification_details: {
        type: mongoose.Schema.Types.Mixed ,
        required: true
    },
    admin_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
    },
    element_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },
});

const Modification = mongoose.model('Modification', modificationSchema);

module.exports = Modification;