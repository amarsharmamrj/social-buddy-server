import express from 'express'
import User from '../models/user.js'
import bcrypt from 'bcrypt'
const router = express.Router()

// update user
router.put("/:id", async (req, res) => {
    console.log(req.body.userId, req.params.id, req.body.userId == req.params.id)
    if (req.body.userId == req.params.id || req.body.isAdmin) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10)
                req.body.password = await bcrypt.hash(req.body.password, salt)
            } catch (error) {
                console.log("error occured", error)
                return res.status(500).send(error)
            }
        }
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body
            })

            const {password, ...other} = user._doc
            res.status(200).send(other)
        } catch (error) {
            console.log("error occured", error)
            return res.status(500).send(error)
        }
    } else {
        return res.status(403).send("You can update only your account!")
    }
})

// delete user
router.delete("/:id", async (req, res) => {
    if (req.body.userId == req.params.id || req.body.isAdmin) {
        try {
            const user = await User.findByIdAndDelete({ _id: req.params.id })
            res.status(200).send("User has been deleted !")
        } catch (error) {
            console.log("error occured", error)
            return res.status(500).send(error)
        }
    } else {
        return res.status(403).send("You can delete only your account!")
    }
})

// get user
router.get("/", async (req, res) => {
    const userId = req.query.userId;
    const username = req.query.username
    try {
        const user = userId ? await User.findById({ _id: userId }) 
            : await User.findOne({username: username})
        const { password, updatedAt, ...other } = user._doc
        res.status(200).json(other)
    } catch (error) {
        console.log("error occured", error)
        return res.status(500).json(error)
    }
})

// get all users
router.get("/all", async (req, res) => {
    try {
        const users = await User.find({}, {username: 1, profilePicture: 1}) 
        res.status(200).json(users)
    } catch (error) {
        console.log("error occured", error)
        return res.status(500).json(error)
    }
})

// get friends
router.get("/friends/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
        console.log("user:", user)
        const friends =  await Promise.all(
            user.followings.map((friendId) => {
                return User.findById(friendId)
            })
        )

        console.log("friends:", friends)

        let friendsList = []
        
        // get all users whome user is following
        // friends.map((friend) => {
        //     const {_id, username, profilePicture, createdAt, updatedAt } = friend
        //     friendsList.push({_id, username, profilePicture, createdAt, updatedAt })
        // })

        // return users only if both follow each other
        friends.map((friend) => {
            if(friend.followings.includes(req.params.userId)){
                const {_id, username, profilePicture, createdAt, updatedAt } = friend
                friendsList.push({_id, username, profilePicture, createdAt, updatedAt })
            }
        })
        res.status(200).json(friendsList)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

// get friends followers
router.get("/friends/followers/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
        console.log("user:", user)
        const followers =  await Promise.all(
            user.followers.map((friendId) => {
                return User.findById(friendId)
            })
        )

        res.status(200).json(followers)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

// get friends followers
router.get("/friends/followings/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
        console.log("user:", user)
        const followings =  await Promise.all(
            user.followings.map((friendId) => {
                return User.findById(friendId)
            })
        )

        res.status(200).json(followings)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})


// follow user
router.put("/:id/follow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id)
            const currentUser = await User.findById(req.body.userId)
            if (!user.followers.includes(req.body.userId)) {
                await user.updateOne({ $push: { followers: req.body.userId } })
                await currentUser.updateOne({ $push: { followings: req.params.id } })
                res.status(200).json("user has been followed")
            } else {
                res.status(403).json("you already follow this user")
            }
        } catch (error) {
            console.log("error", error)
            res.status(500).json(error)
        }
    } else {
        res.status(403).json("You cannot follow yourself")
    }
})

// unfollow user
router.put("/:id/unfollow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id)
            const currentUser = await User.findById(req.body.userId)
            if (user.followers.includes(req.body.userId)) {
                await user.updateOne({ $pull: { followers: req.body.userId } })
                await currentUser.updateOne({ $pull: { followings: req.params.id } })
                res.status(200).json("user has been unfollowed")
            } else {
                res.status(403).json("you don't follow this user")
            }
        } catch (error) {
            console.log("error", error)
            res.status(500).json(error)
        }
    } else {
        res.status(403).json("You cannot unfollow yourself")
    }
})


export default router