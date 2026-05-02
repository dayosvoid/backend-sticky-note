const mongoose = require('mongoose')

const notesSchema = new mongoose.Schema({
    note:{
        type:String,
        required:true
    },
    topic:{
        type:String,
        required:true,
        maxLength:15
    },
    category:{
        type:String,
        required:true,
        enum:['Personal', 'Business', 'Other'],
        default:'Personal'
    },
    image:{
        type:String,
        default:""
    }
    
},{timestamps:true})

const NOTE = mongoose.model("note",notesSchema)

module.exports = NOTE