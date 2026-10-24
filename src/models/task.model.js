import mongoose from "mongoose";
import { moduleRunnerTransform } from "vite";

const Task = new mongoose.Schema({
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        minlength: 16,
        maxlength: 100
    },
    priority: {
        type: String,
        lowercase: true,
        enum: ['low', 'medium', 'high'],
        default: 'low'
    },
    dueDate: {
        type: Date,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('Task', Task)