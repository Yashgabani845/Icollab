const mongoose = require('mongoose');

const ChannelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Channel', ChannelSchema);
