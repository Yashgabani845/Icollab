import React, { useState, useEffect } from "react";
import Task from "./Task";
import "../../CSS/Task/taskList.css";

const TaskList = ({ tasks, lname }) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "Medium",
  });
  const [error, setError] = useState(null);
  const [tasksList, setTasksList] = useState(tasks); // Track tasks in the state

  useEffect(() => {
    if (tasksList.length === 0) {
      setTasksList(tasks); // Initial tasks list
    }

    const fetchTasks = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/tasks?taskListName=${lname}&userEmail=${localStorage.email}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }

        const data = await response.json();
        setTasksList(data); // Store the tasks in state
        setIsLoading(false); // Data fetched, stop loading
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setError(error.message); // Set the error message
        setIsLoading(false); // Stop loading in case of error
      }
    };

    fetchTasks();
  }, [lname, localStorage.email]); // Only re-fetch if taskListName or userEmail changes

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prevTask) => ({
      ...prevTask,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const taskData = {
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      createdBy: localStorage.email,
      Tasklist: lname,
    };

    try {
      const response = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error("Failed to add task");
      }

      const data = await response.json();
      console.log("Task added:", data);

      // Add the newly created task to the local tasks list
      setTasksList((prevTasks) => [...prevTasks, data]);

      // Clear the form
      setIsAddingTask(false);
    } catch (error) {
      console.error("Error adding task:", error);
      setError("Failed to add task");
    }
  };

  return (
    <div className="task-list-container">
      <h2>{lname}</h2>
      {tasksList.length === 0 ? (
        <p className="empty-state">No tasks available</p>
      ) : (
        <div className="task-list">
          {tasksList.map((task) => (
          <Task
          key={task._id}  // Use `_id` because MongoDB stores `_id` instead of `id`
          taskId={task._id} // Ensure `taskId` is passed
          title={task.title}
          description={task.description}
          taskListId={task.taskListId} // Make sure this exists in your Task schema
         
        />
          ))}
        </div>
      )}

      {/* Add Task Button */}
      <button onClick={() => setIsAddingTask(true)} className="add-task-btn">
        Add Task
      </button>

      {/* Task Add Form */}
      {isAddingTask && (
        <div className="add-task-form">
          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newTask.title}
                onChange={handleInputChange}
                placeholder="Enter task title"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={newTask.description}
                onChange={handleInputChange}
                placeholder="Enter task description"
              />
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={newTask.priority}
                onChange={handleInputChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                Add Task
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setIsAddingTask(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TaskList;
