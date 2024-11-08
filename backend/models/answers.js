const mongoose = require('mongoose');
const User = require('./user');
const Post = require('./posts');

const answerSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    nickname: {
        type: String, 
        ref: "User.nickname"
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Post,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Answer = mongoose.model('Answer', answerSchema);

module.exports = Answer;
