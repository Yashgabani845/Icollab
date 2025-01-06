const WorkspaceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    channels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }], 
    createdAt: { type: Date, default: Date.now },
  }, { timestamps: true });
  
  module.exports = mongoose.model('Workspace', WorkspaceSchema);
  