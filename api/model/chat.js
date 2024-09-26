const mongoose = require("mongoose")

const chatSchema = new mongoose.Schema({
    connectionId: {
        type: String
    },
    sender: {
        type: String
    },
    message: {
        type: String
    }
})

module.exports = mongoose.model('chat', chatSchema)