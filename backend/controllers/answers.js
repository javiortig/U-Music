const User = require('../models/user');
const Post = require('../models/posts');
const Answer = require('../models/answers');
const {handleHttpError} = require('../utils/handleHttpError');

const createAnswer = async (req, res) => {
    try {
        const { content, postId } = req.body;
        const nickname = req.user.nickname;
        
        const post = await Post.find({ "_id": postId });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const answer = new Answer({
            content,
            nickname,
            postId
        });

        await answer.save();

        // Emit a Socket.IO event to notify clients about the new answer
        io.emit('new answer', answer);

        res.status(201).json(answer);
    }
    catch (error) {
        handleHttpError(res, "ERROR_CREATING_ANSWER", 403);
        console.log(error);
    }
};


const getAnswersByPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const answers = await Answer.find({ "postId": postId });
        res.status(200).json(answers);
    }
    catch (error) {
        handleHttpError(res, "ERROR_GETTING_ANSWERS_BY_POST", 403);
        console.log(error);
    }
};

const updateAnswer = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const nickname = req.user.nickname;

        const answer = await Answer.findById(id);
        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }
  
        if (answer.nickname !== nickname) {
            return handleHttpError(res, "NOT_ALLOWED", 403);
        }

        answer.content = content;

        await answer.save();

        res.status(200).json(answer);
    }
    catch (error) {
        handleHttpError(res, "ERROR_UPDATING_ANSWER", 403);
        console.log(error);
    }
};

const deleteAnswer = async (req, res) => {
    try {
        const { id } = req.params;
        const nickname = req.user.nickname;

        const answer = await Answer.findById(id);
        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }
        if (answer.nickname !== nickname) {
            return handleHttpError(res, "NOT_ALLOWED", 403);
        }
        

        const deletedAnswer = await Answer.findByIdAndDelete(id);

        if (!deletedAnswer) {
            return res.status(404).json({ message: 'Answer not found.' });
        }

        res.status(200).json({ message: 'Answer deleted successfully' });

    }
    catch (error) {
        handleHttpError(res, "ERROR_DELETING_ANSWER", 403);
        console.log(error);
    }

}

module.exports = {
    createAnswer,
    getAnswersByPost,
    updateAnswer,
    deleteAnswer
}


