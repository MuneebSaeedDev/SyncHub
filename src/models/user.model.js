const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
        type: String,
        required: function () { return this.authProvider === 'local' },
        trim: true,
        minlength: 8,
        select: false
        },
        role: {
            type: String,
            lowercase: true,
            enum: ['user', 'admin'],
            default: 'user'
        },
        authProvider: {
            type: String,
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