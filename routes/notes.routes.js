const express = require('express')
const Router = express.Router()

const {handleCreateNote,handleGetAllNotes, handleNoteUpdate}=require('../contoller/notes.Controller')

Router.post('/create',handleCreateNote)
Router.get('/get',handleGetAllNotes)
Router.patch('/update', handleNoteUpdate)

module.exports = Router