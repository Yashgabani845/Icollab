const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      role: {
        type: String,
        enum: ['admin', 'editor', 'viewer'], // Specify roles for members
        default: 'viewer',
      },
    },
  ],
  chat: {
    channels: [
      {
        name: String,
        description: String,
        members: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
        ],
        messages: [
          {
            sender: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
            },
            content: String,
            timestamp: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    ],
  },
  notifications: [
    {
      type: {
        type: String,
        enum: ['info', 'alert', 'task'], 
      },
      content: String,
      priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium',
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  
});

const Workspace = mongoose.model('Workspace', workspaceSchema);

module.exports = Workspace;
