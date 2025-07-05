const Task = require('../models/Task');
const TaskList = require('../models/TaskList');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Get a specific task by ID with all details
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate("createdBy", "firstName lastName avatar")
      .populate("assignedTo", "firstName lastName avatar")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "firstName lastName avatar",
        },
      });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get tasks by taskList and user
exports.getTasks = async (req, res) => {
  const { taskListName, userEmail } = req.query;

  try {
    const taskList = await TaskList.findOne({ name: taskListName });
    if (!taskList) {
      return res.status(400).json({ error: 'TaskList not found' });
    }
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const taskIds = taskList.tasks;
    if (!taskIds || taskIds.length === 0) {
      return res.status(200).json([]);
    }
    const userTasks = await Task.find({
      _id: { $in: taskIds }, 
      createdBy: user._id,
    });
    res.status(200).json(userTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// Create a new task
exports.createTask = async (req, res) => {
  const { title, description, priority, createdBy, Tasklist } = req.body;
  try {
    const user = await User.findOne({ email: createdBy });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    const taskList = await TaskList.findOne({ name: Tasklist });
    if (!taskList) {
      return res.status(400).json({ error: 'TaskList not found' });
    }
    const existingTask = await Task.findOne({
      title,
      taskListId: taskList._id, 
      createdBy: user._id,
    });
    if (existingTask) {
      return res.status(400).json({ error: 'A task with this title already exists in this task list' });
    }
    const newTask = new Task({
      title,
      description,
      assignedTo: [],
      priority,
      labels: [],
      checklist: [],
      taskListId: taskList._id,
      createdBy: user._id,
    });
    await newTask.save();
    taskList.tasks.push(newTask._id);
    await taskList.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

// Update task description
exports.updateDescription = async (req, res) => {
  try {
    const { description } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      { description },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Error updating description:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add a checklist item
exports.addChecklistItem = async (req, res) => {
  try {
    const { title, user } = req.body;
    const task = await Task.findById(req.params.taskId);
    const userId = await User.findOne({ email: user });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    const newChecklistItem = {
      title,
      status: false,
      createdBy: userId._id,
    };

    task.checklist.push(newChecklistItem);
    await task.save();
    res.status(201).json(task.checklist[task.checklist.length - 1]);
  } catch (error) {
    console.error("Error adding checklist item:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a checklist item
exports.updateChecklistItem = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const checklistItem = task.checklist.id(req.params.itemId);
    if (!checklistItem) {
      return res.status(404).json({ message: "Checklist item not found" });
    }

    checklistItem.status = status;
    await task.save();

    res.json(checklistItem);
  } catch (error) {
    console.error("Error updating checklist item:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a checklist item
exports.deleteChecklistItem = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.checklist = task.checklist.filter(
      (item) => item._id.toString() !== req.params.itemId
    );
    await task.save();

    res.json({ message: "Checklist item deleted" });
  } catch (error) {
    console.error("Error deleting checklist item:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add a label
exports.addLabel = async (req, res) => {
  try {
    const { label } = req.body;
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!task.labels.includes(label)) {
      task.labels.push(label);
      await task.save();
    }

    res.json({ labels: task.labels });
  } catch (error) {
    console.error("Error adding label:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove a label
exports.removeLabel = async (req, res) => {
  try {
    const label = decodeURIComponent(req.params.label);
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.labels = task.labels.filter((l) => l !== label);
    await task.save();

    res.json({ labels: task.labels });
  } catch (error) {
    console.error("Error removing label:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update task due date
exports.updateDeadline = async (req, res) => {
  try {
    const { deadline } = req.body;
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.dates.deadline = deadline;
    await task.save();

    res.json(task);
  } catch (error) {
    console.error("Error updating deadline:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add a comment
exports.addComment = async (req, res) => {
  try {
    const { text, user } = req.body;
    const task = await Task.findById(req.params.taskId);
    const userId = await User.findOne({ email: user });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const newComment = {
      text,
      user: userId._id,
      time: new Date(),
    };

    task.comments.push(newComment);
    await task.save();

    // Populate the user info for the new comment
    const populatedTask = await Task.findById(req.params.taskId).populate({
      path: "comments.user",
      select: "firstName lastName avatar",
      match: { _id: userId._id },
    });

    const createdComment = populatedTask.comments[populatedTask.comments.length - 1];
    res.status(201).json(createdComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const comment = task.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // In real app: check if user is the owner or admin
    // For now, just allow deletion
    task.comments = task.comments.filter(
      (c) => c._id.toString() !== req.params.commentId
    );
    await task.save();

    res.json({ message: "Comment deleted" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Upload attachment
exports.uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    task.attachments.push(fileUrl);
    await task.save();

    res.json({ url: fileUrl });
  } catch (error) {
    console.error("Error uploading attachment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete attachment
exports.deleteAttachment = async (req, res) => {
  try {
    const { url } = req.body;
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.attachments = task.attachments.filter((a) => a !== url);
    await task.save();

    const filePath = path.join(__dirname, "..", url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: "Attachment deleted" });
  } catch (error) {
    console.error("Error deleting attachment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Upload cover photo
exports.uploadCoverPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    if (task.coverPhoto && task.coverPhoto.startsWith("/uploads/")) {
      const oldFilePath = path.join(__dirname, "..", task.coverPhoto);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    task.coverPhoto = fileUrl;
    await task.save();

    res.json({ url: fileUrl });
  } catch (error) {
    console.error("Error uploading cover photo:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update cover (for color or URL)
exports.updateCoverPhoto = async (req, res) => {
  try {
    const { coverPhoto } = req.body;
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (
      task.coverPhoto &&
      task.coverPhoto.startsWith("/uploads/") &&
      coverPhoto !== task.coverPhoto
    ) {
      const oldFilePath = path.join(__dirname, "..", task.coverPhoto);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    task.coverPhoto = coverPhoto;
    await task.save();

    res.json(task);
  } catch (error) {
    console.error("Error updating cover photo:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Move task to a different list
exports.moveTask = async (req, res) => {
  try {
    const { taskListId } = req.body;
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const destinationList = await TaskList.findById(taskListId);
    if (!destinationList) {
      return res.status(404).json({ message: "Destination list not found" });
    }

    const originalList = await TaskList.findById(task.taskListId);
    if (originalList) {
      originalList.tasks = originalList.tasks.filter(
        (t) => t.toString() !== req.params.taskId
      );
      await originalList.save();
    }

    if (!destinationList.tasks.includes(req.params.taskId)) {
      destinationList.tasks.push(req.params.taskId);
      await destinationList.save();
    }

    task.taskListId = taskListId;
    await task.save();

    res.json(task);
  } catch (error) {
    console.error("Error moving task:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete/Archive task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await TaskList.findByIdAndUpdate(
      task.taskListId,
      { $pull: { tasks: req.params.taskId } }
    );

    await Task.findByIdAndDelete(req.params.taskId);

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add/remove members from a task
exports.updateTaskMembers = async (req, res) => {
  try {
    const { userId, action } = req.body;

    if (!["add", "remove"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (action === "add" && !task.assignedTo.includes(userId)) {
      task.assignedTo.push(userId);
    } else if (action === "remove") {
      task.assignedTo = task.assignedTo.filter(id => id.toString() !== userId);
    }

    await task.save();

    const updatedTask = await Task.findById(req.params.taskId)
      .populate("assignedTo", "firstName lastName avatar");

    res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task members:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all available users for assignment
exports.getAvailableUsers = async (req, res) => {
  try {
    const users = await User.find({}, "firstName lastName avatar");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};