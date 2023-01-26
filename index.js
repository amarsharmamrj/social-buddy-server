import express from 'express'
const app = express();
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import cors from 'cors';
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url';

import { Server } from "socket.io";
// const io = new Server(7000, {
//     cors: process.env.CLIENT_URL,
// });
// const io = socket(7000, {
//   cors: "http://localhost:3000",
// })
// const io = new Server(7000, {
//     cors: "http://localhost:3000",
//   })

import Connection from './src/db/db.js';

// routes
import userRoute from './src/routes/users.js'
import authRoute from './src/routes/auth.js'
import postRoute from './src/routes/posts.js'
import conversationRoute from './src/routes/conversations.js'
import messageRoute from './src/routes/messages.js'
import notificationRoute from './src/routes/notifications.js'

dotenv.config();

// configure socket
const io = new Server(7000, {
    cors: process.env.CLIENT_URL,
});

// database connection
Connection()

// middleware
app.use(express.json())
app.use(helmet())
app.use(morgan("common"))

// cors
var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200,
    methods: "*"
}
app.use(cors(corsOptions));
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
});

// file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images");
    },
    filename: (req, file, cb) => {
        cb(null, req.body.name);
    },
});
const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
    try {
        return res.status(200).json("File uploded successfully");
    } catch (error) {
        console.error(error);
    }
});


// allow access of images folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/images", express.static(path.join(__dirname, "public/images")))

// routes
app.use("/api/users", userRoute)
app.use("/api/auth", authRoute)
app.use("/api/posts", postRoute)
app.use("/api/conversations", conversationRoute)
app.use("/api/messages", messageRoute)
app.use("/api/notifications", notificationRoute)



// messenger
let users = []

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId })
}

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId)
}

const getUser = (userId) => {
    return users.find((user) => user.userId === userId)
}

io.on("connection", (socket) => {
    console.log("a user connected")
    io.emit("welcome", "hello welcome to social buddy char application")

    // on connect
    socket.on("addUser", (userId) => {
        addUser(userId, socket.id)
        io.emit("getUsers", users)
    })

    // send and get message
    socket.on("sendMessageDeleted", ({ senderId, receiverId, messageId }) => {
        const user = getUser(receiverId)
        if (user) {
            io.to(user.socketId).emit("getMessageDeleted", {
                senderId, messageId
            })
        }
    })

    // send and get message deleted
    socket.on("sendMessage", ({ senderId, receiverId, text, image }) => {
        const user = getUser(receiverId)
        if (user) {
            io.to(user.socketId).emit("getMessage", {
                senderId, text, image
            })
        }
    })

    // router connect
    socket.on("routerConnect", ({ data }) => {
        console.log("routerConnect:", data)
        // const user = getUser(receiverId)
        // if(user){
        //     io.to(user.socketId).emit("getMessage", {
        //         senderId, text, image
        //     })
        // }
    })

    // typing
    socket.on("typing", ({ receiverId, typing, conversationId }) => {
        const user = getUser(receiverId)
        if (user) {
            io.to(user.socketId).emit("typing", {
                typing, receiverId, conversationId
            })
        }
    })

    // on disconnect
    socket.on("disconnect", () => {
        console.log("a user connected")
        removeUser(socket.id)
        io.emit("getUsers", users)
    })


    // hi
    socket.on("hi", ({ username }) => {
        socket.broadcast.emit("hey", username)
    })
})
// messenger

const port = process.env.PORT || 3000

app.get("/home", (req, res) => {
    res.send("<h1>home api</h1>")
})

app.listen(port, () => {
    console.log("App is running on the port:", port)
})
