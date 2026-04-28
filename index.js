const express = require('express')
const app = express()
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const cors = require('cors')
const notesRoute = require('./routes/notes.routes')
dotenv.config()


const PORT = process.env.PORT || 6000


app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
    req.io = io
    next()
})
app.use("/api/notes/", notesRoute)

// socket.io config
const server = require('http').createServer(app)
const io = require('socket.io')(server,
   {cors: { origin: 'http://localhost:5173' ,
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