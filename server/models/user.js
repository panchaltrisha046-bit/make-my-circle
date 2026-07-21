const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    firstName: {
        type: String,
        required: true
    },

    lastName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    phone: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    photo: {
        type: String
    },

    bio: {
        type: String,
        default: ""
    },

    role: {
        type: String,
        default: ""
    },

    company: {
        type: String,
        default: ""
    },

    location: {
        type: String,
        default: ""
    },

    education: {
        type: String,
        default: ""
    },

    skills: {
        type: [String],
        default: []
    },

    certifications: {
        type: [String],
        default: []
    },

    github: {
        type: String,
        default: ""
    },

    linkedin: {
        type: String,
        default: ""
    },

    website: {
        type: String,
        default: ""
    },

    credentialId: {
        type: String,
        default: ""
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);