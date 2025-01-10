const mongoose = require('mongoose');

const VideoCallSchema = new mongoose.Schema({
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    channel: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    status: { type: String, enum: ['active', 'ended'], default: 'active' },
  }, { timestamps: true });
  
  module.exports = mongoose.model('VideoCall', VideoCallSchema);
  