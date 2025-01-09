const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    channel: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },
    filename: { type: String },
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video', 'document', 'other'], required: true },
    size: { type: Number }, 
    uploadedAt: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model('File', FileSchema);
  