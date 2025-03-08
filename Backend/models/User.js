const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String },
    status: { type: String, default: "online" },
    workspaces: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' }],
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    lastSeen: { type: Date },
    googleId: { type: String },
    authType: { type: String, enum: ['local', 'google'], default: 'local' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
