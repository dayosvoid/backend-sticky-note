
const express = require('express')
const app = express()
const dotenv = require('dotenv')
dotenv.config()
const mongoose = require('mongoose')
const cors = require('cors')
const notesRoute = require('./routes/notes.routes')
require('./config/cloudinary.config')


const PORT = process.env.PORT || 6000

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
//   secure: true,
// });


app.use(cors())
app.use(express.json({limit: "50mb"}))
app.use(express.urlencoded({extended:true, limit:"50mb"}))
app.use((req, res, next) => {
    req.io = io
    next()
})
app.use("/api/notes/", notesRoute)

// socket.io config
const server = require('http').createServer(app)
const io = require('socket.io')(server,
   {cors: { origin: CLIENT_API_URL ,
    methods:['GET','POST']
   }})

io.on('connection', socket => {
    console.log('socket connected:', socket.id)

    socket.on('disconnect', () => {
        console.log('socket disconnected:', socket.id)
    })
})

const startServer = async()=>{
    try {
       await mongoose.connect(process.env.MONGO_URI)
        server.listen(PORT,()=>{
        console.log(`app is listening at PORT:${PORT}`)
    }) 
    } catch (error) {
      console.log("database connection failed", error.message)
      process.exit(1)  
    }
    
}

startServer()