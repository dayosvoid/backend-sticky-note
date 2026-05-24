const express = require('express')
const Router = express.Router()
const authMiddleware = require("../middleware/Auth.middleware")
const {handleDelete,handleCreateNote,handleGetAllNotes, handleNoteUpdate}=require('../contoller/notes.Controller')

Router.post('/create',authMiddleware,handleCreateNote)
Router.get('/get',authMiddleware,handleGetAllNotes)
Router.patch('/update',authMiddleware,handleNoteUpdate)
Router.delete("/delete/:noteId",authMiddleware,handleDelete)

module.exports = Router;