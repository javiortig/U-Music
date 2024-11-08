const mongoose = require('mongoose');
const User = require('./user');
const Activity = require('./activity');
const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: false
    },
    content: {
        type: String,
        required: true
    },
    nickname: {
        type: String,
        ref: "User.nickname"
    },
    activity: {
        type: String,
        required: true
    },
    tag: {
        type: [String],
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
