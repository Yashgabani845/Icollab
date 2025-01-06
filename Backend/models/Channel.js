const ChannelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    isPrivate: { type: Boolean, default: false },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  }, { timestamps: true });
  
  module.exports = mongoose.model('Channel', ChannelSchema);
  