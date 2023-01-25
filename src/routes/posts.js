import express from 'express'
const router = express.Router()
import Post from '../models/post.js'
import User from '../models/user.js'

// create a post
router.post("/", async (req, res) => {
    const newPost = new Post(req.body)
    try {
        const post = await newPost.save()
        res.status(200).json(post)
    } catch (error) {
        console.log("error:", error)
        res.status(500).json(error)
    }
})

// update a post
router.put("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (post) {
            if (post.userId === req.body.userId) {
                await post.updateOne({ $set: req.body })
                res.status(200).json("post updated")
            } else {
                res.status(403).json("you cn update only your post")
            }
        } else {
            res.status(400).json("somethinig went wrong")
        }
    } catch (error) {
        console.log("error:", error)
        res.status(500).json(error)
    }
})

// delete a post
router.delete("/:id/:userId", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        console.log("postId, userId:", post.userId, req.params.userId)
        if (post) {
            if (post.userId === req.params.userId) {
                await post.deleteOne()
                res.status(200).json("post deleted")
            } else {
                res.status(403).json("you can delete only your post")
            }
        } else {
            res.status(400).json("somethinig went wrong")
        }
    } catch (error) {
        console.log("error:", error)
        res.status(500).json(error)
    }
})

// like/ dislike a post
router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: { likes: req.body.userId } })
            res.status(200).json("Post liked")
        } else {
            await post.updateOne({ $pull: { likes: req.body.userId } })
            res.status(200).json("Post diliked")
        }
    } catch (error) {
        console.log("error:", error)
        res.status(500).json(error)
    }
})

// get a post
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        res.status(200).json(post)
    } catch (error) {
        console.log("error:", error)
        res.status(500).json(error)
    }
})

// get timeline posts
router.get("/timeline/:userId", async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId)
        const userPosts = await Post.find({ userId: currentUser._id })
        const friendsPosts = await Promise.all(
            currentUser.followings.map(freindId => {
                return Post.find({ userId: freindId })
            })
        )
        res.status(200).json(userPosts.concat(...friendsPosts))
    } catch (error) {
        console.log("error:", error)
        res.status(500).json(error)
    }
})

// get user's posts
router.get("/profile/:username", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
        const posts = await Post.find({ userId: user._id })
        res.status(200).json(posts)
    } catch (error) {
        console.log("error:", error)
        res.status(500).json(error)
    }
})

export default router