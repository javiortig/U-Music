const express = require("express")
const router = express.Router()

const {createPost, getPostsAndAnswers, getPosts,getPersonalPosts, getPostsByNickname, getPostsByEmail,updatePost,getPostsByActivity,deletePost,getPostsByTag} = require("../controllers/posts")
const {authMiddleware} = require("../middleware/authMiddleware")
const checkRol = require("../middleware/rol")
const {validateCreatePost, validateUpdatePost} = require("../validators/posts")

router.post("/createPost", validateCreatePost, authMiddleware,createPost)

router.get("/getPostsByActivity/:activity", authMiddleware,getPostsByActivity)
router.get("/getPostsByTag", authMiddleware,getPostsByTag)
router.get("/getPostsAndAnswers/:id", authMiddleware,getPostsAndAnswers)

router.put("/updatePost/:id", validateUpdatePost, authMiddleware, updatePost)

router.delete("/deletePost/:id", authMiddleware,deletePost)

module.exports = router
