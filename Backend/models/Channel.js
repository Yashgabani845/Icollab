const ChannelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    isPrivate: { type: Boolean, default: false },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users in the channel
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }], // Associated messages
  }, { timestamps: true });
  
  module.exports = mongoose.model('Channel', ChannelSchema);
  