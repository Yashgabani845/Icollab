const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String }, // URL to user's avatar
  status: { type: String, default: "online" }, // online, offline, away
  workspaces: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' }], // Workspaces the user belongs to
  role: { type: String, enum: ['admin', 'member'], default: 'member' }, // Role in workspace
  lastSeen: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
