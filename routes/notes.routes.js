const express = require('express')
const Router = express.Router()
const authMiddleware = require("../middleware/Auth.middleware")
const {handleCreateNote,handleGetAllNotes, handleNoteUpdate}=require('../contoller/notes.Controller')

Router.post('/create',authMiddleware,handleCreateNote)
Router.get('/get',authMiddleware,handleGetAllNotes)
Router.patch('/update',authMiddleware,handleNoteUpdate)

module.exports = Router