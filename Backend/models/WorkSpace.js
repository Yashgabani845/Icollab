const WorkspaceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Workspace creator
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users in the workspace
    channels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }], // Associated channels
    createdAt: { type: Date, default: Date.now },
  }, { timestamps: true });
  
  module.exports = mongoose.model('Workspace', WorkspaceSchema);
  