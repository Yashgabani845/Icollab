const mongoose = require('mongoose');

const PullRequestSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  state: { type: String, enum: ['open', 'closed', 'merged'], required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  repository: { type: String, required: true }
}, { timestamps: true });

const IssueSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  state: { type: String, enum: ['open', 'closed'], required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  repository: { type: String, required: true }
}, { timestamps: true });

const ProjectSchema = new mongoose.Schema({
  repositoryUrl: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  owner: { type: String, required: true },
  stars: { type: Number, default: 0 },
  forks: { type: Number, default: 0 },
  pullRequests: [PullRequestSchema],
  issues: [IssueSchema],
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastSynced: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);