const TaskList = require('../models/TaskList');
const Task = require('../models/Task');
const User = require('../models/User');

// Get a specific TaskList by ID
exports.getTaskListById = async (req, res) => {
  try {
    const { taskListId } = req.params;
    const taskList = await TaskList.findById(taskListId);

    if (!taskList) {
      return res.status(404).json({ error: 'TaskList not found' });
    }

    res.status(200).json(taskList);
  } catch (error) {
    console.error('Error fetching task list:', error);
    res.status(500).json({ error: 'Failed to fetch task list' });
  }
};

// Get all TaskLists for a user
exports.getTaskLists = async (req, res) => {
  const { userEmail } = req.query;
  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(400).json({ message: "User not found" });

    const taskLists = await TaskList.find({ createdBy: user._id });
    res.json(taskLists);
  } catch (error) {
    console.error('Error fetching task lists:', error);
    res.status(500).json({ message: 'Failed to fetch task lists' });
  }
};

// Create a new TaskList
exports.createTaskList = async (req, res) => {
  const { title, cards, createdBy } = req.body;
  try {
    const create = await User.findOne({ email: createdBy });
    if (!title || !cards || !create) {
      return res.status(400).json({ message: 'Title and cards are required' });
    }
    const newTaskList = new TaskList({
      name: title,
      createdBy: create._id,
      createdAt: Date.now(),
      tasks: cards,
    });
    const savedList = await newTaskList.save();
    res.status(201).json(savedList);
  } catch (error) {
    console.error('Error adding new task list:', error);
    res.status(500).json({ message: 'Failed to add a new task list' });
  }
};