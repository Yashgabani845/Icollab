const MessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    channel: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },
    content: { type: String, required: true },
    type: { type: String, enum: ['text', 'image', 'video', 'file'], default: 'text' },
    attachments: [{ type: String }], 
    createdAt: { type: Date, default: Date.now },
  }, { timestamps: true });
  
  module.exports = mongoose.model('Message', MessageSchema);
  