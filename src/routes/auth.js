import express, { application } from 'express'
import User from '../models/user.js';
import bcrypt from 'bcrypt'
const router = express.Router()

// register
router.post("/register", async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        })
        const user =  await newUser.save()
        res.status(200).json(user)
    } catch (error) {
        console.log(error)
        res.status(400).send("Something went wrong !")
    }
})

// login
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({email: req.body.email})
        !user && res.status(404).send("User not found !")

        const validPassword = await bcrypt.compare(req.body.password, user.password)
        !validPassword && res.status(400).send("Password is wrong !")
        
        res.status(200).json(user)
    } catch (error) {
        
    }
})
 
export default router;