// Message model (models/Message.js)
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  text: { type: String, required: true },
  sentBy: { type: Schema.Types.ObjectId, ref: 'User' }, // Reference to user who sent the message
  channel: { type: Schema.Types.ObjectId, ref: 'Channel' }, // Reference to the channel
  sentAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);
