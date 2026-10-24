import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    email:{
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password:{
        type: String,
        required: true,
        trim: true,
        minlength: 8,
        maxlength: 20
    },
    role: {
        type: String,
        lowercase: true,
        sparse: true,
        enum: ['user', 'admin'],
        default: 'user'
    },
    signFrom:{
        type: String,
        unique: true,
        enum: ['google', 'local'],
        default: 'local'
    },
    googleID: {
        type: String,
        unique: true,
        sparse: true
    }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)