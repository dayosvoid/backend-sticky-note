const NOTES = require("../model/notes.Schema");
const customError = require("../utils/customError");
const cloudinary = require("cloudinary").v2;

const handleCreateNote = async (req, res, next) => {
  const { note, topic, category, image } = req.body;
  const userId = req.user._id;
  let imageUrl = "";

  try {
    // Fix 1: Validate input fields first before wasting Cloudinary bandwidth!
    if (!note || !topic || !category || !userId) {
      return next(
        new customError(
          "Missing required note content, topic, or category",
          400,
        ),
      );
    }

    if (topic.length > 50 || topic.length < 3) {
      return next(
        new customError(
          "Topic length must be between 3 and 10 characters",
          400,
        ),
      );
    }

    if (image) {
      const uploaded = await cloudinary.uploader.upload(image, {
        allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"], // Fix: pluralized key name
        folder: "sticky-notes",
      });
      imageUrl = uploaded.secure_url;
      console.log("Cloudinary URL:", uploaded.secure_url);
    }

    const saveNote = await NOTES.create({
      user: userId,
      note: note,
      topic: topic.toUpperCase(),
      category: category,
      image: imageUrl,
    });

    if (req.io) {
      req.io.emit("note_created", saveNote);
    }

    return res.status(200).json({
      success: true,
      message: "Note created successfully",
      data: saveNote,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

const handleGetAllNotes = async (req, res, next) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return next(new customError("user not found", 404));
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const notes = NOTES.find({ user: userId })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const count = NOTES.countDocuments({ user: userId });

    const [allNotes, totalNotes] = await Promise.all([notes, count]);

    if (!allNotes || allNotes.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No available notes found",
        data: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalNotes: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    }

    const totalPages = Math.ceil(totalNotes / limit);

    return res.status(200).json({
      success: true,
      message: "All available notes",
      count: totalNotes,
      pagination: {
        currentPage: page,
        totalPages,
        totalNotes,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      data: allNotes,
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
      return next(
        new customError(
          "Please provide noteId and newNote content to execute updates",
          400,
        ),
      );
    }

    const updateNote = await NOTES.findByIdAndUpdate(
      noteId,
      {
        topic: newNote.topic,
        note: newNote.note,
        category: newNote.category,
        image: newNote.image,
      },
      { new: true, runValidators: true },
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

const handleDelete = async (req, res, next) => {
  try {
    
    const userId = req.user?._id;
    if (!userId) {
      return next(new customError("User not found", 404));
    }

    const { noteId } = req.params;
    if (!noteId) {
      return next(new customError("Note ID is required", 400));
    }

    // ✨ OPTIMIZED: Find and delete in a single database round-trip
    // This looks for a note matching the ID AND belonging to the logged-in user
    const deletedNote = await NOTES.findOneAndDelete({ _id: noteId, user: userId });
    
    // If no note matches both criteria, it either doesn't exist or doesn't belong to them
    if (!deletedNote) {
      return next(new customError("Note not found or unauthorized", 404));
    }

    // 📣 Broadcast the real-time event via socket
    if (req.io) {
      req.io.emit("note_deleted", noteId);
    }

    return res.status(200).json({
      success: true,
      message: "Note deleted successfully",
      deletedNoteId: noteId,
    });
  } catch (error) {
    console.error("handleDeleteNote error:", error);
    return next(error);
  }
};

module.exports = {handleDelete, handleCreateNote, handleGetAllNotes, handleNoteUpdate };
