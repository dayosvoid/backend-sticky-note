const NOTES = require('../model/notes.Schema');
const customError = require("../utils/customError");
const cloudinary = require('cloudinary').v2;

const handleCreateNote = async (req, res, next) => {
    const { note, topic, category, image } = req.body;
    const userId = req.user._id
    let imageUrl = "";

    try {
        // Fix 1: Validate input fields first before wasting Cloudinary bandwidth!
        if (!note || !topic || !category || !userId) {
            return next(new customError("Missing required note content, topic, or category", 400));
        }

        if (topic.length > 15 || topic.length < 3) {
            return next(new customError("Topic length must be between 3 and 10 characters", 400));
        }

        if (image) {
            const uploaded = await cloudinary.uploader.upload(image, {
                allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"], // Fix: pluralized key name
                folder: "sticky-notes"
            });
            imageUrl = uploaded.secure_url;
            console.log("Cloudinary URL:", uploaded.secure_url);
        }

        const saveNote = await NOTES.create({ 
            user:userId,
            note: note, 
            topic: topic.toUpperCase(), 
            category: category, 
            image: imageUrl 
        });

        if (req.io) {
            req.io.emit('note_created', saveNote);
        }

        return res.status(200).json({
            success: true,
            message: "Note created successfully",
            data: saveNote
        });
    } catch (error) {
        console.error(error);
        return next(error); 
    }
};

const handleGetAllNotes = async (req, res, next) => {
    const userId = req.user._id
    if(!userId){
        return next(new customError("user not found",404))
    }
    try {
        const allNotes = await NOTES.find({ user: userId })

     
        if (!allNotes || allNotes.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No available notes found",
                data: []
            });
        }

        return res.status(200).json({
            success: true,
            message: "All available notes",
            data: allNotes
        });
    } catch (error) {
        console.error(error);
        return next(error);
    }
};

const handleNoteUpdate = async (req, res, next) => { 
    const { noteId, newNote } = req.body;
    try {
        if (!noteId || !newNote) {
            return next(new customError("Please provide noteId and newNote content to execute updates", 400));
        }

        const updateNote = await NOTES.findByIdAndUpdate(
            noteId,
            { note: newNote },
            { new: true }
        );

        if (!updateNote) {
            return next(new customError("Target note record not found", 404));
        }

        return res.status(200).json({
            success: true,
            message: "Note has been updated successfully",
            data: updateNote, // Wrapped cleanly inside standard data property wrapper
        });
    } catch (error) {
        console.error(error.message);
        return next(error);
    }
};

module.exports = { handleCreateNote, handleGetAllNotes, handleNoteUpdate };