import mongoose from "mongoose";

const SharedTask = mongoose.Schema({
    task_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    collaborator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required
    }
}, { timestamps: true })

module.exports = mongoose.model('SharedTask', SharedTask)