const NotificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['message', 'mention', 'call'], required: true },
    message: { type: String }, // Notification message
    link: { type: String }, // Link to redirect (e.g., channel or video call)
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model('Notification', NotificationSchema);
  