import express from 'express'
import Message from '../models/message.js'
import Conversation from '../models/conversation.js'
const router  = express.Router()

// create message
router.post("/", async (req, res) => {
    const newMessage = new Message(req.body)
    try {
        const message = await newMessage.save();
        res.status(200).json(message)
    } catch (error) {
        res.status(500).json(error)
    }
})

// delete message
router.delete("/:id", async (req, res) => {
    try {
        let message = await Message.findByIdAndUpdate(req.params.id, {
            deleted: true
        })
        res.status(200).send(message)
    } catch (error) {
        res.status(400).send(error)
    }
})

// delete all message
router.delete("/all/:convId", async (req, res) => {
    try {
        let message = await Message.deleteMany({conversationId: req.params.convId}) 
        let conv = await Conversation.findOneAndDelete({_id: req.params.convId})
        res.status(200).send("All messages deleted successfully")
    } catch (error) {
        res.status(400).send(error)
    }
})

// get messages from a conversation
router.get("/:conversationId", async (req, res) => {
    try {
        const messages = await Message.find({
            conversationId: req.params.conversationId
        })
        res.status(200).json(messages)
    } catch (error) {
        res.status(500).json(error)
    }
})

export default router