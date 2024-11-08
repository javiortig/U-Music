const User = require('../models/user');
const Post = require('../models/posts');
const Answer = require('../models/answers');
const Activity = require('../models/activity');
const {handleHttpError} = require('../utils/handleHttpError');
const { matchedData } = require("express-validator")

const createPost = async (req, res) => {
    try {
        const { title, content, activity, tag} = req.body;
        const nickname = req.user.nickname;

        // Check if a user with the given nickname exists
        const user = await User.find({ "nickname": nickname });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let post = null ; 

        if (activity === "general") {
            post = new Post({
                title,
                content,
                nickname,
                activity,
                tag
            });

        }else{

            // Get the activity
            const activityData = await Activity.findById(activity);

            // Check if the activity exists
            if (!activityData) {
                return res.status(404).json({ error: 'Activity not found' });
            }

            // Check if the user is an admin of the system, an admin of the activity or is included in the activity
            const userInActivity = activityData.users.some(user => user.username === nickname);
            const adminInActivity = activityData.admins.some(admin => admin.username === nickname);

            if (req.user.nickname !== 'admin' && !userInActivity && !adminInActivity) {
                return res.status(403).json({ error: 'You are not authorized to create a post in this activity' });
            }

            post = new Post({
                content,
                nickname,
                activity,
                tag
            });
        }

        // Save the post to the database
        await post.save();

        // Emitir un evento de Socket.IO para notificar a los clientes sobre el nuevo post
        global.io.emit('new post', post);

        // Send response with the created post
        res.status(201).json(post);

    } catch (error) {
        // Handle errors
        handleHttpError(res, "ERROR_CREATING_POST", 403);
        console.log(error);
    }
};

const getPosts = async (req, res) => {
    try {
        // Get all posts
        const posts = await Post.find();

        // Initialize an empty array to hold the posts with user images
        let postsWithUserImages = [];

        // Loop through each post
        for (let post of posts) {
            // Find the user who created the post
            const user = await User.findOne({ nickname: post.nickname });

            // Add the user's image to the post
            const postWithUserImage = post.toObject();
            postWithUserImage.userImage = user.image;

            // Add the post with the user image to the array
            postsWithUserImages.push(postWithUserImage);
        }

        // Send response with the posts
        res.status(200).json(postsWithUserImages);
    } catch (error) {
        // Handle errors
        handleHttpError(res, "ERROR_GETTING_POSTS", 403);
        console.log(error);
    }
};

const getPersonalPosts = async (req, res) => {
    try {
        const nickname = req.user.nickname;
        // Get all posts
        const posts = await Post.find({ "nickname": nickname });

        // Initialize an empty array to hold the posts with user images
        let postsWithUserImages = [];

        // Loop through each post
        for (let post of posts) {
            // Find the user who created the post
            const user = await User.findOne({ nickname: post.nickname });

            // Add the user's image to the post
            const postWithUserImage = post.toObject();
            postWithUserImage.userImage = user.image;

            // Add the post with the user image to the array
            postsWithUserImages.push(postWithUserImage);
        }

        // Send response with the posts
        res.status(200).json(postsWithUserImages);
    } catch (error) {
        // Handle errors
        handleHttpError(res, "ERROR_GETTING_POSTS", 403);
        console.log(error);
    }
};

const getPostsByActivity = async (req, res) => {
    try {
        const activity = req.params.activity;
        const nickname = req.user.nickname;
        const role = req.user.role;

        if (activity !== "general"){

            // Get the activity
            const activityData = await Activity.findById(activity);

            // Check if the activity exists
            if (!activityData) {
                return res.status(404).json({ error: 'Activity not found' });
            }

            // Check if the user is an admin or is included in the activity
            const userInActivity = activityData.users.some(user => user.username === nickname);
            if (role !== 'admin' && !userInActivity) {
                return res.status(403).json({ error: 'You are not authorized to view these posts' });
            }

        }

        let posts;

        if (activity === "general") {
            // If the activity is "general", sort the posts by 'createdAt' in descending order
            posts = await Post.find({ "activity": activity }).sort({ createdAt: -1 });
        } else {
            // If the activity is not "general", sort the posts by 'createdAt' in ascending order
            posts = await Post.find({ "activity": activity }).sort({ createdAt: 1 });
        }

        // Initialize an empty array to hold the posts with user images
        let postsWithUserImages = [];

        // Loop through each post
        for (let post of posts) {
            // Find the user who created the post
            const user = await User.findOne({ nickname: post.nickname });

            // Add the user's image to the post
            const postWithUserImage = post.toObject();
            postWithUserImage.userImage = user.image;

            // Add the post with the user image to the array
            postsWithUserImages.push(postWithUserImage);
        }

        res.status(200).json(postsWithUserImages);
    }
    catch (error) {
        handleHttpError(res, "ERROR_GETTING_POSTS", 403);
        console.log(error);
    }
};

const getPostsByNickname = async (req, res) => {
    try {
        const { nickname } = req.params;

        // Get all posts by nickname
        const posts = await Post.find({ "nickname": nickname });

        res.status(200).json(posts);
    }
    catch (error) {
        handleHttpError(res, "ERROR_GETTING_POSTS", 403);
        console.log(error);
    }
}

const getPostsByEmail = async (req, res) => {
    try {
        const { email } = req.params;

        // Get nickname by email
        const user = await User.find({ "email": email });
      
        const post = await Post.find({ "nickname": user[0].nickname });
        res.status(200).json(post);
    }
    catch (error) {
        handleHttpError(res, "ERROR_GETTING_POSTS", 403);
        console.log(error);
    }
}


const getPostsAndAnswers = async (req, res) => {
    try {
        const { id } = req.params;

        // Get the post by id
        const post = await Post.findById(id);

        // Check if the post exists
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Find the user who created the post
        const user = await User.findOne({ nickname: post.nickname });

        // Add the user's image to the post
        const postWithUserImage = post.toObject();
        postWithUserImage.userImage = user.image;
        
        // Get all answers for the post
        const answers = await Answer.find({ postId: id }).sort({ createdAt: -1 });

        // Initialize an empty array to hold the answers with user images
        let answersWithUserImages = [];

        // Loop through each answer
        for (let answer of answers) {
            // Find the user who created the answer
            const user = await User.findOne({ nickname: answer.nickname });

            // Add the user's image to the answer
            const answerWithUserImage = answer.toObject();
            answerWithUserImage.userImage = user.image;

            // Add the answer with the user image to the array
            answersWithUserImages.push(answerWithUserImage);
        }

        res.status(200).json({ post: postWithUserImage, answers: answersWithUserImages });
    }
    catch (error) {
        handleHttpError(res, "ERROR_GETTING_POSTS_AND_ANSWERS", 403);
        console.log(error);
    }
};


const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, tag } = req.body;
        const nickname = req.user.nickname;

        const post = await Post.findById(id);

        if (!post) {
            return handleHttpError(res, "POST_NOT_FOUND", 404);
        }

        if (post.nickname !== nickname) {
            return handleHttpError(res, "NOT_ALLOWED", 403);
        }

        const updateFields = {};
        if (title) updateFields.title = title;
        if (content) updateFields.content = content;
        if (tag) updateFields.tag = tag;

        const updatedPost = await Post.findByIdAndUpdate(id, { $set: updateFields }, { new: true });

        res.status(200).json(updatedPost);
    } catch (error) {
        handleHttpError(res, "ERROR_UPDATING_POST", 403);
        console.log(error);
    }
}


const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const nickname = req.user.nickname;

        const post = await Post.findById(id);

        if (!post) {
            return handleHttpError(res, "POST_NOT_FOUND", 404);
        }

        if (post.nickname !== nickname) {
            return handleHttpError(res, "NOT_ALLOWED", 403);
        }

        const deletedPost = await Post.findByIdAndDelete(id);

        if (!deletedPost) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Delete all answers to the post
        await Answer.deleteMany({ postId: id });

        res.status(200).json(deletedPost);
    } catch (error) {
        handleHttpError(res, "ERROR_DELETING_POST", 403);
        console.log(error);
    }
}
               
const getPostsByTag = async (req, res) => {
    try {
        const tags = req.query.tag.split(',');

        // Get all posts with any of the given tags
        const posts = await Post.find({ tag: { $in: tags } }).sort({ createdAt: -1 });

        // Initialize an empty array to hold the posts with user images
        let postsWithUserImages = [];

        // Loop through each post
        for (let post of posts) {
            // Find the user who created the post
            const user = await User.findOne({ nickname: post.nickname });

            // Add the user's image to the post
            const postWithUserImage = post.toObject();
            postWithUserImage.userImage = user.image;

            // Add the post with the user image to the array
            postsWithUserImages.push(postWithUserImage);
        }

        res.status(200).json(postsWithUserImages);
    }
    catch (error) {
        handleHttpError(res, "ERROR_GETTING_POSTS", 403);
        console.log(error);
    }
};



module.exports = {createPost,getPostsAndAnswers,  getPosts,getPersonalPosts, getPostsByNickname, getPostsByEmail,updatePost,getPostsByActivity,deletePost,getPostsByTag};
