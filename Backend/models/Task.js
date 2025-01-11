const mongoose = require("mongoose");
const TaskList = require("./TaskList");

const CommentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  time: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the User schema
});

const ChecklistItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: Boolean, default: false }, // `true` means completed
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the User schema
});

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  comments: [CommentSchema], // Array of comments
  labels: [{ type: String }], // Array of labels/tags
  checklist: [ChecklistItemSchema], // Array of checklist items
  
  attachments: [{ type: String }], // Array of attachment URLs
  dates: {
    deadline: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  taskListId :{ type: mongoose.Schema.Types.ObjectId, ref: "TaskList", required: true },
  coverPhoto: { type: String, default: "" }, 
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"], 
    default: "Medium",
  },
});

module.exports = mongoose.model("Task", TaskSchema);
