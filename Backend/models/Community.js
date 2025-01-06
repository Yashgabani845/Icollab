const CommunitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Community creator
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users in the community
    workspaces: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' }], // Associated workspaces
  }, { timestamps: true });
  
  module.exports = mongoose.model('Community', CommunitySchema);
  