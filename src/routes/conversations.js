import express from "express";
const router = express.Router()
import Conversation from '../models/conversation.js'

// create a new conversation
router.post("/", async (req, res) => {
    const newConversation =  new Conversation({
        members: [req.body.senderId, req.body.recieverId]
    })
    try {
        const savedConversation = await newConversation.save()
        res.status(200).json(savedConversation)
    } catch (error) {
        res.status(500).json(error)
    }
})

// get conversation of a user
router.get("/:userId", async (req, res) => {
    try {
        const conversation = await Conversation.find({
            members: { $in: [req.params.userId]}
        })
        res.status(200).json(conversation)
    } catch (error) {
        res.status(500).json(error)
    }
})

export default router