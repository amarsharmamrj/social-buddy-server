import mongoose, { Schema } from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        min: 3,
        max: 40,
        unique: true
    },
    email: {
        type: String,
        required: true,
        max: 50,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        min: 6
    },
    profilePicture: {
        type: String,
        default: ""
    },
    coverPicture: {
        type: String,
        default: ""
    },
    followers: {
        type: Array,
        default: []
    },
    followings: {
        type: Array,
        default: []
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    desc: {
        type: String,
        max: 100,
    },
    city: {
        type: String,
        max: 100
    },
    from: {
        type: String,
        max: 80
    },
    relationship: {
        type: Number,
        enum: [1, 2, 3]
    },
    muteNotifySound: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true }
)

const User = mongoose.model("User", UserSchema)
export default User;