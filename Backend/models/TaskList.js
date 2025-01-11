const mongoose = require("mongoose");

const TaskListSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  tasks: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Task" 
    }
  ],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  }, 
  createdAt: { type: Date, default: Date.now }, 
  updatedAt: { type: Date, default: Date.now }, 
});

TaskListSchema.pre("save", function (next) {
  this.updatedAt = Date.now(); 
  next();
});

module.exports = mongoose.model("TaskList", TaskListSchema);
