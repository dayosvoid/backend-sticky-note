const mongoose = require('mongoose')

const notesSchema = new mongoose.Schema({
    note:{
        type:String,
        required:true
    },
    topic:{
        type:String,
        required:true,
        maxLength:10
    },
    category:{
        type:String,
        required:true,
        enum:['Personal', 'Business', 'Other'],
        default:'personal'
    }
    
},{timestamps:true})

const NOTE = mongoose.model("note",notesSchema)

module.exports = NOTE