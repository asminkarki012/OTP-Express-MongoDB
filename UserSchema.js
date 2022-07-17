const mongoose = require("mongoose")


const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    adress: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    contact_no: {
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    code: String
})

module.exports = mongoose.model("User", userSchema)