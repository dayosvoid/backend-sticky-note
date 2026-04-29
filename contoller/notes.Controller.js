const NOTES = require('../model/notes.Schema')

const handleCreateNote = async(req,res)=>{
    const {note,topic,category} = req.body
    try {
        if(!note || !topic || !category){
            return res.status(400).json({
                sucess:false,
                message:"Missing noteId or newNote content"
            })
        }

        if(topic.length > 10 || topic.length < 3){
            return res.status(400).json({
                sucess:false,
                message:"hit max character limit"
            })
        }

        const saveNote = await NOTES.create({ note: note, topic:topic.toUpperCase(), category:category })

        if (req.io) {
            req.io.emit('note_created', saveNote);
        }

        return res.status(200).json({
            success:true,
            message:"Note created successfully",
            data:saveNote
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

const handleGetAllNotes = async(req,res) =>{
    try {
        const allNotes = await NOTES.find()

        if(allNotes.length === 0){
            return res.status(404).json({
               success:true,
               message:"No available notes yet",
               data:[] 
            })
        }

        return res.status(200).json({
            success:true,
            message:"All available notes",
            data:allNotes
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

const handleNoteUpdate = async(req,res)=>{
    const {noteId, newNote} = req.body
    try {
        if(!noteId || !newNote){
            return res.status(400).json({
               success:false,
               message:"Provided the required notes :id" 
            })
        }

        const updateNote = await NOTES.findByIdAndUpdate(noteId,
             {note:newNote},
            {new:true})

            if(!updateNote){
                return res.status(404).json({
                    success:false,
                    message:"Notes not found"
                })
            }

            return res.status(200).json({
                success:true,
                message:"Note has been updated successfully",
                updateNote,
            })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

module.exports = {handleCreateNote,handleGetAllNotes, handleNoteUpdate}