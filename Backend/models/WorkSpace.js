const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  channels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }],
});

module.exports = mongoose.model('Workspace', workspaceSchema);
