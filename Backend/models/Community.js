const mongoose = require('mongoose');

const CommunitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    workspaces: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' }],
  }, { timestamps: true });
  
  module.exports = mongoose.model('Community', CommunitySchema);
  